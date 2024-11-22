import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Message } from "../types/types";
import { marked } from "marked";

interface WorkflowChatProps {
    onClose?: () => void;
}

export default function WorkflowChat({ onClose }: WorkflowChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const messageDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageDivRef.current) {
            messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight
        }
    }, [messages])

    const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    }

    const handleSendMessage = () => {
        if (input.trim() === "") return;
        setLoading(true)
        
        const newMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
            toolCalls: {}
        };
        
        setMessages([...messages, newMessage]);
        setInput("");
        setLoading(false);
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.metaKey && event.key === "Enter") {
            handleSendMessage();
        }
    }

    const handleClearMessages = () => {
        setMessages([]);
    };

    const convertToInitials = (snakeCaseName: string) => {
        return snakeCaseName
            .split('_')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    }

    const getMarkdownText = (markdownText: string) => {
        const rawMarkup = marked.parse(markdownText);
        return { __html: rawMarkup };
    };

    const avatar = (name?: string) => {
        if (name) {
            return `/avatar/${name}.jpg`;
        } else {
            return '/avatar/id.jpg';
        }
    }

    const handleClose = () => {
        onClose?.();
    };

    const handleOptionClick = (option: string) => {
        const newMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: option,
            toolCalls: {}
        };
        
        setMessages([...messages, newMessage]);
    };

    return (
        <div className="fixed top-0 right-0 h-full w-2/3 max-w-full shadow-lg bg-white "  style={{ backgroundColor: 'white' }}>
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3 border-gray-200" style={{ backgroundColor: 'gray' }}>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-800">Chat</h3>
                    <div className="flex items-center gap-1">
                        <button 
                            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-100"
                            disabled={messages.length === 0}
                            onClick={handleClearMessages}>
                            <TrashIcon className="h-5 w-5" />
                        </button>
                        <button 
                            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-100"
                            onClick={handleClose}>
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4" ref={messageDivRef}>
                    <div className="grid gap-4">
                        {messages.map((message) =>
                        (message.role === 'ai' || message.role === 'tool' ?
                            <div className="flex items-start gap-3" key={message.id}>
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <img 
                                        src={avatar(message.name)} 
                                        alt={message.name ? message.name : ''} 
                                        width="40" 
                                        height="40"
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                                        {message.name ? convertToInitials(message.name) : 'AI'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm">{message.name ? message.name : 'Assistant'}</div>
                                    <div className="rounded-lg bg-gray-100 p-3 text-sm">
                                        {message.toolCalls && Object.keys(message.toolCalls).length > 0 ?
                                            <div>
                                                {Object.keys(message.toolCalls).map((key) => {
                                                    const toolCall = message.toolCalls[key];
                                                    return (
                                                        <div key={toolCall.toolCallId}>
                                                            <p className="text-xs text-gray-500 ">
                                                                tool: {toolCall.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 ">
                                                                args: {JSON.stringify(toolCall.args)}
                                                            </p>
                                                            {toolCall.result &&
                                                                <p className="text-xs text-gray-500 ">
                                                                    result: {JSON.stringify(toolCall.result)}
                                                                </p>
                                                            }
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            :
                                            null
                                        }
                                        {message.content ? (
                                            (() => {
                                                try {
                                                    const parsedContent = JSON.parse(message.content);
                                                    return (
                                                        <>
                                                            {parsedContent.ai_message && <p>{parsedContent.ai_message}</p>}
                                                            {parsedContent.options && parsedContent.options.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {parsedContent.options.slice(0, 3).map((option: string, index: number) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={() => handleOptionClick(option)}
                                                                            className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                                                        >
                                                                            {option}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                } catch {
                                                    // If JSON.parse fails, render as markdown
                                                    return <p dangerouslySetInnerHTML={getMarkdownText(message.content)}></p>;
                                                }
                                            })()
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="flex items-start gap-3 justify-end" key={message.id}>
                                <div>
                                    <div
                                        className="text-sm text-right">{message.name ? message.name : 'User'}</div>
                                    <div className="rounded-lg bg-blue-500 p-3 text-sm text-white">
                                        <p>{message.content}</p>
                                    </div>
                                </div>
                                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                                    <span>You</span>
                                </div>
                            </div>
                        )
                        )}
                    </div>
                </div>
                <div className="border-t px-4 py-3 border-gray-200 ">
                    <div className="relative">
                        <textarea
                            onChange={handleMessageChange}
                            onKeyDown={handleKeyPress}
                            value={input}
                            placeholder="Type your message..."
                            className="min-h-[80px] w-full resize-none rounded-lg border border-gray-200 px-3 py-2 pr-12 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-200"
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                            Tip: Press <kbd>Cmd</kbd> + <kbd>Enter</kbd> to send
                        </div>
                        <button
                            type="submit"
                            onClick={handleSendMessage}
                            disabled={loading}
                            className="absolute bottom-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-3 w-3" />
                            ) : (
                                <>
                                    <SendIcon className="h-5 w-5" style={{ color: 'gray' }} />
                                    {/* <span className="sr-only" style={{ color: 'gray' }}>Send</span> */}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
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