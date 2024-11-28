interface SelectedNodeInfoProps {
    nodeInfo: any;
    onQueryClick: (query: string) => void;
}

export function SelectedNodeInfo({ nodeInfo, onQueryClick }: SelectedNodeInfoProps) {
    return (
        <div className="mb-3 p-3 rounded-md bg-gray-50 border border-gray-200 
                      transform transition-all duration-200 hover:shadow-md">
            <h4 className="font-medium">Selected Node:</h4>
            <div className="text-sm">
                <p>Type: {nodeInfo.type}</p>
                <p>Title: {nodeInfo.title || 'Untitled'}</p>
                <div className="flex gap-2 mt-2">
                    <button
                        className="px-3 py-1 text-xs rounded-md bg-blue-50 
                                 hover:bg-blue-100 text-blue-700 transition-all 
                                 duration-200 hover:shadow-sm active:scale-95"
                        onClick={() => onQueryClick(`Explain how to use node: ${nodeInfo.type}`)}>
                        查询节点使用方法
                    </button>
                    <button
                        className="px-3 py-1 text-xs rounded bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                        onClick={() => onQueryClick(`What are the parameters for node: ${nodeInfo.type}`)}
                    >
                        查询参数
                    </button>
                    <button
                        className="px-3 py-1 text-xs rounded bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors"
                        onClick={() => onQueryClick(`Recommend downstream nodes for: ${nodeInfo.type}`)}
                    >
                        下游节点推荐
                    </button>
                </div>
            </div>
        </div>
    );
} 