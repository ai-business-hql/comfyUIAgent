import { app } from "../../../utils/comfyapp";
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatResponse, Node, Subgraph } from "../../../types/types";
import { Network } from 'vis-network';
import { WorkflowChatAPI } from "../../../apis/workflowChatApi";
import { generateUUID } from "../../../utils/uuid";

interface DownstreamSubgraphsProps {
    content: string;
    name?: string;
    avatar: string;
    installedNodes: any[];
    onAddMessage?: (message: Message) => void;
}

export function DownstreamSubgraphs({ content, name = 'Assistant', avatar, installedNodes, onAddMessage }: DownstreamSubgraphsProps) {
    const response = JSON.parse(content) as ChatResponse;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const networkRef = useRef<Network | null>(null);

    const nodes = response.ext?.find(item => item.type === 'downstream_subgraph_search')?.data || [];

    // 将 Subgraph 转换为 vis.js 格式的函数
    const convertToVisFormat = (subgraph: Subgraph) => {
        const visNodes = subgraph.json.nodes.map(node => ({
            id: node.id,
            label: node.type,
            color: {
                background: '#2B7CE9',
                border: '#1B5BB1'
            },
            font: {
                size: 16,
                color: '#FFFFFF',
                face: 'arial',
                bold: true
            },
            margin: 12,
            padding: 10,
            shape: 'box',
            widthConstraint: {
                minimum: 100,
                maximum: 200
            }
        }));

        const visEdges = subgraph.json.links.map(link => ({
            from: link.origin_id,
            to: link.target_id,
            arrows: {
                to: { enabled: true, scaleFactor: 1.2 }
            },
            color: '#FFFFFF',
            width: 2
        }));

        return { nodes: visNodes, edges: visEdges };
    };

    // 添加清理函数
    useEffect(() => {
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, []);

    const createNetwork = useCallback((el: HTMLElement, node: Subgraph) => {
        if (networkRef.current) {
            networkRef.current.destroy();
        }

        const visData = convertToVisFormat(node);
        const newNetwork = new Network(el, visData, {
            nodes: {
                shape: 'box',
                margin: 12,
                padding: 10,
                font: {
                    size: 16,
                    color: '#FFFFFF',
                    face: 'arial',
                    bold: true
                },
                borderWidth: 2,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.2)',
                    size: 5
                }
            },
            edges: {
                arrows: 'to',
                color: '#FFFFFF',
                width: 2,
                smooth: {
                    enabled: true,
                    type: 'straightCross'
                }
            },
            physics: {
                enabled: true,
                solver: 'hierarchicalRepulsion',
                hierarchicalRepulsion: {
                    nodeDistance: 200,
                    springLength: 200
                }
            },
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    nodeSpacing: 200,
                    levelSeparation: 150
                }
            },
            interaction: { 
                dragNodes: false,
                zoomView: false,
                dragView: false
            }
        });

        networkRef.current = newNetwork;
    }, []);

    const checkAndLoadSubgraph = async (node: Subgraph) => {
        console.log('[DownstreamSubgraphs] Starting checkAndLoadSubgraph with node:', node);
        const nodes = node.json.nodes;
        const selectedNode = Object.values(app.canvas.selected_nodes)[0];

        if (!selectedNode) {
            console.warn('[DownstreamSubgraphs] No node selected');
            alert("Please select a upstream node first before adding a subgraph.");
            return;
        }

        // 检查所有节点是否已安装
        const requiredNodeTypes = nodes.map(node => node.type);
        const installedNodeTypes = installedNodes;
        console.log('[DownstreamSubgraphs] Required node types:', requiredNodeTypes);
        console.log('[DownstreamSubgraphs] Installed node types:', installedNodeTypes);
        
        const missingNodeTypes = requiredNodeTypes.filter(
            type => !installedNodeTypes.includes(type)
        );
        console.log('[DownstreamSubgraphs] Missing node types:', missingNodeTypes);

        if (missingNodeTypes.length > 0) {
            try {
                console.log('[DownstreamSubgraphs] Fetching info for missing nodes');
                const nodeInfos = await WorkflowChatAPI.batchGetNodeInfo(missingNodeTypes);
                console.log('[DownstreamSubgraphs] Received node infos:', nodeInfos);
                
                // 构造消息内容 - 修改为显示按钮列表格式
                const messageContent = {
                    text: `在加载graph到画布前，以下节点有待安装，请跳转到对应的github安装节点：`,
                    ext: [{
                        type: 'node_install_guide',
                        data: nodeInfos.map(info => ({
                            name: info.name,
                            repository_url: info.github_url
                        }))
                    }]
                };
                console.log('[DownstreamSubgraphs] Created message content:', messageContent);

                const aiMessage = {
                    id: generateUUID(),
                    role: 'ai',
                    content: JSON.stringify(messageContent),
                    format: 'markdown',
                    name: 'Assistant',
                    // 保存原始的subgraph信息，用于后续加载
                    metadata: {
                        pendingSubgraph: node
                    }
                };
                console.log('[DownstreamSubgraphs] Created AI message:', aiMessage);

                onAddMessage?.(aiMessage);
                return;
            } catch (error) {
                console.error('[DownstreamSubgraphs] Error fetching node info:', error);
                alert('Error checking required nodes. Please try again.');
                return;
            }
        }

        console.log('[DownstreamSubgraphs] All required nodes are installed, proceeding to load subgraph');
        loadSubgraphToCanvas(node, selectedNode);
    };

    const loadSubgraphToCanvas = (node: Subgraph, selectedNode: any) => {
        const nodes = node.json.nodes;
        const links = node.json.links;
        
        const entryNode = nodes.find(node => node.id === 0);
        const entryNodeId = entryNode?.id;

        const nodeMap = {};
        if (entryNodeId) {
            nodeMap[entryNodeId] = selectedNode;
        }
        
        // 创建其他所有节点
        app.canvas.emitBeforeChange();
        try {
            for (const node of nodes) {
                if (node.id !== entryNodeId) {
                    const posEntryOld = entryNode?.pos;
                    const posEntryNew = [selectedNode._pos[0], selectedNode._pos[1]];
                    const nodePosNew = [
                        node.pos[0] + posEntryNew[0] - posEntryOld[0], 
                        node.pos[1] + posEntryNew[1] - posEntryOld[1]
                    ];
                    nodeMap[node.id] = app.addNodeOnGraph(
                        { name: node.type }, 
                        {pos: nodePosNew}
                    );
                }
            }
        } finally {
            app.canvas.emitAfterChange();
        }

        // 处理所有连接
        for (const link of links) {
            const origin_node = nodeMap[link['origin_id']];
            const target_node = nodeMap[link['target_id']];
            
            if (origin_node && target_node) {
                origin_node.connect(
                    link['origin_slot'], 
                    target_node, 
                    link['target_slot']
                );
            }
        }
    };

    return (
        <div className="rounded-lg bg-green-50 p-3 text-gray-700 text-xs break-words overflow-visible">
            {nodes.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs">Recommended downstream subgraphs that can be connected:</p>
                    <div className="flex flex-wrap gap-2">
                        {nodes.map((node: Subgraph) => (
                            <div key={node.name} className="relative group">
                                <button
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md 
                                             hover:bg-blue-600 transition-colors text-xs"
                                    onClick={() => checkAndLoadSubgraph(node)}
                                    onMouseEnter={() => setHoveredNode(node.name)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {node.name}
                                </button>
                                {hoveredNode === node.name && (
                                    <div 
                                        className="fixed transform -translate-y-full 
                                                 z-[9999] w-[500px] p-4 bg-gray-800 text-white text-xs 
                                                 rounded-md shadow-lg mb-2 border border-gray-700"
                                        style={{
                                            left: 'calc(var(--mouse-x, 0) + 16px)',
                                            top: 'calc(var(--mouse-y, 0) - 8px)'
                                        }}
                                    >
                                        <div 
                                            style={{ width: '100%', height: '300px' }} 
                                            ref={(el) => {
                                                if (el) {
                                                    createNetwork(el, node);
                                                }
                                            }}
                                        />
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