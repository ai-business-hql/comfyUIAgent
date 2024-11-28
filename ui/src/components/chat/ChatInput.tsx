import { ChangeEvent, KeyboardEvent } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
    input: string;
    loading: boolean;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    onKeyPress: (event: KeyboardEvent) => void;
}

export function ChatInput({ input, loading, onChange, onSend, onKeyPress }: ChatInputProps) {
    return (
        <div className="relative">
            <textarea
                onChange={onChange}
                onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                    }
                    onKeyPress(e);
                }}
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
                onClick={onSend}
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
    );
} 