import { XIcon, TrashIcon } from './Icons';

interface ChatHeaderProps {
    onClose?: () => void;
    onClear: () => void;
    hasMessages: boolean;
}

export function ChatHeader({ onClose, onClear, hasMessages }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b px-4 py-3 
                       bg-white border-gray-200 sticky top-0 z-10">
            <h3 className="text-lg font-medium text-gray-800">Chat</h3>
            <div className="flex items-center gap-1">
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 
                             text-gray-500 hover:bg-gray-100 hover:text-gray-600 
                             disabled:opacity-50 transition-colors duration-200"
                    disabled={!hasMessages}
                    onClick={onClear}>
                    <TrashIcon className="h-5 w-5" />
                </button>
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 
                             text-gray-500 hover:bg-gray-100 hover:text-gray-600 
                             transition-colors duration-200"
                    onClick={onClose}>
                    <XIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
} 