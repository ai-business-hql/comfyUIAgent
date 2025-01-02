interface BaseMessageProps {
    name: string;
    isUser?: boolean;
    children: React.ReactNode;
}

export function BaseMessage({ name, isUser = false, children }: BaseMessageProps) {
    return (
        <div className="flex flex-col w-full items-start gap-2 py-2 animate-fadeIn">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
} 