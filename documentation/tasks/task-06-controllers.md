# Task 06 - Controllers e Rotas

## Objetivo
Criar controller e rotas para CRUD de mapas mentais (listar, criar, visualizar, editar, deletar, importar, exportar).

## Descrição
Implementar `MindMapController` com todos os métodos necessários e configurar rotas protegidas por autenticação.

## Arquivos a criar/modificar

### 1. `app/Http/Controllers/MindMapController.php`

```php
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
            ->get()
            ->map(fn($map) => [
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

        return redirect()->route('mindmaps.show', $mindmap)
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
            'nodes.*.title' => 'required|string',
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
                    $node->update([
                        'title' => $nodeData['title'],
                        'pos_x' => $nodeData['pos_x'] ?? null,
                        'pos_y' => $nodeData['pos_y'] ?? null,
                    ]);
                }
            }
        }

        return back()->with('success', 'Mapa atualizado com sucesso!');
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
            'file' => 'required|file|mimes:mind|max:10240', // 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store('temp');

        try {
            $mindmap = $importer->import(storage_path('app/' . $path), $request->user());

            // Limpar arquivo temporário
            unlink(storage_path('app/' . $path));

            return redirect()->route('mindmaps.show', $mindmap)
                ->with('success', 'Mapa importado com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Erro ao importar: ' . $e->getMessage()]);
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
            return back()->withErrors(['export' => 'Erro ao exportar: ' . $e->getMessage()]);
        }
    }
}
```

### 2. Adicionar rotas em `routes/web.php`

```php
use App\Http\Controllers\MindMapController;

Route::middleware(['auth', 'verified'])->group(function () {
    // ... rotas existentes ...

    // Mapas Mentais
    Route::resource('mindmaps', MindMapController::class);
    Route::post('mindmaps/import', [MindMapController::class, 'import'])->name('mindmaps.import');
    Route::get('mindmaps/{mindmap}/export', [MindMapController::class, 'export'])->name('mindmaps.export');
});
```

### 3. Registrar MIME type .mind em `config/filesystems.php`

Adicionar na configuração:

```php
'mime_types' => [
    'mind' => 'application/zip',
],
```

## Comandos para executar

```bash
# Criar controller
./vendor/bin/sail artisan make:controller MindMapController --resource
```

## Critérios de aceitação

- [ ] Controller `MindMapController` criado
- [ ] Método `index()` - lista mapas do usuário
- [ ] Método `create()` - formulário de criação
- [ ] Método `store()` - cria mapa vazio com nó raiz
- [ ] Método `show()` - exibe mapa (autorização)
- [ ] Método `update()` - atualiza título e nós (autorização)
- [ ] Método `destroy()` - deleta mapa (autorização)
- [ ] Método `import()` - importa .mind usando serviço
- [ ] Método `export()` - exporta .mind usando serviço (autorização)
- [ ] Rotas configuradas corretamente
- [ ] Rotas protegidas por autenticação
- [ ] Validação de dados nos métodos
- [ ] Mensagens de sucesso/erro
- [ ] Inertia render para React

## Validação

```bash
# Listar rotas
./vendor/bin/sail artisan route:list --name=mindmaps

# Deve mostrar:
# GET    /mindmaps ..................... mindmaps.index
# GET    /mindmaps/create .............. mindmaps.create
# POST   /mindmaps ..................... mindmaps.store
# GET    /mindmaps/{mindmap} ........... mindmaps.show
# PUT    /mindmaps/{mindmap} ........... mindmaps.update
# DELETE /mindmaps/{mindmap} ........... mindmaps.destroy
# POST   /mindmaps/import .............. mindmaps.import
# GET    /mindmaps/{mindmap}/export .... mindmaps.export
```

## Dependências
- Task 02 - Models
- Task 03 - Policies
- Task 04 - Importer
- Task 05 - Exporter

## Próxima tarefa
Task 07 - Página de Listagem
