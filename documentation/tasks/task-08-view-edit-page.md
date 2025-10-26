# Task 08 - Página de Visualização/Edição com React Flow

## Objetivo
Criar interface React Flow para visualizar e editar mapas mentais de forma interativa com drag & drop, zoom e pan.

## Descrição
Implementar página `MindMaps/Show.jsx` usando React Flow para:
- Exibir hierarquia de nós
- Arrastar nós
- Editar títulos dos nós
- Adicionar/remover nós
- Zoom e pan
- Salvar alterações
- **Dark mode completo**

## Instalação de dependências

```bash
./vendor/bin/sail npm install reactflow
```

## Arquivos a criar

### 1. `resources/js/Pages/MindMaps/Show.jsx`

```jsx
import { useCallback, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useTheme } from '@/Contexts/ThemeContext';

export default function Show({ mindmap }) {
    const { theme } = useTheme();
    const [saving, setSaving] = useState(false);

    // Converter nós do banco para formato React Flow
    const initialNodes = mindmap.nodes.map((node) => ({
        id: String(node.id),
        type: 'default',
        data: { label: node.title },
        position: {
            x: node.pos_x || 0,
            y: node.pos_y || 0,
        },
        style: {
            background: theme === 'dark' ? '#374151' : '#fff',
            color: theme === 'dark' ? '#f3f4f6' : '#000',
            border: `2px solid ${theme === 'dark' ? '#6b7280' : '#ddd'}`,
            borderRadius: '8px',
            padding: '10px',
            fontSize: '14px',
        },
    }));

    // Converter nós para edges (conexões pai-filho)
    const initialEdges = mindmap.nodes
        .filter((node) => node.parent_id)
        .map((node) => ({
            id: `e${node.parent_id}-${node.id}`,
            source: String(node.parent_id),
            target: String(node.id),
            type: 'smoothstep',
            style: {
                stroke: theme === 'dark' ? '#6b7280' : '#b1b1b7',
            },
        }));

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Atualizar estilos dos nós quando tema mudar
    const updateNodeStyles = useCallback(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                style: {
                    ...node.style,
                    background: theme === 'dark' ? '#374151' : '#fff',
                    color: theme === 'dark' ? '#f3f4f6' : '#000',
                    border: `2px solid ${theme === 'dark' ? '#6b7280' : '#ddd'}`,
                },
            }))
        );
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                style: {
                    ...edge.style,
                    stroke: theme === 'dark' ? '#6b7280' : '#b1b1b7',
                },
            }))
        );
    }, [theme, setNodes, setEdges]);

    // Efeito para atualizar estilos quando tema mudar
    useState(() => {
        updateNodeStyles();
    }, [theme]);

    const handleSave = () => {
        setSaving(true);

        // Preparar dados para salvar
        const nodesToSave = nodes.map((node) => ({
            id: parseInt(node.id),
            title: node.data.label,
            pos_x: Math.round(node.position.x),
            pos_y: Math.round(node.position.y),
        }));

        router.put(
            route('mindmaps.update', mindmap.id),
            { nodes: nodesToSave },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {mindmap.title}
                    </h2>
                    <div className="flex gap-2">
                        <a href={route('mindmaps.export', mindmap.id)}>
                            <SecondaryButton>Exportar</SecondaryButton>
                        </a>
                        <PrimaryButton onClick={handleSave} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={mindmap.title} />

            <div className="h-[calc(100vh-64px)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
                >
                    <Controls className={theme === 'dark' ? 'dark-controls' : ''} />
                    <MiniMap
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
        </AuthenticatedLayout>
    );
}
```

### 2. Adicionar estilos dark mode para React Flow - `resources/css/app.css`

```css
/* React Flow Dark Mode */
.dark .react-flow__node {
    background: #374151;
    color: #f3f4f6;
    border-color: #6b7280;
}

.dark .react-flow__edge-path {
    stroke: #6b7280;
}

.dark .react-flow__controls {
    background: #374151;
    border-color: #6b7280;
}

.dark .react-flow__controls button {
    background: #374151;
    color: #f3f4f6;
    border-color: #6b7280;
}

.dark .react-flow__controls button:hover {
    background: #4b5563;
}

.dark .react-flow__minimap {
    background: #1f2937;
}

.dark .react-flow__attribution {
    background: rgba(31, 41, 55, 0.8);
    color: #9ca3af;
}
```

### 3. Componente de Nó Customizado (Opcional - MVP pode usar default)

Para o MVP, vamos usar nós padrão do React Flow. Na v1.1 podemos criar nós customizados com mais funcionalidades.

## Comandos para executar

```bash
# Instalar React Flow
./vendor/bin/sail npm install reactflow

# Rebuild assets
./vendor/bin/sail npm run dev
```

## Critérios de aceitação

- [ ] React Flow instalado
- [ ] Página `MindMaps/Show.jsx` criada
- [ ] Nós carregados do banco de dados
- [ ] Edges (conexões) criadas entre pai e filho
- [ ] Drag & drop funcionando
- [ ] Zoom funcionando (scroll ou controles)
- [ ] Pan funcionando (arrastar fundo)
- [ ] Botão "Salvar" atualiza posições no banco
- [ ] Botão "Exportar" funcional
- [ ] MiniMap exibido
- [ ] Background com grid/dots
- [ ] Dark mode aplicado:
  - [ ] Fundo do canvas
  - [ ] Nós mudam de cor
  - [ ] Edges mudam de cor
  - [ ] Controles em dark mode
  - [ ] MiniMap em dark mode
- [ ] Estilos reativos ao trocar tema
- [ ] Layout responsivo (altura 100vh - header)

## Funcionalidades do React Flow

- **Arrastar nós**: Click e arrastar qualquer nó
- **Zoom**: Scroll ou botões +/-
- **Pan**: Arrastar o fundo
- **MiniMap**: Visão geral do mapa
- **Controls**: Botões de zoom, fit view, lock
- **Background**: Grid visual

## Validação

1. Acessar um mapa existente
2. Ver nós carregados com títulos corretos
3. Ver conexões entre nós pai-filho
4. Arrastar um nó e ver posição mudar
5. Dar zoom in/out
6. Arrastar o canvas (pan)
7. Clicar em "Salvar"
8. Recarregar página e ver nós nas novas posições
9. **Alternar dark mode**:
   - Canvas deve ficar escuro
   - Nós devem ficar cinza escuro com texto claro
   - Edges devem ficar cinza
   - Controles devem ter fundo escuro
10. Clicar em "Exportar" e baixar .mind

## Dependências
- Task 06 - Controllers
- Task 07 - List Page
- Dark mode implementado

## Próxima tarefa
Task 09 - Operações com Nós
