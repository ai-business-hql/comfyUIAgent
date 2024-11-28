import { Message } from "../../types/types";
import { UserMessage } from "./messages/UserMessage";
import { AIMessage } from "./messages/AIMessage";
import { WorkflowOption } from "./messages/WorkflowOption";
import { NodeSearch } from "./messages/NodeSearch";
import { NodeRecommend } from "./messages/NodeRecommend";

interface MessageListProps {
    messages: Message[];
    onOptionClick: (option: string) => void;
}

const getAvatar = (name?: string) => {
    return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`;
};

export function MessageList({ messages, onOptionClick }: MessageListProps) {
    const renderMessage = (message: Message) => {
        if (message.role === 'user') {
            return <UserMessage key={message.id} content={message.content} name={message.name} />;
        }

        if (message.role === 'ai' || message.role === 'tool') {
            const avatar = getAvatar(message.role);
            
            switch (message.type) {
                case 'message':
                    return (
                        <AIMessage 
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                            format={message.format}
                        />
                    );
                case 'workflow_option':
                    return (
                        <WorkflowOption
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                            onOptionClick={onOptionClick}
                        />
                    );
                case 'node_search':
                    return (
                        <NodeSearch
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                case 'downstream_node_recommend':
                    return (
                        <NodeRecommend
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                default:
                    return null;
            }
        }

        return null;
    };

    return (
        <div className="grid gap-4">
            {messages.map(renderMessage)}
        </div>
    );
} 