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
                                                const nodes = node.json.nodes;
                                                const links = node.json.links;
                                                const selectedNode = Object.values(app.canvas.selected_nodes)[0];

                                                if (selectedNode) {
                                                    // 计算每个节点的入度
                                                    const inDegrees = {};
                                                    nodes.forEach(node => inDegrees[node.id] = 0);
                                                    links.forEach(link => {
                                                        const targetId = link['target_id'];
                                                        inDegrees[targetId] = (inDegrees[targetId] || 0) + 1;
                                                    });

                                                    // 找到入度为0且类型匹配的起点节点
                                                    const entryNodeId = nodes.find(node => 
                                                        inDegrees[node.id] === 0 && 
                                                        node.type === selectedNode.comfyClass
                                                    )?.id;

                                                    const nodeMap = {};
                                                    // 将selectedNode作为入口节点
                                                    if (entryNodeId) {
                                                        nodeMap[entryNodeId] = selectedNode;
                                                    }
                                                    
                                                    // 创建其他所有节点
                                                    for (const node of nodes) {
                                                        if (node.id !== entryNodeId) {
                                                            nodeMap[node.id] = app.addNodeOnGraph({ name: node.type }, {pos: node.pos});
                                                        }
                                                    }

                                                    // 处理所有连接
                                                    for (const link of links) {
                                                        const origin_node = nodeMap[link['origin_id']];
                                                        const target_node = nodeMap[link['target_id']];
                                                        
                                                        if (origin_node && target_node) {
                                                            origin_node.connect(link['origin_slot'], target_node, link['target_slot']);
                                                        }
                                                    }
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
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
} 