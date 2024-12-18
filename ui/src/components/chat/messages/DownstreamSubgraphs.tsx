import { app } from "../../../utils/comfyapp";
import { useState } from 'react';
import { ChatResponse, Node, Subgraph } from "../../../types/types";

interface DownstreamSubgraphsProps {
    content: string;
    name?: string;
    avatar: string;
    installedNodes: any[];
}

export function DownstreamSubgraphs({ content, name = 'Assistant', avatar, installedNodes }: DownstreamSubgraphsProps) {
    const response = JSON.parse(content) as ChatResponse;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const nodes = response.ext?.find(item => item.type === 'downstream_subgraph_search')?.data || [];

    return (
        <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-xs break-words overflow-visible">
            {nodes.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs">Recommended downstream subgraphs that can be connected:</p>
                    <div className="flex flex-wrap gap-2">
                        {nodes.map((node: Subgraph) => {
                            return (
                                <div key={node.name} className="relative group">
                                    <button
                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-md 
                                                     hover:bg-blue-600 transition-colors text-xs"
                                            onClick={() => {
                                                localStorage.setItem('litegrapheditor_clipboard', JSON.stringify(node.json));
                                                app.canvas.pasteFromClipboard();
                                                // todo: 子图和上游节点连接
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
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
} 