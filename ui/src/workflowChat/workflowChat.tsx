import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Message } from "../types/types";
import { WorkflowChatAPI } from "../apis/workflowChatApi";
import { app } from "../utils/comfyapp";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import { SelectedNodeInfo } from "../components/chat/SelectedNodeInfo";
import { MessageList } from "../components/chat/MessageList";

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
                <ChatHeader 
                    onClose={onClose}
                    onClear={handleClearMessages}
                    hasMessages={messages.length > 0}
                />
                
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={messageDivRef}>
                    <MessageList 
                        messages={messages}
                        onOptionClick={handleOptionClick}
                    />
                </div>

                <div className="border-t px-4 py-3 border-gray-200 bg-white sticky bottom-0">
                    {selectedNodeInfo && (
                        <SelectedNodeInfo 
                            nodeInfo={selectedNodeInfo}
                            onQueryClick={setInput}
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