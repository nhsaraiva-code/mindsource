import { useCallback, useState, useEffect, memo, useRef } from 'react';
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
import { PiFlowArrowBold } from 'react-icons/pi';
import { TiFlowChildren } from "react-icons/ti";
import { TbGitBranchDeleted } from 'react-icons/tb';
import toast from 'react-hot-toast';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

// Componente de nó customizado com funcionalidade de colapsar/expandir
const CollapsibleNode = memo(({ data, selected }) => {
    const { theme } = useTheme();
    const [editValue, setEditValue] = useState(data.label);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const childrenCount = data.childrenCount || 0;
    const isCollapsed = data.isCollapsed || false;
    const isEditing = data.isEditing || false;
    const isRoot = data.isRoot || false;

    // Mostrar badge apenas se tiver filhos
    const showBadge = childrenCount > 0;

    // Atualizar editValue quando o label mudar ou entrar em modo de edição
    useEffect(() => {
        if (isEditing) {
            setEditValue(data.label);
            // Focar no input automaticamente quando entrar em modo de edição
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 0);
        }
    }, [isEditing, data.label]);

    const handleSave = () => {
        // Sempre chamar onUpdate para permitir que nós temporários vazios sejam deletados
        data.onUpdate?.(editValue.trim());
        data.onStopEditing?.();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(data.label);
            data.onStopEditing?.();
        }
    };

    const handleDoubleClick = (e) => {
        if (!isEditing) {
            data.onStartEditing?.();
        }
    };

    const handleAddChild = (e) => {
        e.stopPropagation();
        data.onAddChild?.();
    };

    const handleAddSibling = (e) => {
        e.stopPropagation();
        data.onAddSibling?.();
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        data.onDelete?.();
    };

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        // Delay de 300ms antes de esconder os ícones
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 300);
    };

    const handleIconMouseEnter = () => {
        // Cancelar o timeout se o mouse entrar no ícone
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(true);
    };

    // Limpar timeout quando o componente desmontar
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className="px-3 py-2 shadow-sm relative"
            onDoubleClick={handleDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                overflow: 'visible',
                minWidth: '120px',
                fontSize: '14px',
            }}
        >
            <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />

            <div className="flex items-center gap-2">
                {isEditing ? (
                    <textarea
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        rows={1}
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 w-full resize-none overflow-hidden"
                        style={{
                            color: theme === 'dark' ? '#f3f4f6' : '#000',
                            fontSize: '14px',
                            lineHeight: '1.5',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                ) : (
                    <span className="cursor-text whitespace-pre-wrap">
                        {data.label}
                    </span>
                )}
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
                            marginLeft: 'auto',
                        }}
                    >
                        {isCollapsed ? childrenCount : '−'}
                    </button>
                )}
            </div>

            {/* Ícone para adicionar filho (direita) - aparece em todos os nós */}
            {isHovered && !isEditing && (
                <button
                    onClick={handleAddChild}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute flex items-center justify-center rounded-full shadow-xl transition-all hover:scale-110"
                    style={{
                        right: '-36px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '28px',
                        height: '28px',
                        background: '#8B5CF6',
                        color: '#fff',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <PiFlowArrowBold size={18} />
                </button>
            )}

            {/* Ícone para adicionar irmão (embaixo) - aparece apenas em nós não-root */}
            {isHovered && !isEditing && !isRoot && (
                <button
                    onClick={handleAddSibling}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute flex items-center justify-center rounded-full shadow-xl transition-all hover:scale-110"
                    style={{
                        bottom: '-36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '28px',
                        height: '28px',
                        background: '#8B5CF6',
                        color: '#fff',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <TiFlowChildren size={18} />
                </button>
            )}

            {/* Ícone para deletar nó (em cima) - aparece apenas em nós não-root */}
            {isHovered && !isEditing && !isRoot && (
                <button
                    onClick={handleDelete}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute flex items-center justify-center rounded-full shadow-xl transition-all hover:scale-110"
                    style={{
                        top: '-36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '28px',
                        height: '28px',
                        background: '#EF4444',
                        color: '#fff',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <TbGitBranchDeleted size={18} />
                </button>
            )}

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
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [lastClickNodeId, setLastClickNodeId] = useState(null);
    const [tempNodes, setTempNodes] = useState([]);
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
                    isEditing: false,
                    onToggle: () => toggleNode(nodeId),
                    onUpdate: null, // Será definido após useNodesState
                    onStopEditing: () => {},
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

    // Função para atualizar o título de um nó
    const updateNodeTitle = useCallback((nodeId, newTitle) => {
        // Se o título estiver vazio, não atualizar (manter o título anterior)
        if (!newTitle.trim()) {
            return;
        }

        router.put(route('mindmaps.nodes.update', { mindmap: mindmap.id, node: nodeId }), {
            title: newTitle,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Atualizar o estado local do nó
                setNodes((nds) =>
                    nds.map((node) =>
                        node.id === nodeId
                            ? { ...node, data: { ...node.data, label: newTitle } }
                            : node
                    )
                );
            },
        });
    }, [mindmap.id, setNodes]);

    // Função para obter todos os descendentes de um nó (filhos, netos, etc.)
    const getAllDescendants = useCallback((nodeId) => {
        const descendants = new Set();
        const queue = [nodeId];

        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = mindmap.nodes.filter(n => String(n.parent_id) === String(currentId));

            children.forEach(child => {
                const childId = String(child.id);
                descendants.add(childId);
                queue.push(childId);
            });
        }

        return Array.from(descendants);
    }, [mindmap.nodes]);

    // Função para deletar nó com confirmação
    const deleteNodeWithConfirmation = useCallback((nodeId) => {
        const descendants = getAllDescendants(nodeId);
        const totalNodes = descendants.length + 1; // +1 para incluir o próprio nó

        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Deletar nó e filhos?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {totalNodes === 1
                            ? 'Este nó será deletado.'
                            : `Este nó e ${descendants.length} filho(s) serão deletados.`}
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);

                            // Deletar do banco
                            router.delete(route('mindmaps.nodes.delete', { mindmap: mindmap.id, node: nodeId }), {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => {
                                    // Remover o nó e seus descendentes do estado local
                                    const nodesToRemove = new Set([nodeId, ...descendants]);
                                    setNodes((nds) => nds.filter(node => !nodesToRemove.has(node.id)));
                                    setEdges((eds) => eds.filter(edge =>
                                        !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target)
                                    ));

                                    toast.success('Nó deletado com sucesso!');
                                },
                                onError: () => {
                                    toast.error('Erro ao deletar nó');
                                },
                            });
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Deletar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
        });
    }, [getAllDescendants, mindmap.id, setNodes, setEdges]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Handler para detectar duplo clique
    const handleNodeClick = useCallback((event, node) => {
        const now = Date.now();
        const timeDiff = now - lastClickTime;

        // Se o clique foi no mesmo nó e dentro de 500ms, é um duplo clique
        if (lastClickNodeId === node.id && timeDiff < 500) {
            // Ativar modo de edição
            setEditingNodeId(node.id);
            setNodes((nodes) =>
                nodes.map((n) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isEditing: n.id === node.id,
                    },
                }))
            );

            // Resetar o contador
            setLastClickTime(0);
            setLastClickNodeId(null);
        } else {
            // Armazenar o tempo e ID do clique
            setLastClickTime(now);
            setLastClickNodeId(node.id);
        }
    }, [lastClickTime, lastClickNodeId, setNodes]);

    // Função para salvar nó temporário
    const saveTempNode = useCallback((tempId, title) => {
        const tempNode = tempNodes.find(n => String(n.id) === tempId);
        if (!tempNode) return;

        if (title.trim()) {
            // Se o pai está colapsado, expandi-lo
            if (tempNode.parent_id && collapsedNodes.has(String(tempNode.parent_id))) {
                setCollapsedNodes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(String(tempNode.parent_id));
                    return newSet;
                });
            }

            // Salvar no banco
            router.post(route('mindmaps.nodes.store', mindmap.id), {
                title: title.trim(),
                parent_id: tempNode.parent_id,
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    // Remover do array de temporários
                    setTempNodes(prev => prev.filter(n => n.id !== tempId));
                    setEditingNodeId(null);

                    // Atualizar os nós com os dados do servidor
                    if (page.props.mindmap && page.props.mindmap.nodes) {
                        const newNodes = page.props.mindmap.nodes;
                        // Encontrar o nó recém-criado (último nó adicionado)
                        const createdNode = newNodes[newNodes.length - 1];

                        // Atualizar o nó temporário com o ID real do servidor
                        setNodes(nodes => nodes.map(node =>
                            node.id === tempId
                                ? { ...node, id: String(createdNode.id) }
                                : node
                        ));
                    }
                },
            });
        } else {
            // Deletar nó temporário
            setTempNodes(prev => prev.filter(n => n.id !== tempId));
            setEditingNodeId(null);
        }
    }, [tempNodes, mindmap.id, setNodes, collapsedNodes, setCollapsedNodes]);

    // Atualizar nós quando collapsedNodes ou tempNodes mudarem
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

        // Combinar nós do banco com nós temporários
        const allNodes = [...mindmap.nodes, ...tempNodes];

        const updatedNodes = allNodes
            .filter((node) => !hiddenNodes.has(String(node.id)))
            .map((node) => {
                const nodeId = String(node.id);
                const childrenCount = (childrenMap[nodeId] || []).length;
                // Preservar o estado de edição do nó se existir
                const existingNode = nodes.find(n => n.id === nodeId);
                const isEditing = existingNode?.data?.isEditing || (editingNodeId === nodeId) || false;
                const isTemp = node.isTemp || false;

                const isRoot = !node.parent_id;

                return {
                    id: nodeId,
                    type: 'collapsible',
                    data: {
                        label: node.title || '',
                        childrenCount,
                        isCollapsed: collapsedNodes.has(nodeId),
                        isEditing,
                        isRoot,
                        onToggle: () => toggleNode(nodeId),
                        onUpdate: existingNode?.data?.onUpdate || (isTemp
                            ? (newTitle) => saveTempNode(nodeId, newTitle)
                            : (newTitle) => updateNodeTitle(nodeId, newTitle)),
                        onStartEditing: () => {
                            setEditingNodeId(nodeId);
                            setNodes((nodes) =>
                                nodes.map((n) => ({
                                    ...n,
                                    data: {
                                        ...n.data,
                                        isEditing: n.id === nodeId,
                                    },
                                }))
                            );
                        },
                        onStopEditing: () => {
                            setEditingNodeId(null);
                            setNodes((nodes) =>
                                nodes.map((n) => ({
                                    ...n,
                                    data: {
                                        ...n.data,
                                        isEditing: false,
                                    },
                                }))
                            );
                        },
                        onAddChild: () => {
                            // Criar node temporário como filho
                            const tempId = `temp-${Date.now()}`;
                            const tempNode = {
                                id: tempId,
                                parent_id: parseInt(nodeId),
                                title: '',
                                rank: node.rank + 1,
                                pos_x: 0,
                                pos_y: 0,
                                isTemp: true,
                            };

                            setTempNodes(prev => [...prev, tempNode]);
                            setEditingNodeId(tempId);
                        },
                        onAddSibling: () => {
                            // Criar node temporário como irmão (mesmo parent_id)
                            const tempId = `temp-${Date.now()}`;
                            const tempNode = {
                                id: tempId,
                                parent_id: node.parent_id,
                                title: '',
                                rank: node.rank,
                                pos_x: 0,
                                pos_y: 0,
                                isTemp: true,
                            };

                            setTempNodes(prev => [...prev, tempNode]);
                            setEditingNodeId(tempId);
                        },
                        onDelete: () => {
                            deleteNodeWithConfirmation(nodeId);
                        },
                    },
                    position: existingNode?.position || {
                        x: node.pos_x || 0,
                        y: node.pos_y || 0,
                    },
                };
            });

        const updatedEdges = allNodes
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
        getLayoutedElements(updatedNodes, updatedEdges, allNodes).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        });
    }, [collapsedNodes, tempNodes, editingNodeId]);

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
                onNodeClick={handleNodeClick}
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
