interface BaseMessageProps {
    avatar: string;
    name: string;
    isUser?: boolean;
    children: React.ReactNode;
}

export function BaseMessage({ avatar, name, isUser = false, children }: BaseMessageProps) {
    return (
        <div className={`flex items-start gap-3 break-words animate-fadeIn ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                    <img
                        src={avatar}
                        alt={name}
                        width="40"
                        height="40"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
                <div className="text-xs text-gray-700">{name}</div>
                {children}
            </div>
            {isUser && (
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 
                             flex items-center justify-center">
                    <span className="text-gray-700">You</span>
                </div>
            )}
        </div>
    );
} 