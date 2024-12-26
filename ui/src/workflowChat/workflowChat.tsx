import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Message } from "../types/types";
import { WorkflowChatAPI } from "../apis/workflowChatApi";
import { app } from "../utils/comfyapp";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import { SelectedNodeInfo } from "../components/chat/SelectedNodeInfo";
import { MessageList } from "../components/chat/MessageList";
import { generateUUID } from "../utils/uuid";
import { getInstalledNodes, getObjectInfo } from "../apis/comfyApiCustom";

interface WorkflowChatProps {
    onClose?: () => void;
    visible?: boolean;
}

export default function WorkflowChat({ onClose, visible = true }: WorkflowChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [latestInput, setLatestInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>();
    const messageDivRef = useRef<HTMLDivElement>(null);
    const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>(null);
    const [installedNodes, setInstalledNodes] = useState<any[]>([]);

    useEffect(() => {
        if (messageDivRef.current) {
            messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const fetchInstalledNodes = async () => {
            console.log('[WorkflowChat] Fetching installed nodes');
            const nodes = await getInstalledNodes();
            console.log('[WorkflowChat] Received installed nodes:', nodes);
            setInstalledNodes(nodes);
        };
        fetchInstalledNodes();
    }, []);

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
            sid = generateUUID();
            setSessionId(sid);
            localStorage.setItem("sessionId", sid);
        }
    }, []);

    useEffect(() => {
        const handleNodeSelection = () => {
            const selectedNodes = app.canvas.selected_nodes;
            if (Object.keys(selectedNodes ?? {}).length) {
                // Object.values(app.canvas.selected_nodes)[0].comfyClass
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

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    }

    const handleSendMessage = async () => {
        if ((input.trim() === "" && !selectedNodeInfo) || !sessionId) return;
        setLoading(true);
        setLatestInput(input);

        const userMessage: Message = {
            id: generateUUID(),
            role: "user",
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            for await (const response of WorkflowChatAPI.streamInvokeServer(sessionId, input)) {
                const aiMessage: Message = {
                    id: generateUUID(),
                    role: "ai",
                    content: JSON.stringify(response),
                    type: response.type,
                    format: response.format,
                    finished: response.finished,
                    name: "Assistant"
                };

                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'ai') {
                        return [...prev.slice(0, -1), aiMessage];
                    }
                    return [...prev, aiMessage];
                });

                if (response.finished) {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
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
        const newSessionId = generateUUID();
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

    const handleSendMessageWithIntent = async (intent: string, ext?: any) => {
        if (!sessionId || !selectedNodeInfo) return;
        setLoading(true);

        const userMessage: Message = {
            id: generateUUID(),
            role: "user",
            content: selectedNodeInfo.comfyClass,
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            for await (const response of WorkflowChatAPI.streamInvokeServer(sessionId, selectedNodeInfo.comfyClass, intent, ext)) {
                const aiMessage: Message = {
                    id: generateUUID(),
                    role: "ai",
                    content: JSON.stringify(response),
                    format: response.format,
                    finished: response.finished,
                    name: "Assistant"
                };

                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'ai') {
                        return [...prev.slice(0, -1), aiMessage];
                    }
                    return [...prev, aiMessage];
                });

                if (response.finished) {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setLoading(false);
        }
    };

    const handleAddMessage = (message: Message) => {
        console.log('[WorkflowChat] Adding new message:', message);
        setMessages(prev => {
            const newMessages = [...prev, message];
            console.log('[WorkflowChat] Updated messages:', newMessages);
            return newMessages;
        });
    };

    return (

        <div className="fixed top-0 right-0 h-full w-1/3 shadow-lg bg-white
                        transition-all duration-300 ease-in-out hover:shadow-xl text-gray-700" style={{ display: visible ? 'block' : 'none' }}>
            <div className="flex h-full flex-col">
                <ChatHeader 
                    onClose={onClose}
                    onClear={handleClearMessages}
                    hasMessages={messages.length > 0}
                />
                <div>
                    {installedNodes.map((node: any) => (
                        <div key={node.name}>{node.name}</div>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={messageDivRef}>
                    <MessageList 
                        messages={messages}
                        latestInput={latestInput}
                        onOptionClick={handleOptionClick}
                        installedNodes={installedNodes}
                        onAddMessage={handleAddMessage}
                    />
                </div>

                <div className="border-t px-4 py-3 border-gray-200 bg-white sticky bottom-0">
                    {selectedNodeInfo && (
                        <SelectedNodeInfo 
                            nodeInfo={selectedNodeInfo}
                            onSendWithIntent={handleSendMessageWithIntent}
                            loading={loading}
                        />
                    )}

                    <ChatInput 
                        input={input}
                        loading={loading}
                        onChange={handleMessageChange}
                        onSend={handleSendMessage}
                        onKeyPress={handleKeyPress}
                    />
                </div>
            </div>
        </div>
    );
}