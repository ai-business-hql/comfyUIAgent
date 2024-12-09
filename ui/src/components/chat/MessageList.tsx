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

export function MessageList({ messages, latestInput, onOptionClick }: MessageListProps) {
    const renderMessage = (message: Message) => {
        if (message.role === 'user') {
            return <UserMessage key={message.id} content={message.content} name={message.name} />;
        }

        if (message.role === 'ai' || message.role === 'tool') {
            const avatar = getAvatar(message.role);
            
            try {
                const response = JSON.parse(message.content);
                const messageType = response.ext?.find(item => item.type === 'message');
                const workflowType = response.ext?.find(item => item.type === 'workflow');
                const nodeType = response.ext?.find(item => item.type === 'node');
                
                // 根据ext中的类型来决定渲染哪个组件
                if (workflowType) {
                    return (
                        <WorkflowOption
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                            latestInput={latestInput}
                            // onOptionClick={onOptionClick}
                        />
                    );
                }
                
                if (nodeType?.data?.some((node: any) => node.is_existed)) {
                    return (
                        <NodeRecommend
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                }
                
                if (nodeType) {
                    return (
                        <NodeSearch
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                }
                
                // 默认使用AIMessage
                return (
                    <AIMessage 
                        key={message.id}
                        content={message.content}
                        name={message.name}
                        avatar={avatar}
                        format={message.format}
                        onOptionClick={onOptionClick}
                    />
                );
            } catch {
                // 如果解析JSON失败,使用AIMessage
                return (
                    <AIMessage 
                        key={message.id}
                        content={message.content}
                        name={message.name}
                        avatar={avatar}
                        format={message.format}
                        onOptionClick={onOptionClick}
                    />
                );
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