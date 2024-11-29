import { app } from "../../../utils/comfyapp";
import { BaseMessage } from './BaseMessage';
import { ChatResponse, Workflow } from "../../../types/types";

interface WorkflowOptionProps {
    content: string;
    name?: string;
    avatar: string;
    onOptionClick?: (option: string) => void;
}

export function WorkflowOption({ content, name = 'Assistant', avatar, onOptionClick }: WorkflowOptionProps) {
    const response = JSON.parse(content) as ChatResponse;
    
    return (
        <BaseMessage avatar={avatar} name={name}>
            <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 text-sm whitespace-pre-wrap">
                    {response.text && <p>{response.text}</p>}
                </div>
                {response.recommend_workflows && response.recommend_workflows.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        {response.recommend_workflows.map((workflow: Workflow, index: number) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                                {workflow.image && (
                                    <img
                                        src={workflow.image}
                                        alt={workflow.name}
                                        className="w-14 h-14 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex-1 break-words flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-sm">{workflow.name}</h3>
                                        {workflow.description && (
                                            <p className="text-gray-600 text-xs">{workflow.description}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        {workflow.workflow ? (
                                            <button
                                                onClick={async () => {
                                                    app.loadGraphData(JSON.parse(workflow.workflow));
                                                }}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onOptionClick?.(workflow.name || '')}
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