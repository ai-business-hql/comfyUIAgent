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
        setLatestInput(input);

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            for await (const response of WorkflowChatAPI.streamInvokeServer(sessionId, input)) {
                const aiMessage: Message = {
                    id: crypto.randomUUID(),
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
                        transition-all duration-300 ease-in-out hover:shadow-xl text-gray-700" style={{ display: visible ? 'block' : 'none' }}>
            <div className="flex h-full flex-col">
                <ChatHeader 
                    onClose={onClose}
                    onClear={handleClearMessages}
                    hasMessages={messages.length > 0}
                />
                
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={messageDivRef}>
                    <MessageList 
                        messages={messages}
                        latestInput={latestInput}
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