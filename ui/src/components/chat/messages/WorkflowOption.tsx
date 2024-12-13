import { app } from "../../../utils/comfyapp";
import { BaseMessage } from './BaseMessage';
import { ChatResponse, Workflow } from "../../../types/types";
import { WorkflowChatAPI } from "../../../apis/workflowChatApi";
import { MemoizedReactMarkdown } from "../../markdown";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';

interface WorkflowOptionProps {
    content: string;
    name?: string;
    avatar: string;
    latestInput: string;
}

export function WorkflowOption({ content, name = 'Assistant', avatar, latestInput }: WorkflowOptionProps) {
    const response = JSON.parse(content) as ChatResponse;
    const workflows = response.ext?.find(item => item.type === 'workflow')?.data || [];
    
    const handleAcceptWorkflow = async (workflow: Workflow) => {
        if (!workflow.id) {
            console.error('No workflow id provided');
            return;
        }

        try {
            // 获取优化后的工作流
            const optimizedResult = await WorkflowChatAPI.getOptimizedWorkflow(
                workflow.id,
                latestInput
            );

            // 加载优化后的工作流
            if (optimizedResult.workflow) {
                app.loadGraphData(optimizedResult.workflow);
                
                // 应用优化后的参数 [节点id，节点名称，参数id，参数名称，参数默认值]
                for (const [nodeId, nodeName, paramIndex, paramName, value] of optimizedResult.optimized_params) {
                    //app.graph._nodes_by_id[30].widgets[3].value=8
                    const widgets = app.graph._nodes_by_id[nodeId].widgets
                    for (const widget of widgets) {
                        if (widget.name === paramName) {
                            widget.value = value
                        }
                    }
                }
                app.graph.setDirtyCanvas(false, true)
            }
        } catch (error) {
            console.error('Failed to optimize workflow:', error);
        }
    };
    
    return (
        // <BaseMessage avatar={avatar} name={name}>
            <div className="space-y-3">
                {workflows.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        {workflows.map((workflow: Workflow, index: number) => (
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
                                        <h3 className="font-medium text-xs">{workflow.name}</h3>
                                        {workflow.description && (
                                            <p className="text-gray-600 text-xs">{workflow.description}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleAcceptWorkflow(workflow)}
                                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        // </BaseMessage>
    );
} 