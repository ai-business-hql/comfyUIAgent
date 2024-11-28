import { app } from "../../../utils/comfyapp";
import { BaseMessage } from './BaseMessage';

interface WorkflowOptionProps {
    content: string;
    name?: string;
    avatar: string;
    onOptionClick?: (option: string) => void;
}

export function WorkflowOption({ content, name = 'Assistant', avatar, onOptionClick }: WorkflowOptionProps) {
    const parsedContent = JSON.parse(content);
    
    return (
        <BaseMessage avatar={avatar} name={name}>
            <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 text-sm whitespace-pre-wrap">
                    {parsedContent.ai_message && <p>{parsedContent.ai_message}</p>}
                </div>
                {parsedContent.options && parsedContent.options.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        {parsedContent.options.map((option: any, index: number) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                                {option.thumbnail && (
                                    <img
                                        src={option.thumbnail}
                                        alt={option.name}
                                        className="w-14 h-14 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex-1 break-words flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-sm">{option.name || option}</h3>
                                        {option.description && (
                                            <p className="text-gray-600 text-xs">{option.description}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        {option.workflow ? (
                                            <button
                                                onClick={async () => {
                                                    app.loadGraphData(JSON.parse(option.workflow));
                                                }}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onOptionClick?.(option)}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Select
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BaseMessage>
    );
} 