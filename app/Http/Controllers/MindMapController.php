<?php

namespace App\Http\Controllers;

use App\Models\MindMap;
use App\Services\MindFileExporter;
use App\Services\MindFileImporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MindMapController extends Controller
{
    /**
     * Lista mapas do usuário autenticado
     */
    public function index(Request $request)
    {
        $mindmaps = $request->user()
            ->mindmaps()
            ->latest()
            ->paginate(10)
            ->through(fn($map) => [
                'id' => $map->id,
                'title' => $map->title,
                'created_at' => $map->created_at->format('d/m/Y H:i'),
                'updated_at' => $map->updated_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('MindMaps/Index', [
            'mindmaps' => $mindmaps,
        ]);
    }

    /**
     * Exibe formulário de criação
     */
    public function create()
    {
        return Inertia::render('MindMaps/Create');
    }

    /**
     * Cria novo mapa vazio
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $mindmap = $request->user()->mindmaps()->create([
            'title' => $validated['title'],
            'map_version' => '3.0',
            'layout' => 1,
        ]);

        // Criar nó raiz vazio
        $mindmap->nodes()->create([
            'title' => $validated['title'],
            'rank' => 0,
        ]);

        return redirect()->route('mindmaps.index')
            ->with('success', 'Mapa mental criado com sucesso!');
    }

    /**
     * Exibe mapa para visualização/edição
     */
    public function show(MindMap $mindmap)
    {
        Gate::authorize('view', $mindmap);

        // Carregar todos os nós
        $mindmap->load('nodes');

        return Inertia::render('MindMaps/Show', [
            'mindmap' => [
                'id' => $mindmap->id,
                'title' => $mindmap->title,
                'layout' => $mindmap->layout,
                'nodes' => $mindmap->nodes->map(fn($node) => [
                    'id' => $node->id,
                    'parent_id' => $node->parent_id,
                    'title' => $node->title,
                    'rank' => $node->rank,
                    'pos_x' => $node->pos_x,
                    'pos_y' => $node->pos_y,
                    'style' => $node->style,
                ]),
            ],
        ]);
    }

    /**
     * Atualiza mapa (título ou estrutura de nós)
     */
    public function update(Request $request, MindMap $mindmap)
    {
        Gate::authorize('update', $mindmap);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'nodes' => 'sometimes|array',
            'nodes.*.id' => 'required|exists:nodes,id',
            'nodes.*.title' => 'sometimes|string',
            'nodes.*.pos_x' => 'nullable|integer',
            'nodes.*.pos_y' => 'nullable|integer',
        ]);

        // Atualizar título se fornecido
        if (isset($validated['title'])) {
            $mindmap->update(['title' => $validated['title']]);
        }

        // Atualizar nós se fornecidos
        if (isset($validated['nodes'])) {
            foreach ($validated['nodes'] as $nodeData) {
                $node = $mindmap->nodes()->find($nodeData['id']);
                if ($node) {
                    $updateData = [];

                    if (isset($nodeData['title'])) {
                        $updateData['title'] = $nodeData['title'];
                    }

                    if (isset($nodeData['pos_x'])) {
                        $updateData['pos_x'] = $nodeData['pos_x'];
                    }

                    if (isset($nodeData['pos_y'])) {
                        $updateData['pos_y'] = $nodeData['pos_y'];
                    }

                    if (!empty($updateData)) {
                        $node->update($updateData);
                    }
                }
            }
        }

        return back();
    }

    /**
     * Deleta mapa
     */
    public function destroy(MindMap $mindmap)
    {
        Gate::authorize('delete', $mindmap);

        $mindmap->delete();

        return redirect()->route('mindmaps.index')
            ->with('success', 'Mapa mental deletado com sucesso!');
    }

    /**
     * Importa arquivo .mind
     */
    public function import(Request $request, MindFileImporter $importer)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
        ]);

        // Validar extensão manualmente
        $file = $request->file('file');
        if ($file->getClientOriginalExtension() !== 'mind') {
            return response()->json([
                'success' => false,
                'message' => 'O arquivo deve ter a extensão .mind'
            ], 422);
        }

        // Criar diretório temp se não existir
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Salvar com nome único
        $filename = uniqid('import_') . '.mind';
        $fullPath = $tempDir . '/' . $filename;

        // Mover o arquivo
        $file->move($tempDir, $filename);

        // Verificar se o arquivo foi realmente salvo
        if (!file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar arquivo temporário. Caminho: ' . $fullPath
            ], 500);
        }

        try {
            $mindmap = $importer->import($fullPath, $request->user());

            // Limpar arquivo temporário
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            // Retornar JSON com a URL de redirecionamento (voltar para index)
            return response()->json([
                'success' => true,
                'message' => 'Mapa importado com sucesso!',
                'redirect' => route('mindmaps.index')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao importar: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Exporta mapa para .mind
     */
    public function export(MindMap $mindmap, MindFileExporter $exporter)
    {
        Gate::authorize('export', $mindmap);

        try {
            $filePath = $exporter->export($mindmap);

            return response()->download($filePath, $mindmap->title . '.mind')->deleteFileAfterSend();
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao exportar: ' . $e->getMessage());
        }
    }
}
