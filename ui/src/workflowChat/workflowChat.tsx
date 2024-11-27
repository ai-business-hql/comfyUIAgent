import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Message } from "../types/types";
import { WorkflowChatAPI } from "../apis/workflowChatApi";
import { app } from "../utils/comfyapp";
import ReactMarkdown from 'react-markdown';


interface WorkflowChatProps {
    onClose?: () => void;
}

export default function WorkflowChat({ onClose }: WorkflowChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>();
    const messageDivRef = useRef<HTMLDivElement>(null);
    const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);

    useEffect(() => {
        if (messageDivRef.current) {
            messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight
        }
    }, [messages])

    // 获取历史消息
    const fetchMessages = async (sid: string) => {
        try {
            const data = await WorkflowChatAPI.fetchMessages(sid);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        let sid = localStorage.getItem("sessionId");
        if (sid) {
            setSessionId(sid);
            fetchMessages(sid);
        } else {
            sid = crypto.randomUUID();
            setSessionId(sid);
            localStorage.setItem("sessionId", sid);
        }
    }, []);

    useEffect(() => {
        const handleNodeSelection = () => {
            const selectedNodes = app.canvas.selected_nodes;
            if (Object.keys(selectedNodes ?? {}).length) {
                // Get the first selected node's info
                const nodeInfo = Object.values(selectedNodes)[0];
                setSelectedNodeInfo(nodeInfo);
            } else {
                setSelectedNodeInfo(null);
            }
        };

        // Add event listeners
        document.addEventListener("click", handleNodeSelection);

        // Cleanup
        return () => {
            document.removeEventListener("click", handleNodeSelection);
        };
    }, []);

    const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    }

    const handleSendMessage = async () => {
        if ((input.trim() === "" && !selectedNodeInfo) || !sessionId) return;
        setLoading(true);

        const newMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
            toolCalls: {}
        };

        setMessages([...messages, newMessage]);
        setInput("");

        try {
            let currentAiMessage: Message | null = null;
            let accumulatedContent = '';

            for await (const chunk of WorkflowChatAPI.streamMessage(sessionId, input)) {
                if (chunk.is_chunk) {
                    // 处理流式内容
                    accumulatedContent += chunk.content;
                    if (currentAiMessage) {
                        const updatedMessage = { ...currentAiMessage };
                        if (updatedMessage.type === 'message') {
                            updatedMessage.content = accumulatedContent;
                        } else {
                            const content = JSON.parse(updatedMessage.content || '{}');
                            content.ai_message = accumulatedContent;
                            updatedMessage.content = JSON.stringify(content);
                        }
                        // 使用消息ID来更新现有消息
                        setMessages(prev => prev.map(msg =>
                            msg.id === updatedMessage.id ? updatedMessage : msg
                        ));
                    }
                } else {
                    // 处理完整消息或初始消息结构
                    currentAiMessage = chunk;
                    if (chunk.type === 'message' || chunk.type === 'workflow_option') {
                        try {
                            const content = JSON.parse(chunk.content || '{}');
                            accumulatedContent = content.ai_message || '';
                        } catch {
                            accumulatedContent = chunk.content || '';
                        }
                    }
                    // 检查是否已存在相同ID的消息
                    setMessages(prev => {
                        const messageExists = prev.some(msg => msg.id === chunk.id);
                        if (messageExists) {
                            return prev.map(msg => msg.id === chunk.id ? chunk : msg);
                        }
                        return [...prev, chunk];
                    });
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.metaKey && event.key === "Enter") {
            handleSendMessage();
        }
    }

    const handleClearMessages = () => {
        setMessages([]);
        localStorage.removeItem("sessionId");
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        localStorage.setItem("sessionId", newSessionId);
    };

    const avatar = (name?: string) => {
        return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`;
    }

    const handleClose = () => {
        onClose?.();
    };

    const handleOptionClick = (option: string) => {
        setInput(option);
    };

    return (
        <div className="fixed top-0 right-0 h-full w-1/3 shadow-lg bg-white
                        transition-all duration-300 ease-in-out hover:shadow-xl text-gray-700">
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3 
                               bg-white border-gray-200 sticky top-0 z-10">
                    <h3 className="text-lg font-medium text-gray-800">Chat</h3>
                    <div className="flex items-center gap-1">
                        <button
                            className="inline-flex items-center justify-center rounded-md p-2 
                                     text-gray-500 hover:bg-gray-100 hover:text-gray-600 
                                     disabled:opacity-50 transition-colors duration-200"
                            disabled={messages.length === 0}
                            onClick={handleClearMessages}>
                            <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-md p-2 
                                     text-gray-500 hover:bg-gray-100 hover:text-gray-600 
                                     transition-colors duration-200"
                            onClick={handleClose}>
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={messageDivRef}>
                    <div className="grid gap-4">
                        {messages.map((message) => (
                            message.role === 'ai' || message.role === 'tool' ? (
                                <div className="flex items-start gap-3 break-words animate-fadeIn" 
                                     key={message.id}>
                                    <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                                        <img
                                            src={avatar(message.role)}
                                            alt={message.role ? message.role : ''}
                                            width="40"
                                            height="40"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700">{message.name ? message.name : 'Assistant'}</div>
                                        {message.type === 'message' && (
                                            <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-sm 
                                                          break-words overflow-hidden">
                                                {message.content ? (
                                                    (() => {
                                                        try {
                                                            const parsedContent = JSON.parse(message.content);
                                                            return (
                                                                <div className="space-y-3">
                                                                    {parsedContent.ai_message && (
                                                                        <p>
                                                                            {message.format === 'markdown' ? (
                                                                                <ReactMarkdown>{parsedContent.ai_message}</ReactMarkdown>
                                                                            ) : (
                                                                                parsedContent.ai_message
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                    {parsedContent.options && parsedContent.options.length > 0 && (
                                                                        <div className="flex flex-col space-y-2">
                                                                            {parsedContent.options.slice(0, 3).map((option: string, index: number) => (
                                                                                <button
                                                                                    key={index}
                                                                                    onClick={() => handleOptionClick(option)}
                                                                                    className="text-left px-4 py-2 rounded-md border border-gray-200 
                                                                                         hover:bg-gray-50 transition-colors duration-200 
                                                                                         text-xs text-gray-700 shadow-sm bg-white"
                                                                                >
                                                                                    {option}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        } catch {
                                                            return <p dangerouslySetInnerHTML={{ __html: message.content }}></p>;
                                                        }
                                                    })()
                                                ) : null}
                                            </div>
                                        )}
                                        {message.type === 'workflow_option' && (
                                            (() => {
                                                const parsedContent = JSON.parse(message.content);
                                                return (
                                                    <div className="space-y-3">
                                                        <div className="bg-green-50 p-3 text-sm">
                                                            {parsedContent.ai_message && <p>{parsedContent.ai_message}</p>}
                                                        </div>
                                                        {parsedContent.options && parsedContent.options.length > 0 && (
                                                            <div className="flex flex-col space-y-4">
                                                                {parsedContent.options.map((option: any, index: number) => (
                                                                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                                                                        <img
                                                                            src={option.thumbnail}
                                                                            alt={option.name}
                                                                            className="w-14 h-14 object-cover rounded-lg"
                                                                        />
                                                                        <div className="flex-1 break-words flex flex-col justify-between">
                                                                            <div>
                                                                                <h3 className="font-medium text-sm">{option.name}</h3>
                                                                                <p className="text-gray-600 text-xs">{option.description}</p>
                                                                            </div>
                                                                            <div className="flex justify-end mt-4">
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        app.loadGraphData(JSON.parse(option.workflow));
                                                                                    }}
                                                                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                                                                >
                                                                                    Accept
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                        {message.type === 'node_search' && (
                                            (() => {
                                                const parsedContent = JSON.parse(message.content);
                                                return (
                                                    <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-sm break-words overflow-hidden">
                                                        {parsedContent.existing_nodes && (
                                                            <div className="space-y-3">
                                                                <p>Available nodes that can be added to canvas:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {parsedContent.existing_nodes.map((node: any) => (
                                                                        <button
                                                                            key={node.name}
                                                                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md 
                                                                                     hover:bg-blue-600 transition-colors text-sm"
                                                                            onClick={() => {
                                                                                const addNode = app.addNodeOnGraph({ name: node.name });
                                                                                node.connect(0, addNode, 0);
                                                                            }}
                                                                        >
                                                                            {node.name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {parsedContent.non_existing_nodes && (
                                                            <div className="space-y-3 mt-4">
                                                                <p>Recommended nodes (requires installation):</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {parsedContent.non_existing_nodes.map((node: any) => (
                                                                        <a
                                                                            key={node.name}
                                                                            href={node.github_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md
                                                                                     hover:bg-gray-200 transition-colors text-sm border 
                                                                                     border-gray-200"
                                                                        >
                                                                            {node.name}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 justify-end animate-slideIn" 
                                     key={message.id}>
                                    <div>
                                        <div
                                            className="text-sm text-gray-700 text-right">{message.name ? message.name : 'User'}</div>
                                        <div className="rounded-lg bg-blue-50 p-3 text-gray-700 text-sm  break-words">
                                            <p>{message.content}</p>
                                        </div>
                                    </div>
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 
                                                 flex items-center justify-center">
                                        <span className="text-gray-700">You</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
                <div className="border-t px-4 py-3 border-gray-200 bg-white sticky bottom-0">
                    {selectedNodeInfo && (
                        <div className="mb-3 p-3 rounded-md bg-gray-50 border border-gray-200 
                                      transform transition-all duration-200 hover:shadow-md">
                            <h4 className="font-medium">Selected Node:</h4>
                            <div className="text-sm">
                                <p>Type: {selectedNodeInfo.type}</p>
                                <p>Title: {selectedNodeInfo.title || 'Untitled'}</p>
                            <div className="flex gap-2 mt-2">
                                <button 
                                    className="px-3 py-1 text-xs rounded-md bg-blue-50 
                                             hover:bg-blue-100 text-blue-700 transition-all 
                                             duration-200 hover:shadow-sm active:scale-95"
                                    onClick={() => setInput(`Explain how to use node: ${selectedNodeInfo.type}`)}>
                                    查询节点使用方法
                                </button>
                                <button
                                    className="px-3 py-1 text-xs rounded bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                                    onClick={() => setInput(`What are the parameters for node: ${selectedNodeInfo.type}`)}
                                >
                                    查询参数
                                </button>
                                <button
                                    className="px-3 py-1 text-xs rounded bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors"
                                    onClick={() => setInput(`Recommend downstream nodes for: ${selectedNodeInfo.type}`)}
                                >
                                    下游节点推荐
                                </button>
                            </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="relative">
                        <textarea
                            onChange={handleMessageChange}
                            onKeyDown={handleKeyPress}
                            value={input}
                            placeholder="Type your message..."
                            className="w-full min-h-[80px] resize-none rounded-md border 
                                     border-gray-200 px-3 py-2 pr-12 text-sm shadow-sm 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                     focus:border-transparent bg-white transition-all 
                                     duration-200 text-gray-700"
                        />
                        <button
                            type="submit"
                            onClick={handleSendMessage}
                            disabled={loading}
                            className="absolute bottom-3 right-3 p-2 rounded-md text-gray-500 
                                     hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 
                                     transition-all duration-200 active:scale-95">
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full 
                                              border-2 border-gray-300 border-t-blue-500" />
                            ) : (
                                <SendIcon className="h-5 w-5 transform transition-transform 
                                                   group-hover:translate-x-1" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SendIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}


function XIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}

function TrashIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}