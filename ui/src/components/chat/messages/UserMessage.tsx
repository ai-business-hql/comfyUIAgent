import { BaseMessage } from './BaseMessage';

interface UserMessageProps {
    content: string;
    name?: string;
}

export function UserMessage({ content, name = 'User' }: UserMessageProps) {
    return (
        <BaseMessage avatar="" name={name} isUser={true}>
            <div className="inline-block rounded-lg bg-blue-50 p-3 text-gray-700 text-sm break-words">
                <p>{content}</p>
            </div>
        </BaseMessage>
    );
} 