import { app } from "../../../utils/comfyapp";
import { BaseMessage } from './BaseMessage';
import { useState } from 'react';
import { ChatResponse, Node } from "../../../types/types";

interface NodeSearchProps {
    content: string;
    name?: string;
    avatar: string;
}

export function NodeSearch({ content, name = 'Assistant', avatar }: NodeSearchProps) {
    const response = JSON.parse(content) as ChatResponse;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const nodes = response.ext?.find(item => item.type === 'node')?.data || [];

    return (
        // <BaseMessage avatar={avatar} name={name}>
        <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-sm break-words overflow-visible">
            {nodes.length > 0 && (
                <div className="space-y-3">
                    <p>Available nodes that can be added to canvas:</p>
                    <div className="flex flex-wrap gap-2">
                        {nodes.map((node: Node) => (
                            <div key={node.name} className="relative group">
                                <button
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md 
                                                 hover:bg-blue-600 transition-colors text-xs"
                                    onClick={() => {
                                        const addNode = app.addNodeOnGraph({ name: node.name });
                                        if (addNode) {
                                            addNode.connect(node.from_index, addNode, node.to_index);
                                        }
                                    }}
                                    onMouseEnter={() => setHoveredNode(node.name)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {node.name}
                                </button>
                                {hoveredNode === node.name && node.description && (
                                    <div className="fixed transform -translate-y-full 
                                                    z-[9999] w-64 p-2 bg-gray-800 text-white text-xs 
                                                    rounded-md shadow-lg mb-2"
                                        style={{
                                            left: 'calc(var(--mouse-x, 0) + 16px)',
                                            top: 'calc(var(--mouse-y, 0) - 8px)'
                                        }}
                                    >
                                        {node.description}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                                                        border-4 border-transparent border-t-gray-800"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 