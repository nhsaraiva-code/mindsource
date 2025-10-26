import { useCallback, useState, useEffect, memo } from 'react';
import { Head, router } from '@inertiajs/react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { useTheme } from '@/Contexts/ThemeContext';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

// Componente de nó customizado com funcionalidade de colapsar/expandir
const CollapsibleNode = memo(({ data, selected }) => {
    const { theme } = useTheme();
    const childrenCount = data.childrenCount || 0;
    const isCollapsed = data.isCollapsed || false;

    // Mostrar badge apenas se tiver filhos
    const showBadge = childrenCount > 0;

    return (
        <div
            className="px-3 py-2 shadow-sm"
            style={{
                background: theme === 'dark' ? '#374151' : '#fff',
                color: theme === 'dark' ? '#f3f4f6' : '#000',
                border: selected
                    ? '2px solid #8B5CF6'
                    : theme === 'dark'
                        ? '1px solid #6B7280'
                        : '1px solid #D1D5DB',
                borderRadius: '8px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                minWidth: '120px',
                fontSize: '14px',
            }}
        >
            <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />

            <div className="flex items-center gap-2">
                <span>{data.label}</span>
                {showBadge && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onToggle?.();
                        }}
                        className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold transition-all"
                        style={{
                            background: '#8B5CF6',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        {isCollapsed ? childrenCount : '−'}
                    </button>
                )}
            </div>

            <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
        </div>
    );
});

CollapsibleNode.displayName = 'CollapsibleNode';

const nodeTypes = {
    collapsible: CollapsibleNode,
};

// Configuração do layout ELK para mapa mental
const elkOptions = {
    'elk.algorithm': 'mrtree',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '80',
    'elk.mrtree.searchOrder': 'DFS',
};

const getLayoutedElements = (nodes, edges, mindmapNodes = []) => {
    const graph = {
        id: 'root',
        layoutOptions: elkOptions,
        children: nodes.map((node) => {
            // Encontrar o rank do nó original
            const originalNode = mindmapNodes.find(n => String(n.id) === node.id);
            const rank = originalNode?.rank || 0;

            return {
                ...node,
                width: 180,
                height: 36,
                properties: {
                    'org.eclipse.elk.priority': rank,
                },
            };
        }),
        edges: edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    };

    return elk
        .layout(graph)
        .then((layoutedGraph) => ({
            nodes: layoutedGraph.children.map((node) => ({
                ...nodes.find((n) => n.id === node.id),
                position: { x: node.x, y: node.y },
            })),
            edges,
        }))
        .catch(console.error);
};

function MindMapFlow({ mindmap, isFullscreen = false }) {
    const { theme } = useTheme();
    const [layouted, setLayouted] = useState(false);
    const [isPanMode, setIsPanMode] = useState(false);
    const { fitView, setCenter } = useReactFlow();

    // Construir mapa de filhos para cada nó
    const childrenMap = {};
    mindmap.nodes.forEach((node) => {
        if (node.parent_id) {
            const parentId = String(node.parent_id);
            if (!childrenMap[parentId]) {
                childrenMap[parentId] = [];
            }
            childrenMap[parentId].push(String(node.id));
        }
    });

    // Estado inicial: colapsar todos os nós que têm filhos, EXCETO o raiz
    const [collapsedNodes, setCollapsedNodes] = useState(() => {
        const initialCollapsed = new Set();
        const rootNode = mindmap.nodes.find(node => !node.parent_id);
        const rootNodeId = rootNode ? String(rootNode.id) : null;

        mindmap.nodes.forEach((node) => {
            const nodeId = String(node.id);
            // Não colapsar o nó raiz
            if (nodeId !== rootNodeId && childrenMap[nodeId] && childrenMap[nodeId].length > 0) {
                initialCollapsed.add(nodeId);
            }
        });
        return initialCollapsed;
    });

    // Função para obter apenas filhos diretos de um nó
    const getDirectChildren = (nodeId) => {
        return childrenMap[nodeId] || [];
    };

    // Função para obter todos os descendentes de nós colapsados (recursiva)
    const getHiddenDescendants = (nodeId) => {
        const hidden = new Set();
        const directChildren = getDirectChildren(nodeId);

        directChildren.forEach((childId) => {
            hidden.add(childId);
            // Recursivamente adicionar descendentes deste filho também
            const childDescendants = getHiddenDescendants(childId);
            childDescendants.forEach((id) => hidden.add(id));
        });

        return hidden;
    };

    // Toggle collapse/expand
    const toggleNode = (nodeId) => {
        setCollapsedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    // Calcular nós visíveis (excluindo apenas filhos diretos de nós colapsados)
    const hiddenNodes = new Set();
    collapsedNodes.forEach((nodeId) => {
        const directChildren = getDirectChildren(nodeId);
        directChildren.forEach((childId) => {
            hiddenNodes.add(childId);
            // Adicionar todos os descendentes deste filho também
            const childDescendants = getHiddenDescendants(childId);
            childDescendants.forEach((id) => hiddenNodes.add(id));
        });
    });

    // Converter nós do banco para formato React Flow
    const initialNodes = mindmap.nodes
        .filter((node) => !hiddenNodes.has(String(node.id)))
        .map((node) => {
            const nodeId = String(node.id);
            const childrenCount = (childrenMap[nodeId] || []).length;

            return {
                id: nodeId,
                type: 'collapsible',
                data: {
                    label: node.title,
                    childrenCount,
                    isCollapsed: collapsedNodes.has(nodeId),
                    onToggle: () => toggleNode(nodeId),
                },
                position: {
                    x: node.pos_x || 0,
                    y: node.pos_y || 0,
                },
            };
        });

    // Converter nós para edges (conexões pai-filho), filtrando nós ocultos
    const initialEdges = mindmap.nodes
        .filter((node) => node.parent_id && !hiddenNodes.has(String(node.id)))
        .map((node) => ({
            id: `e${node.parent_id}-${node.id}`,
            source: String(node.parent_id),
            target: String(node.id),
            type: 'default',
            style: {
                stroke: '#8B5CF6',
                strokeWidth: 2,
            },
            animated: false,
        }));

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Atualizar nós quando collapsedNodes mudar
    useEffect(() => {
        const hiddenNodes = new Set();
        collapsedNodes.forEach((nodeId) => {
            const directChildren = getDirectChildren(nodeId);
            directChildren.forEach((childId) => {
                hiddenNodes.add(childId);
                // Adicionar todos os descendentes deste filho também
                const childDescendants = getHiddenDescendants(childId);
                childDescendants.forEach((id) => hiddenNodes.add(id));
            });
        });

        const updatedNodes = mindmap.nodes
            .filter((node) => !hiddenNodes.has(String(node.id)))
            .map((node) => {
                const nodeId = String(node.id);
                const childrenCount = (childrenMap[nodeId] || []).length;

                return {
                    id: nodeId,
                    type: 'collapsible',
                    data: {
                        label: node.title,
                        childrenCount,
                        isCollapsed: collapsedNodes.has(nodeId),
                        onToggle: () => toggleNode(nodeId),
                    },
                    position: nodes.find(n => n.id === nodeId)?.position || {
                        x: node.pos_x || 0,
                        y: node.pos_y || 0,
                    },
                };
            });

        const updatedEdges = mindmap.nodes
            .filter((node) => node.parent_id && !hiddenNodes.has(String(node.id)))
            .map((node) => ({
                id: `e${node.parent_id}-${node.id}`,
                source: String(node.parent_id),
                target: String(node.id),
                type: 'default',
                style: {
                    stroke: '#8B5CF6',
                    strokeWidth: 2,
                },
                animated: false,
            }));

        // Reorganizar com ELK mantendo a ordem dos nós
        getLayoutedElements(updatedNodes, updatedEdges, mindmap.nodes).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        });
    }, [collapsedNodes]);

    // Aplicar layout hierárquico apenas se os nós não têm posições salvas
    useEffect(() => {
        if (!layouted && nodes.length > 0) {
            // Verificar se pelo menos algum nó tem posição salva (pos_x e pos_y válidos)
            const hasValidPositions = mindmap.nodes.some(
                (node) => node.pos_x !== null && node.pos_y !== null && node.pos_x !== 0 && node.pos_y !== 0
            );

            // Encontrar o nó raiz (sem parent_id)
            const rootNode = mindmap.nodes.find(node => !node.parent_id);

            if (hasValidPositions) {
                // Se tem posições salvas, não aplicar layout ELK, apenas centralizar
                setLayouted(true);
                window.requestAnimationFrame(() => {
                    if (rootNode) {
                        const rootFlowNode = nodes.find(n => n.id === String(rootNode.id));
                        if (rootFlowNode) {
                            setCenter(rootFlowNode.position.x, rootFlowNode.position.y, { zoom: 1.2, duration: 800 });
                        }
                    } else {
                        fitView({ padding: 0.15, duration: 800 });
                    }
                });
            } else {
                // Se não tem posições salvas, aplicar layout ELK
                getLayoutedElements(nodes, edges, mindmap.nodes).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                    setLayouted(true);

                    // Centralizar no nó raiz com zoom fixo
                    window.requestAnimationFrame(() => {
                        if (rootNode) {
                            const rootFlowNode = layoutedNodes.find(n => n.id === String(rootNode.id));
                            if (rootFlowNode) {
                                setCenter(rootFlowNode.position.x, rootFlowNode.position.y, { zoom: 1.2, duration: 800 });
                            }
                        } else {
                            fitView({ padding: 0.15, duration: 800 });
                        }
                    });
                });
            }
        }
    }, [layouted, nodes, edges, setNodes, setEdges, fitView, setCenter, mindmap.nodes]);

    // Detectar quando a tecla Espaço está pressionada
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Não ativar modo pan se estiver em um input ou textarea
            const isInputFocused = document.activeElement?.tagName === 'INPUT' ||
                                   document.activeElement?.tagName === 'TEXTAREA';

            if (e.code === 'Space' && !isPanMode && !isInputFocused) {
                e.preventDefault();
                setIsPanMode(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space' && isPanMode) {
                e.preventDefault();
                setIsPanMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isPanMode]);

    return (
        <div
            className="h-full w-full"
            style={{ cursor: isPanMode ? 'grab' : 'default' }}
        >
            {isPanMode && (
                <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-md text-sm">
                    Modo movimentação ativo
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                fitView
                selectionOnDrag={!isPanMode}
                panOnDrag={isPanMode}
                panOnScroll={true}
                selectionMode={!isPanMode ? 'partial' : undefined}
                className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
            >
                <Controls className={theme === 'dark' ? 'dark-controls' : ''} />
                <MiniMap
                    position="bottom-left"
                    nodeColor={theme === 'dark' ? '#374151' : '#fff'}
                    maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)'}
                    className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                />
                <Background
                    variant="dots"
                    gap={12}
                    size={1}
                    color={theme === 'dark' ? '#4b5563' : '#ddd'}
                />
            </ReactFlow>
        </div>
    );
}

export default function Show({ mindmap }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(mindmap.title);

    const containerRef = useCallback((node) => {
        if (node) {
            node.onfullscreenchange = () => {
                setIsFullscreen(!!document.fullscreenElement);
            };
        }
    }, []);

    const toggleFullscreen = () => {
        const element = document.getElementById('mindmap-container');

        if (!document.fullscreenElement) {
            element.requestFullscreen().catch((err) => {
                console.error('Erro ao entrar em tela cheia:', err);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleTitleSave = () => {
        if (title.trim() && title !== mindmap.title) {
            router.put(route('mindmaps.update', mindmap.id), {
                title: title.trim(),
            }, {
                preserveScroll: true,
                preserveState: true,
            });
        } else {
            setTitle(mindmap.title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setTitle(mindmap.title);
            setIsEditingTitle(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                            className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border-2 border-purple-600 dark:border-purple-500 focus:outline-none focus:ring-0"
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            {mindmap.title}
                        </h2>
                    )}
                    <div className="flex gap-2">
                        <SecondaryButton onClick={toggleFullscreen}>
                            {isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        </SecondaryButton>
                        <a href={route('mindmaps.export', mindmap.id)}>
                            <SecondaryButton>Exportar</SecondaryButton>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={mindmap.title} />
            <div
                id="mindmap-container"
                ref={containerRef}
                className={isFullscreen ? 'h-screen bg-gray-900' : 'h-[calc(100vh-145px)] overflow-hidden'}
            >
                <ReactFlowProvider>
                    <MindMapFlow mindmap={mindmap} isFullscreen={isFullscreen} />
                </ReactFlowProvider>
            </div>
        </AuthenticatedLayout>
    );
}
