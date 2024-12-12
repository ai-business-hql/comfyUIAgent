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
                
                // 获取扩展类型
                const workflowExt = response.ext?.find(item => item.type === 'workflow');
                const nodeExt = response.ext?.find(item => item.type === 'node');
                const nodeRecommendExt = response.ext?.find(item => item.type === 'node_recommend');
                
                // 根据扩展类型添加对应组件
                let ExtComponent = null;
                if (workflowExt) {
                    ExtComponent = (
                        <WorkflowOption
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                            latestInput={latestInput}
                        />
                    );
                } else if (nodeRecommendExt) {
                    ExtComponent = (
                        <NodeRecommend
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                } else if (nodeExt) {
                    ExtComponent = (
                        <NodeSearch
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                        />
                    );
                }

                // 如果有response.text，使用AIMessage渲染
                if (response.text) {
                    return (
                        <AIMessage 
                            key={message.id}
                            content={message.content}
                            name={message.name}
                            avatar={avatar}
                            format={message.format}
                            onOptionClick={onOptionClick}
                            extComponent={ExtComponent}
                        />
                    );
                }

                // 如果没有response.text但有扩展组件，直接返回扩展组件
                if (ExtComponent) {
                    return ExtComponent;
                }

                // 默认返回AIMessage
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