# Task 09 - Operações com Nós (Adicionar/Editar/Deletar)

## Objetivo
Implementar funcionalidades para adicionar, editar título e deletar nós diretamente na interface React Flow.

## Descrição
Adicionar controles interativos para gerenciar nós:
- Editar título do nó (duplo clique)
- Adicionar nó filho
- Deletar nó
- Aplicar dark mode em todos os modais/inputs

## Arquivos a modificar/criar

### 1. Criar componente de nó customizado - `resources/js/Components/MindMapNode.jsx`

```jsx
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useTheme } from '@/Contexts/ThemeContext';

function MindMapNode({ data, id }) {
    const { theme } = useTheme();
    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(data.label);

    const handleDoubleClick = () => {
        setEditing(true);
    };

    const handleBlur = () => {
        setEditing(false);
        if (data.onLabelChange) {
            data.onLabelChange(id, label);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setLabel(data.label);
            setEditing(false);
        }
    };

    const handleAddChild = () => {
        if (data.onAddChild) {
            data.onAddChild(id);
        }
    };

    const handleDelete = () => {
        if (data.onDelete && confirm('Deletar este nó?')) {
            data.onDelete(id);
        }
    };

    return (
        <div
            className={`rounded-lg border-2 px-4 py-2 shadow-md ${
                theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-gray-100'
                    : 'border-gray-300 bg-white text-gray-900'
            }`}
            onDoubleClick={handleDoubleClick}
        >
            <Handle
                type="target"
                position={Position.Top}
                className={theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}
            />

            {editing ? (
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={`w-full border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}
                />
            ) : (
                <div className="text-sm font-medium">{label}</div>
            )}

            <div className="mt-2 flex gap-1">
                <button
                    onClick={handleAddChild}
                    className={`rounded px-2 py-1 text-xs ${
                        theme === 'dark'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                    title="Adicionar filho"
                >
                    +
                </button>
                <button
                    onClick={handleDelete}
                    className={`rounded px-2 py-1 text-xs ${
                        theme === 'dark'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    title="Deletar nó"
                >
                    ×
                </button>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}
            />
        </div>
    );
}

export default memo(MindMapNode);
```

### 2. Atualizar `resources/js/Pages/MindMaps/Show.jsx`

```jsx
import MindMapNode from '@/Components/MindMapNode';

// Registrar tipo de nó customizado
const nodeTypes = {
    mindMapNode: MindMapNode,
};

export default function Show({ mindmap }) {
    // ... código existente ...

    // Converter nós com tipo customizado
    const initialNodes = mindmap.nodes.map((node) => ({
        id: String(node.id),
        type: 'mindMapNode', // Usar nó customizado
        data: {
            label: node.title,
            onLabelChange: handleLabelChange,
            onAddChild: handleAddChild,
            onDelete: handleDeleteNode,
        },
        position: {
            x: node.pos_x || 0,
            y: node.pos_y || 0,
        },
    }));

    // Handler para mudar label
    const handleLabelChange = (nodeId, newLabel) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, label: newLabel },
                    };
                }
                return node;
            })
        );
    };

    // Handler para adicionar filho
    const handleAddChild = (parentId) => {
        const newNodeId = String(Date.now()); // ID temporário

        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode) return;

        // Criar novo nó
        const newNode = {
            id: newNodeId,
            type: 'mindMapNode',
            data: {
                label: 'Novo Nó',
                onLabelChange: handleLabelChange,
                onAddChild: handleAddChild,
                onDelete: handleDeleteNode,
            },
            position: {
                x: parentNode.position.x + 50,
                y: parentNode.position.y + 100,
            },
        };

        // Criar edge
        const newEdge = {
            id: `e${parentId}-${newNodeId}`,
            source: parentId,
            target: newNodeId,
            type: 'smoothstep',
            style: {
                stroke: theme === 'dark' ? '#6b7280' : '#b1b1b7',
            },
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
    };

    // Handler para deletar nó
    const handleDeleteNode = (nodeId) => {
        // Remover nó e suas conexões
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) =>
            eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        );
    };

    return (
        // ... JSX existente ...
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes} // Adicionar tipos customizados
            fitView
            className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
        >
            {/* ... controles existentes ... */}
        </ReactFlow>
    );
}
```

### 3. Atualizar Controller para salvar novos nós - `app/Http/Controllers/MindMapController.php`

Modificar método `update()`:

```php
public function update(Request $request, MindMap $mindmap)
{
    Gate::authorize('update', $mindmap);

    $validated = $request->validate([
        'title' => 'sometimes|string|max:255',
        'nodes' => 'sometimes|array',
        'nodes.*.id' => 'required|string',
        'nodes.*.title' => 'required|string',
        'nodes.*.pos_x' => 'nullable|integer',
        'nodes.*.pos_y' => 'nullable|integer',
        'nodes.*.parent_id' => 'nullable|string',
    ]);

    // Atualizar título
    if (isset($validated['title'])) {
        $mindmap->update(['title' => $validated['title']]);
    }

    // Atualizar/criar nós
    if (isset($validated['nodes'])) {
        $nodeIdMap = []; // Mapear IDs temporários para IDs reais

        foreach ($validated['nodes'] as $nodeData) {
            $isTemporary = !is_numeric($nodeData['id']);

            if ($isTemporary) {
                // Criar novo nó
                $parentId = isset($nodeData['parent_id']) && isset($nodeIdMap[$nodeData['parent_id']])
                    ? $nodeIdMap[$nodeData['parent_id']]
                    : null;

                $newNode = $mindmap->nodes()->create([
                    'title' => $nodeData['title'],
                    'pos_x' => $nodeData['pos_x'] ?? null,
                    'pos_y' => $nodeData['pos_y'] ?? null,
                    'parent_id' => $parentId,
                ]);

                $nodeIdMap[$nodeData['id']] = $newNode->id;
            } else {
                // Atualizar nó existente
                $node = $mindmap->nodes()->find($nodeData['id']);
                if ($node) {
                    $node->update([
                        'title' => $nodeData['title'],
                        'pos_x' => $nodeData['pos_x'] ?? null,
                        'pos_y' => $nodeData['pos_y'] ?? null,
                    ]);
                }
            }
        }

        // Deletar nós que não estão mais na lista
        $existingIds = collect($validated['nodes'])
            ->pluck('id')
            ->filter(fn($id) => is_numeric($id))
            ->toArray();

        $mindmap->nodes()->whereNotIn('id', $existingIds)->delete();
    }

    return back()->with('success', 'Mapa atualizado com sucesso!');
}
```

## Critérios de aceitação

- [ ] Componente `MindMapNode` criado
- [ ] Duplo clique em nó abre edição de texto
- [ ] Enter ou blur salva novo título
- [ ] Escape cancela edição
- [ ] Botão "+" adiciona nó filho
- [ ] Novo nó posicionado abaixo do pai
- [ ] Edge criado automaticamente entre pai e filho
- [ ] Botão "×" deleta nó com confirmação
- [ ] Deletar nó remove edges conectados
- [ ] Controller salva novos nós no banco
- [ ] Controller atualiza títulos modificados
- [ ] Controller deleta nós removidos
- [ ] Dark mode aplicado no nó customizado
- [ ] Dark mode aplicado no input de edição
- [ ] Dark mode aplicado nos botões do nó

## Validação

1. Abrir mapa existente
2. Duplo clicar em nó para editar título
3. Mudar texto e pressionar Enter
4. Verificar título atualizado
5. Clicar no botão "+" de um nó
6. Ver novo nó filho criado
7. Editar título do novo nó
8. Clicar "Salvar"
9. Recarregar página
10. Verificar que novo nó persiste
11. Deletar um nó
12. Clicar "Salvar"
13. Recarregar e verificar que nó foi deletado
14. **Alternar dark mode e verificar**:
    - Nós mudam de cor
    - Input de edição muda de cor
    - Botões + e × mudam de cor

## Dependências
- Task 08 - View/Edit Page

## Próxima tarefa
Task 10 - Complementos e Ajustes Finais
