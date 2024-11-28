import { app } from "../../../utils/comfyapp";
import { BaseMessage } from './BaseMessage';

interface NodeSearchProps {
    content: string;
    name?: string;
    avatar: string;
}

export function NodeSearch({ content, name = 'Assistant', avatar }: NodeSearchProps) {
    const parsedContent = JSON.parse(content);
    
    return (
        <BaseMessage avatar={avatar} name={name}>
            <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-sm break-words overflow-hidden">
                {parsedContent.existing_nodes && (
                    <div className="space-y-3">
                        <p>Available nodes that can be added to canvas:</p>
                        <div className="flex flex-wrap gap-2">
                            {parsedContent.existing_nodes.map((node: any) => (
                                <button
                                    key={node.name}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md 
                                             hover:bg-blue-600 transition-colors text-sm"
                                    onClick={() => {
                                        const addNode = app.addNodeOnGraph({ name: node.name });
                                        node.connect(0, addNode, 0);
                                    }}
                                >
                                    {node.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {parsedContent.non_existing_nodes && (
                    <div className="space-y-3 mt-4">
                        <p>Recommended nodes (requires installation):</p>
                        <div className="flex flex-wrap gap-2">
                            {parsedContent.non_existing_nodes.map((node: any) => (
                                <a
                                    key={node.name}
                                    href={node.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md
                                             hover:bg-gray-200 transition-colors text-sm border 
                                             border-gray-200"
                                >
                                    {node.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BaseMessage>
    );
} 