# MVP - Aplicação de Mapas Mentais

**Versão:** 1.0
**Data:** 26 de outubro de 2025
**Autor:** Documentação técnica do projeto MindMap

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Objetivo do MVP](#2-objetivo-do-mvp)
3. [Regras de Negócio](#3-regras-de-negócio)
4. [Escopo Funcional](#4-escopo-funcional)
5. [Arquitetura](#5-arquitetura)
6. [Modelagem do Banco de Dados](#6-modelagem-do-banco-de-dados)
7. [Estrutura de Backend](#7-estrutura-de-backend)
8. [Estrutura de Frontend](#8-estrutura-de-frontend)
9. [Fluxos de Usuário](#9-fluxos-de-usuário)
10. [Tecnologias e Bibliotecas](#10-tecnologias-e-bibliotecas)
11. [Ordem de Desenvolvimento](#11-ordem-de-desenvolvimento)
12. [Fora do Escopo (v2)](#12-fora-do-escopo-v2)
13. [Checklist de Implementação](#13-checklist-de-implementação)

---

## 1. Visão Geral

### 1.1 Propósito
Criar uma **aplicação web moderna de mapas mentais** compatível com softwares existentes do mercado, permitindo que usuários criem, visualizem, editem e compartilhem mapas mentais através de uma interface intuitiva.

### 1.2 Diferencial
**Compatibilidade bidirecional** com o formato `.mind`:
- ✅ **Importar** arquivos `.mind` de outros aplicativos
- ✅ **Exportar** mapas criados na aplicação como `.mind` compatível
- ✅ **Zero perda de dados** na importação/exportação

### 1.3 Público-Alvo
- Profissionais que já usam aplicativos de mapa mental
- Usuários que buscam alternativa web moderna
- Equipes que precisam colaborar em mapas mentais

---

## 2. Objetivo do MVP

### 2.1 Funcionalidades Core
1. **CRUD de Mapas Mentais** (por usuário)
2. **Importação de arquivos .mind**
3. **Visualização interativa** de mapas
4. **Edição básica** (adicionar/remover/mover nós)
5. **Exportação compatível** (.mind)

### 2.2 Métricas de Sucesso
- ✅ Importar arquivo `.mind` sem perda de dados
- ✅ Editar mapa e exportar compatível com app original
- ✅ Interface responsiva e intuitiva
- ✅ Performance adequada (mapas com 100+ nós)

---

## 3. Regras de Negócio

### 3.1 Autenticação e Autorização

#### Autenticação Obrigatória
- Todas as funcionalidades requerem login
- Sistema de autenticação já implementado (Laravel Breeze)
- Sessões persistentes

#### Isolamento por Usuário
- Cada mapa pertence a **um único usuário**
- Usuário só pode ver/editar **seus próprios mapas**
- Relacionamento: `User hasMany MindMaps`
- Relacionamento: `MindMap belongsTo User`

#### Políticas de Acesso
```php
// Usuário pode visualizar apenas seus mapas
User::findOrFail($userId)->mindmaps

// Verificação de ownership antes de qualquer operação
if ($mindmap->user_id !== auth()->id()) {
    abort(403);
}
```

### 3.2 Gestão de Mapas

#### Criação
- Usuário pode criar mapa **do zero** ou **importar .mind**
- Ao criar, usuário vira dono automaticamente
- Título obrigatório

#### Edição
- Apenas dono pode editar
- Salvar automaticamente (ou botão "Salvar")
- Histórico de versões: **não (fora do MVP)**

#### Exclusão
- Apenas dono pode excluir
- Exclusão em cascata de todos os nós
- Confirmação antes de excluir

### 3.3 Compatibilidade de Formato

#### Importação (.mind → App)
1. Upload de arquivo `.mind` (ZIP)
2. Descompactar e validar `map.json`
3. Verificar estrutura e versão
4. Salvar no banco preservando todas as propriedades
5. Associar ao usuário autenticado

#### Exportação (App → .mind)
1. Buscar mapa e todos os nós do banco
2. Gerar JSON no formato exato do padrão
3. Compactar em arquivo `.mind` (ZIP)
4. Download automático

#### Propriedades Preservadas

**Estrutura completa do map.json:**
```json
{
  "map_version": "3.0",
  "layout": 1,                    // Tipo de layout (1=mindmap, 2=orgchart, 3=list)
  "theme": { ... },               // Tema visual completo (estilos, cores, fontes)
  "attachments": [],              // Anexos globais do mapa
  "connections": [],              // Conexões não-hierárquicas entre nós
  "custom_colors": [],            // Paleta de cores customizadas
  "images": [],                   // Biblioteca de imagens
  "slides": [],                   // Slides de apresentação

  "root": {
    "id": 123456789,
    "title": "Título do Mapa",
    "rank": null,
    "pos": [x, y],
    "icon": null,
    "style": null,              // Estilo visual do nó (ou null para usar theme)
    "created_at": "2025-05-27T16:32:29.000Z",
    "updated_at": "2025-05-27T16:32:39.000Z",
    "note": null,
    "link": null,
    "task": {
      "from": null,
      "until": null,
      "resource": null,
      "effort": null,
      "notify": 1
    },
    "external_task": null,
    "attachments": [],
    "image": null,
    "boundary": null,           // Contorno visual de grupo
    "video": null,              // Vídeo incorporado
    "property": {               // Metadados de renderização
      "id": 940646733,
      "idea_id": 3726568106,
      "floating": false,
      "offset_x": 0,
      "offset_y": 0,
      "free": false,
      "layout": null
    },
    "children": [...]
  }
}
```

**IMPORTANTE:** Todas estas propriedades serão **100% preservadas** na importação/exportação, garantindo compatibilidade total com o aplicativo original.

---

## 4. Escopo Funcional

### 4.1 ✅ Incluído no MVP

#### Gestão de Mapas
- [x] Listar mapas do usuário
- [x] Criar novo mapa (vazio)
- [x] Importar arquivo `.mind`
- [x] Duplicar mapa existente
- [x] Excluir mapa (com confirmação)
- [x] Exportar como `.mind`

#### Visualização
- [x] Renderizar mapa hierárquico
- [x] Zoom in/out
- [x] Pan (arrastar canvas)
- [x] Auto-fit (centralizar mapa)
- [x] Modo visualização (read-only)

#### Edição de Nós
- [x] Adicionar nó filho
- [x] Editar título do nó
- [x] Remover nó (e filhos em cascata)
- [x] Mover nó (drag & drop)
- [x] Alterar hierarquia (reparentar)

#### Persistência
- [x] Salvar mudanças no banco
- [x] Feedback visual de salvamento
- [x] Validação de dados

### 4.2 📊 Escopo de Edição no MVP

**O que será editável:**
- ✅ Título do nó
- ✅ Posição (x, y)
- ✅ Hierarquia (parent/child)
- ✅ Adicionar/remover nós

**O que NÃO será editável (v1):**
- ⚠️ Tasks (from, until, effort)
- ⚠️ Ícones personalizados
- ⚠️ Estilos e cores (theme)
- ⚠️ Anexos e imagens
- ⚠️ Links externos
- ⚠️ Notas
- ⚠️ Boundaries (contornos visuais)
- ⚠️ Vídeos incorporados
- ⚠️ Conexões customizadas (não-hierárquicas)

> **Nota Importante:** Estas propriedades serão **100% preservadas** na importação/exportação (salvas como JSON), mas não terão interface de edição no MVP.

### 4.3 🎨 Renderização Visual

**No MVP (v1.0):**
- Renderização com estilos **padrão do React Flow**
- Layout hierárquico funcional
- Cores e fontes simples e consistentes
- **Foco em funcionalidade**, não em fidelidade visual

**Em v1.1 (pós-MVP):**
- Aplicar **theme** completo do arquivo original
- Estilos personalizados por nó
- Cores, fontes, gradientes do tema original
- Fidelidade visual 100% com app original

**Justificativa:** Preservar todos os dados garante compatibilidade total. A renderização visual avançada pode ser adicionada depois sem quebrar compatibilidade.

---

## 5. Arquitetura

### 5.1 Stack Tecnológico

**Backend:**
- Laravel 12.35.1
- PHP 8.4
- MySQL 8.0
- Redis (cache/queue)

**Frontend:**
- React 18
- Inertia.js 2.0
- TailwindCSS 3
- React Flow (visualização de mapas)

**DevOps:**
- Docker + Laravel Sail
- Git

### 5.2 Padrões Arquiteturais

#### Backend (MVC + Services)
```
app/
├── Http/
│   ├── Controllers/
│   │   └── MindMapController.php
│   └── Requests/
│       ├── StoreMindMapRequest.php
│       └── UpdateMindMapRequest.php
├── Models/
│   ├── MindMap.php
│   └── Node.php
├── Policies/
│   └── MindMapPolicy.php
└── Services/
    ├── MindFileImporter.php
    └── MindFileExporter.php
```

#### Frontend (Pages + Components)
```
resources/js/
├── Pages/
│   └── MindMaps/
│       ├── Index.jsx          # Listagem
│       ├── Create.jsx         # Criar/Importar
│       └── Show.jsx           # Visualizar/Editar
└── Components/
    └── MindMap/
        ├── Canvas.jsx         # Canvas principal (React Flow)
        ├── NodeEditor.jsx     # Modal de edição
        ├── Toolbar.jsx        # Barra de ferramentas
        └── ImportModal.jsx    # Upload de .mind
```

---

## 6. Modelagem do Banco de Dados

### 6.1 Diagrama ER

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │         │   mindmaps   │         │    nodes    │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id          │───┐     │ id           │───┐     │ id          │
│ name        │   │     │ user_id      │◄──┘     │ mindmap_id  │◄──┐
│ email       │   │     │ title        │         │ parent_id   │◄──┼─┐
│ password    │   │     │ map_version  │         │ title       │   │ │
│ created_at  │   │     │ created_at   │         │ rank        │   │ │
│ updated_at  │   │     │ updated_at   │         │ pos_x       │   │ │
└─────────────┘   │     └──────────────┘         │ pos_y       │   │ │
                  │                               │ icon        │   │ │
                  │                               │ style       │   │ │
                  │                               │ note        │   │ │
                  │                               │ link        │   │ │
                  │                               │ task_data   │   │ │
                  │                               │ attachments │   │ │
                  │                               │ image       │   │ │
                  │                               │ properties  │   │ │
                  │                               │ created_at  │   │ │
                  │                               │ updated_at  │   │ │
                  │                               └─────────────┘   │ │
                  │                                                 │ │
                  └─────────────────────────────────────────────────┘ │
                           hasMany                  belongsTo         │
                                                                       │
                                                      self-referencing │
                                                      (parent_id)     ─┘
```

### 6.2 Schema SQL

#### Tabela: mindmaps
```sql
CREATE TABLE mindmaps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    map_version VARCHAR(10) DEFAULT '3.0',

    -- Propriedades de layout e tema (preservar compatibilidade)
    layout INT DEFAULT 1,
    theme_data JSON NULL COMMENT 'Tema visual completo (estilos, cores, fontes)',

    -- Metadados globais (preservar compatibilidade)
    metadata JSON NULL COMMENT 'attachments, connections, custom_colors, images, slides',

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_user_id (user_id),

    CONSTRAINT fk_mindmaps_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

**Estrutura do campo `metadata`:**
```json
{
  "attachments": [],
  "connections": [],
  "custom_colors": [],
  "images": [],
  "slides": []
}
```

#### Tabela: nodes
```sql
CREATE TABLE nodes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mindmap_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL,

    -- Propriedades básicas
    title TEXT NOT NULL,
    rank INT NULL,
    pos_x INT NULL,
    pos_y INT NULL,

    -- Propriedades visuais
    icon VARCHAR(255) NULL,
    style JSON NULL,

    -- Conteúdo adicional
    note TEXT NULL,
    link VARCHAR(500) NULL,

    -- Tasks
    task_data JSON NULL,  -- {from, until, resource, effort, notify}
    external_task JSON NULL,

    -- Anexos e mídia
    attachments JSON NULL,
    image VARCHAR(500) NULL,

    -- Propriedades visuais avançadas (preservar compatibilidade)
    boundary JSON NULL COMMENT 'Contorno visual de grupo',
    video JSON NULL COMMENT 'Vídeo incorporado',

    -- Metadados
    properties JSON NULL COMMENT 'id, idea_id, floating, offset_x, offset_y, free, layout',

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_mindmap_id (mindmap_id),
    INDEX idx_parent_id (parent_id),

    CONSTRAINT fk_nodes_mindmap
        FOREIGN KEY (mindmap_id)
        REFERENCES mindmaps(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_nodes_parent
        FOREIGN KEY (parent_id)
        REFERENCES nodes(id)
        ON DELETE CASCADE
);
```

### 6.3 Migrations Laravel

```php
// database/migrations/xxxx_create_mindmaps_table.php
Schema::create('mindmaps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('title');
    $table->string('map_version', 10)->default('3.0');

    // Campos para preservar compatibilidade 100%
    $table->integer('layout')->default(1);
    $table->json('theme_data')->nullable();
    $table->json('metadata')->nullable(); // attachments, connections, etc

    $table->timestamps();

    $table->index('user_id');
});

// database/migrations/xxxx_create_nodes_table.php
Schema::create('nodes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('mindmap_id')->constrained()->onDelete('cascade');
    $table->foreignId('parent_id')->nullable()->constrained('nodes')->onDelete('cascade');

    $table->text('title');
    $table->integer('rank')->nullable();
    $table->integer('pos_x')->nullable();
    $table->integer('pos_y')->nullable();

    $table->string('icon')->nullable();
    $table->json('style')->nullable();

    $table->text('note')->nullable();
    $table->string('link', 500)->nullable();

    $table->json('task_data')->nullable();
    $table->json('external_task')->nullable();

    $table->json('attachments')->nullable();
    $table->string('image', 500)->nullable();

    // Campos para preservar compatibilidade 100%
    $table->json('boundary')->nullable();
    $table->json('video')->nullable();

    $table->json('properties')->nullable();

    $table->timestamps();

    $table->index('mindmap_id');
    $table->index('parent_id');
});
```

---

## 7. Estrutura de Backend

### 7.1 Models

#### MindMap.php
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MindMap extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'map_version',
        'layout',
        'theme_data',
        'metadata',
    ];

    protected $casts = [
        'layout' => 'integer',
        'theme_data' => 'array',
        'metadata' => 'array',
    ];

    // Relacionamentos
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function nodes(): HasMany
    {
        return $this->hasMany(Node::class);
    }

    public function rootNode()
    {
        return $this->nodes()->whereNull('parent_id')->first();
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
```

#### Node.php
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    protected $fillable = [
        'mindmap_id',
        'parent_id',
        'title',
        'rank',
        'pos_x',
        'pos_y',
        'icon',
        'style',
        'note',
        'link',
        'task_data',
        'external_task',
        'attachments',
        'image',
        'boundary',
        'video',
        'properties',
    ];

    protected $casts = [
        'rank' => 'integer',
        'pos_x' => 'integer',
        'pos_y' => 'integer',
        'style' => 'array',
        'task_data' => 'array',
        'external_task' => 'array',
        'attachments' => 'array',
        'boundary' => 'array',
        'video' => 'array',
        'properties' => 'array',
    ];

    // Relacionamentos
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(MindMap::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Node::class, 'parent_id');
    }
}
```

#### User.php (adicionar)
```php
public function mindmaps(): HasMany
{
    return $this->hasMany(MindMap::class);
}
```

### 7.2 Policies

#### MindMapPolicy.php
```php
namespace App\Policies;

use App\Models\MindMap;
use App\Models\User;

class MindMapPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Usuário logado pode ver lista
    }

    public function view(User $user, MindMap $mindMap): bool
    {
        return $mindMap->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, MindMap $mindMap): bool
    {
        return $mindMap->user_id === $user->id;
    }

    public function delete(User $user, MindMap $mindMap): bool
    {
        return $mindMap->user_id === $user->id;
    }
}
```

### 7.3 Controllers

#### MindMapController.php
```php
namespace App\Http\Controllers;

use App\Models\MindMap;
use App\Services\MindFileImporter;
use App\Services\MindFileExporter;
use Illuminate\Http\Request;

class MindMapController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // Listar mapas do usuário
    public function index()
    {
        $mindmaps = auth()->user()
            ->mindmaps()
            ->latest()
            ->get();

        return inertia('MindMaps/Index', [
            'mindmaps' => $mindmaps
        ]);
    }

    // Página de criação/importação
    public function create()
    {
        return inertia('MindMaps/Create');
    }

    // Criar mapa vazio
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $mindmap = auth()->user()->mindmaps()->create($validated);

        // Criar nó raiz
        $mindmap->nodes()->create([
            'title' => $validated['title'],
            'rank' => null,
            'pos_x' => null,
            'pos_y' => null,
        ]);

        return redirect()->route('mindmaps.show', $mindmap);
    }

    // Importar arquivo .mind
    public function import(Request $request, MindFileImporter $importer)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:mind,zip|max:10240', // 10MB
        ]);

        $mindmap = $importer->import(
            $validated['file'],
            auth()->user()
        );

        return redirect()->route('mindmaps.show', $mindmap);
    }

    // Visualizar/Editar mapa
    public function show(MindMap $mindmap)
    {
        $this->authorize('view', $mindmap);

        return inertia('MindMaps/Show', [
            'mindmap' => $mindmap->load('nodes')
        ]);
    }

    // Atualizar mapa
    public function update(Request $request, MindMap $mindmap)
    {
        $this->authorize('update', $mindmap);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'nodes' => 'sometimes|array',
        ]);

        if (isset($validated['title'])) {
            $mindmap->update(['title' => $validated['title']]);
        }

        if (isset($validated['nodes'])) {
            // Lógica de salvar nós
            $this->updateNodes($mindmap, $validated['nodes']);
        }

        return back();
    }

    // Excluir mapa
    public function destroy(MindMap $mindmap)
    {
        $this->authorize('delete', $mindmap);

        $mindmap->delete(); // Cascata deleta nós

        return redirect()->route('mindmaps.index');
    }

    // Exportar como .mind
    public function export(MindMap $mindmap, MindFileExporter $exporter)
    {
        $this->authorize('view', $mindmap);

        $zipFile = $exporter->export($mindmap);

        return response()->download($zipFile, $mindmap->title . '.mind');
    }

    // Duplicar mapa
    public function duplicate(MindMap $mindmap)
    {
        $this->authorize('view', $mindmap);

        $newMindmap = $mindmap->replicate();
        $newMindmap->title = $mindmap->title . ' (Cópia)';
        $newMindmap->user_id = auth()->id();
        $newMindmap->save();

        // Duplicar nós recursivamente
        $this->duplicateNodes($mindmap->rootNode(), $newMindmap, null);

        return redirect()->route('mindmaps.show', $newMindmap);
    }
}
```

### 7.4 Services

#### MindFileImporter.php
```php
namespace App\Services;

use App\Models\MindMap;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use ZipArchive;

class MindFileImporter
{
    public function import(UploadedFile $file, User $user): MindMap
    {
        // 1. Extrair arquivo ZIP
        $extractPath = storage_path('app/temp/' . uniqid());
        $zip = new ZipArchive();
        $zip->open($file->getRealPath());
        $zip->extractTo($extractPath);
        $zip->close();

        // 2. Ler map.json
        $mapJsonPath = $extractPath . '/map.json';

        if (!file_exists($mapJsonPath)) {
            throw new \Exception('Arquivo map.json não encontrado');
        }

        $mapData = json_decode(file_get_contents($mapJsonPath), true);

        // 3. Validar estrutura
        $this->validate($mapData);

        // 4. Criar MindMap (preservar TUDO para compatibilidade 100%)
        $mindmap = $user->mindmaps()->create([
            'title' => $mapData['root']['title'],
            'map_version' => $mapData['map_version'] ?? '3.0',
            'layout' => $mapData['layout'] ?? 1,
            'theme_data' => $mapData['theme'] ?? null,
            'metadata' => [
                'attachments' => $mapData['attachments'] ?? [],
                'connections' => $mapData['connections'] ?? [],
                'custom_colors' => $mapData['custom_colors'] ?? [],
                'images' => $mapData['images'] ?? [],
                'slides' => $mapData['slides'] ?? [],
            ],
        ]);

        // 5. Salvar nós recursivamente
        $this->saveNode($mindmap, null, $mapData['root']);

        // 6. Limpar arquivos temporários
        $this->cleanTemp($extractPath);

        return $mindmap;
    }

    protected function validate(array $mapData): void
    {
        if (!isset($mapData['map_version']) || !isset($mapData['root'])) {
            throw new \Exception('Estrutura de arquivo inválida');
        }
    }

    protected function saveNode(MindMap $mindmap, ?int $parentId, array $nodeData): void
    {
        $node = $mindmap->nodes()->create([
            'parent_id' => $parentId,
            'title' => $nodeData['title'],
            'rank' => $nodeData['rank'] ?? null,
            'pos_x' => $nodeData['pos'][0] ?? null,
            'pos_y' => $nodeData['pos'][1] ?? null,
            'icon' => $nodeData['icon'] ?? null,
            'style' => $nodeData['style'] ?? null,
            'note' => $nodeData['note'] ?? null,
            'link' => $nodeData['link'] ?? null,
            'task_data' => $nodeData['task'] ?? null,
            'external_task' => $nodeData['external_task'] ?? null,
            'attachments' => $nodeData['attachments'] ?? null,
            'image' => $nodeData['image'] ?? null,
            'boundary' => $nodeData['boundary'] ?? null,
            'video' => $nodeData['video'] ?? null,
            'properties' => $nodeData['property'] ?? null,
        ]);

        // Recursivo para filhos
        if (isset($nodeData['children']) && is_array($nodeData['children'])) {
            foreach ($nodeData['children'] as $child) {
                $this->saveNode($mindmap, $node->id, $child);
            }
        }
    }

    protected function cleanTemp(string $path): void
    {
        // Remover diretório temporário
        exec("rm -rf " . escapeshellarg($path));
    }
}
```

#### MindFileExporter.php
```php
namespace App\Services;

use App\Models\MindMap;
use ZipArchive;

class MindFileExporter
{
    public function export(MindMap $mindmap): string
    {
        // 1. Gerar estrutura JSON (compatibilidade 100%)
        $metadata = $mindmap->metadata ?? [];

        $mapData = [
            'map_version' => $mindmap->map_version,
            'layout' => $mindmap->layout,
            'theme' => $mindmap->theme_data,
            'attachments' => $metadata['attachments'] ?? [],
            'connections' => $metadata['connections'] ?? [],
            'custom_colors' => $metadata['custom_colors'] ?? [],
            'images' => $metadata['images'] ?? [],
            'slides' => $metadata['slides'] ?? [],
            'root' => $this->buildNodeData($mindmap->rootNode()),
        ];

        // 2. Salvar map.json temporariamente
        $tempDir = storage_path('app/temp/' . uniqid());
        mkdir($tempDir, 0755, true);

        $jsonPath = $tempDir . '/map.json';
        file_put_contents($jsonPath, json_encode($mapData, JSON_PRETTY_PRINT));

        // 3. Criar arquivo ZIP
        $zipPath = $tempDir . '.mind';
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE);
        $zip->addFile($jsonPath, 'map.json');
        $zip->close();

        // 4. Limpar arquivos temporários
        unlink($jsonPath);
        rmdir($tempDir);

        return $zipPath;
    }

    protected function buildNodeData($node): array
    {
        $data = [
            'id' => $node->id,
            'title' => $node->title,
            'rank' => $node->rank,
            'pos' => [$node->pos_x, $node->pos_y],
            'icon' => $node->icon,
            'style' => $node->style,
            'created_at' => $node->created_at?->toISOString(),
            'updated_at' => $node->updated_at?->toISOString(),
            'note' => $node->note,
            'link' => $node->link,
            'task' => $node->task_data,
            'external_task' => $node->external_task,
            'attachments' => $node->attachments ?? [],
            'image' => $node->image,
            'boundary' => $node->boundary,
            'video' => $node->video,
            'property' => $node->properties,
            'children' => [],
        ];

        // Recursivo para filhos
        foreach ($node->children as $child) {
            $data['children'][] = $this->buildNodeData($child);
        }

        return $data;
    }
}
```

### 7.5 Routes

```php
// routes/web.php

use App\Http\Controllers\MindMapController;

Route::middleware(['auth'])->prefix('mindmaps')->name('mindmaps.')->group(function () {
    Route::get('/', [MindMapController::class, 'index'])->name('index');
    Route::get('/create', [MindMapController::class, 'create'])->name('create');
    Route::post('/', [MindMapController::class, 'store'])->name('store');
    Route::post('/import', [MindMapController::class, 'import'])->name('import');
    Route::get('/{mindmap}', [MindMapController::class, 'show'])->name('show');
    Route::put('/{mindmap}', [MindMapController::class, 'update'])->name('update');
    Route::delete('/{mindmap}', [MindMapController::class, 'destroy'])->name('destroy');
    Route::get('/{mindmap}/export', [MindMapController::class, 'export'])->name('export');
    Route::post('/{mindmap}/duplicate', [MindMapController::class, 'duplicate'])->name('duplicate');
});
```

---

## 8. Estrutura de Frontend

### 8.1 Biblioteca de Visualização

**Escolha: React Flow**

**Motivos:**
- ✅ Drag & drop nativo
- ✅ Zoom e pan inclusos
- ✅ Customização de nós
- ✅ Bem documentado
- ✅ Comunidade ativa
- ✅ Performance com muitos nós

**Instalação:**
```bash
./sail npm install reactflow
```

### 8.2 Páginas

#### Index.jsx (Listagem)
```jsx
// resources/js/Pages/MindMaps/Index.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ mindmaps }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Meus Mapas Mentais</h2>
                    <Link
                        href={route('mindmaps.create')}
                        className="btn-primary"
                    >
                        Novo Mapa
                    </Link>
                </div>
            }
        >
            <Head title="Mapas Mentais" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {mindmaps.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                Você ainda não criou nenhum mapa mental.
                            </p>
                            <Link
                                href={route('mindmaps.create')}
                                className="btn-primary mt-4"
                            >
                                Criar Primeiro Mapa
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mindmaps.map((mindmap) => (
                                <MindMapCard key={mindmap.id} mindmap={mindmap} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

#### Create.jsx (Criar/Importar)
```jsx
// resources/js/Pages/MindMaps/Create.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create() {
    const [mode, setMode] = useState('create'); // 'create' ou 'import'

    const createForm = useForm({
        title: '',
    });

    const importForm = useForm({
        file: null,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('mindmaps.store'));
    };

    const handleImport = (e) => {
        e.preventDefault();
        importForm.post(route('mindmaps.import'));
    };

    return (
        <AuthenticatedLayout header={<h2>Novo Mapa Mental</h2>}>
            <Head title="Novo Mapa" />

            <div className="max-w-2xl mx-auto py-12">
                {/* Toggle entre Criar e Importar */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setMode('create')}
                        className={mode === 'create' ? 'active' : ''}
                    >
                        Criar Novo
                    </button>
                    <button
                        onClick={() => setMode('import')}
                        className={mode === 'import' ? 'active' : ''}
                    >
                        Importar .mind
                    </button>
                </div>

                {mode === 'create' ? (
                    <form onSubmit={handleCreate}>
                        {/* Form de criação */}
                    </form>
                ) : (
                    <form onSubmit={handleImport}>
                        {/* Form de importação */}
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
```

#### Show.jsx (Visualizar/Editar)
```jsx
// resources/js/Pages/MindMaps/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import MindMapCanvas from '@/Components/MindMap/Canvas';
import Toolbar from '@/Components/MindMap/Toolbar';

export default function Show({ mindmap }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2>{mindmap.title}</h2>
                    <Toolbar mindmap={mindmap} />
                </div>
            }
        >
            <Head title={mindmap.title} />

            <div className="h-screen">
                <MindMapCanvas mindmap={mindmap} />
            </div>
        </AuthenticatedLayout>
    );
}
```

### 8.3 Componentes

#### Canvas.jsx
```jsx
// resources/js/Components/MindMap/Canvas.jsx

import ReactFlow, {
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useCallback } from 'react';

export default function Canvas({ mindmap }) {
    const [nodes, setNodes] = useState(transformNodesToReactFlow(mindmap.nodes));
    const [edges, setEdges] = useState(buildEdges(mindmap.nodes));

    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
}

// Funções auxiliares
function transformNodesToReactFlow(nodes) {
    return nodes.map(node => ({
        id: node.id.toString(),
        type: 'default',
        position: { x: node.pos_x || 0, y: node.pos_y || 0 },
        data: { label: node.title },
    }));
}

function buildEdges(nodes) {
    return nodes
        .filter(node => node.parent_id)
        .map(node => ({
            id: `e${node.parent_id}-${node.id}`,
            source: node.parent_id.toString(),
            target: node.id.toString(),
        }));
}
```

#### Toolbar.jsx
```jsx
// resources/js/Components/MindMap/Toolbar.jsx

import { Link } from '@inertiajs/react';

export default function Toolbar({ mindmap }) {
    const handleExport = () => {
        window.location.href = route('mindmaps.export', mindmap.id);
    };

    return (
        <div className="flex gap-2">
            <button onClick={handleExport}>
                Exportar .mind
            </button>
            <Link href={route('mindmaps.index')}>
                Voltar
            </Link>
        </div>
    );
}
```

---

## 9. Fluxos de Usuário

### 9.1 Fluxo de Criação

```
1. Login → Dashboard
2. Clicar "Novo Mapa"
3. Escolher "Criar Novo"
4. Digitar título
5. Clicar "Criar"
6. Redirecionado para tela de edição
7. Mapa com nó raiz criado
```

### 9.2 Fluxo de Importação

```
1. Login → Dashboard
2. Clicar "Novo Mapa"
3. Escolher "Importar .mind"
4. Fazer upload do arquivo
5. Sistema valida e extrai
6. Preview (opcional)
7. Clicar "Importar"
8. Redirecionado para visualização
9. Mapa renderizado com todos os nós
```

### 9.3 Fluxo de Edição

```
1. Acessar mapa (lista → visualizar)
2. Canvas carrega com React Flow
3. Adicionar nó:
   - Clicar em nó pai
   - Clicar "Adicionar Filho"
   - Modal abre
   - Digitar título
   - Confirmar
4. Editar nó:
   - Duplo clique no nó
   - Modal abre
   - Editar título
   - Confirmar
5. Mover nó:
   - Arrastar nó
   - Soltar em nova posição
6. Remover nó:
   - Clicar em nó
   - Clicar "Remover"
   - Confirmar
7. Salvar:
   - Auto-save ou botão "Salvar"
   - Feedback visual
```

### 9.4 Fluxo de Exportação

```
1. Visualizar mapa
2. Clicar "Exportar .mind"
3. Sistema gera JSON
4. Compacta em ZIP
5. Download automático
6. Arquivo compatível com app original
```

---

## 10. Tecnologias e Bibliotecas

### 10.1 Dependências PHP

**Instaladas:**
```json
{
  "laravel/framework": "^12.0",
  "inertiajs/inertia-laravel": "^2.0",
  "laravel/sanctum": "^4.0",
  "tightenco/ziggy": "^2.0"
}
```

**Nenhuma dependência adicional necessária** (ZipArchive é nativo do PHP)

### 10.2 Dependências JavaScript

**Novas:**
```bash
./sail npm install reactflow
```

**Já instaladas:**
- React 18
- Inertia.js
- TailwindCSS
- HeadlessUI

### 10.3 Configurações

**TailwindCSS:**
Adicionar configurações para garantir altura total no canvas:

```js
// tailwind.config.js
module.exports = {
    content: [
        // ...
    ],
    theme: {
        extend: {
            height: {
                'screen-minus-nav': 'calc(100vh - 64px)',
            }
        },
    },
}
```

---

## 11. Ordem de Desenvolvimento

### 11.1 Fase 1: Backend Base (2-3 dias)

#### Dia 1
- [x] Criar migrations (mindmaps, nodes)
- [x] Criar models (MindMap, Node)
- [x] Adicionar relacionamento em User
- [x] Criar MindMapPolicy
- [x] Testar relacionamentos no tinker

#### Dia 2
- [x] Criar MindMapController (esqueleto)
- [x] Implementar index, create, store
- [x] Implementar show, update, destroy
- [x] Configurar rotas
- [x] Testar CRUD básico

#### Dia 3
- [x] Criar MindFileImporter service
- [x] Criar MindFileExporter service
- [x] Implementar import/export no controller
- [x] Testar importação/exportação com mind.mind

### 11.2 Fase 2: Frontend Base (2-3 dias)

#### Dia 4
- [x] Criar Index.jsx (listagem)
- [x] Criar MindMapCard component
- [x] Estilizar com Tailwind
- [x] Testar listagem

#### Dia 5
- [x] Criar Create.jsx (criar/importar)
- [x] Implementar formulário de criação
- [x] Implementar upload de arquivo
- [x] Testar criação e importação

#### Dia 6
- [x] Instalar React Flow
- [x] Criar Show.jsx
- [x] Criar Canvas.jsx
- [x] Renderizar mapa (read-only)
- [x] Testar visualização

### 11.3 Fase 3: Edição (3-4 dias)

#### Dia 7-8
- [x] Implementar drag & drop
- [x] Salvar posições
- [x] Criar NodeEditor modal
- [x] Implementar edição de título

#### Dia 9-10
- [x] Implementar adicionar nó
- [x] Implementar remover nó
- [x] Implementar reparentar nó
- [x] Auto-save ou botão salvar
- [x] Feedback visual

### 11.4 Fase 4: Polimento (2-3 dias)

#### Dia 11
- [x] Validações completas
- [x] Mensagens de erro
- [x] Loading states
- [x] Confirmações (exclusão)

#### Dia 12
- [x] Duplicar mapa
- [x] Toolbar completa
- [x] Responsividade
- [x] Testes manuais

#### Dia 13
- [x] Revisão geral
- [x] Ajustes finais
- [x] Documentação de uso
- [x] Deploy

**Total: ~10-13 dias de desenvolvimento**

---

## 12. Fora do Escopo (v2)

### 12.1 Funcionalidades Avançadas
- ❌ Colaboração em tempo real
- ❌ Compartilhamento de mapas
- ❌ Permissões granulares
- ❌ Comentários em nós
- ❌ Histórico de versões
- ❌ Ctrl+Z / Redo

### 12.2 Edição Avançada
- ❌ Editar tasks (datas, recursos)
- ❌ Upload de ícones customizados
- ❌ Editor de cores/estilos
- ❌ Upload de anexos
- ❌ Upload de imagens
- ❌ Editor de notas rico (markdown)

### 12.3 Exportação/Importação
- ❌ Exportar como PNG
- ❌ Exportar como PDF
- ❌ Exportar como SVG
- ❌ Importar de outros formatos

### 12.4 UX/UI
- ❌ Templates prontos
- ❌ Temas (claro/escuro)
- ❌ Atalhos de teclado
- ❌ Tour guiado
- ❌ Mobile app nativo

### 12.5 Integrações
- ❌ Google Drive
- ❌ Dropbox
- ❌ Notion
- ❌ Trello
- ❌ API pública

---

## 13. Checklist de Implementação

### 13.1 Backend

#### Banco de Dados
- [ ] Migration: create_mindmaps_table
- [ ] Migration: create_nodes_table
- [ ] Executar migrations
- [ ] Testar estrutura no MySQL

#### Models
- [ ] Model MindMap
  - [ ] Fillable
  - [ ] Relationships (user, nodes)
  - [ ] Scopes
- [ ] Model Node
  - [ ] Fillable
  - [ ] Casts (JSON)
  - [ ] Relationships (mindmap, parent, children)
- [ ] User: adicionar relationship mindmaps

#### Authorization
- [ ] MindMapPolicy
  - [ ] viewAny
  - [ ] view
  - [ ] create
  - [ ] update
  - [ ] delete
- [ ] Registrar policy no AuthServiceProvider

#### Services
- [ ] MindFileImporter
  - [ ] Descompactar ZIP
  - [ ] Validar map.json
  - [ ] Salvar MindMap
  - [ ] Salvar Nodes (recursivo)
  - [ ] Limpar temp
- [ ] MindFileExporter
  - [ ] Buscar MindMap + Nodes
  - [ ] Gerar JSON
  - [ ] Compactar ZIP
  - [ ] Retornar arquivo

#### Controller
- [ ] MindMapController
  - [ ] index (listar)
  - [ ] create (form)
  - [ ] store (criar)
  - [ ] import (importar .mind)
  - [ ] show (visualizar)
  - [ ] update (salvar edições)
  - [ ] destroy (excluir)
  - [ ] export (download .mind)
  - [ ] duplicate (duplicar)

#### Routes
- [ ] Grupo auth
- [ ] Prefix mindmaps
- [ ] Todas as rotas necessárias

#### Validação
- [ ] StoreMindMapRequest
- [ ] UpdateMindMapRequest
- [ ] Validar upload de arquivo

### 13.2 Frontend

#### Instalação
- [ ] npm install reactflow

#### Páginas
- [ ] Index.jsx
  - [ ] Listar mapas
  - [ ] Card de mapa
  - [ ] Botão novo mapa
  - [ ] Mensagem vazia
- [ ] Create.jsx
  - [ ] Toggle criar/importar
  - [ ] Form criar
  - [ ] Form importar
  - [ ] Validação
- [ ] Show.jsx
  - [ ] Header com título
  - [ ] Toolbar
  - [ ] Canvas fullscreen

#### Componentes MindMap
- [ ] Canvas.jsx
  - [ ] React Flow setup
  - [ ] Transform nodes
  - [ ] Build edges
  - [ ] Drag & drop
  - [ ] Zoom/pan
- [ ] Toolbar.jsx
  - [ ] Botão exportar
  - [ ] Botão adicionar nó
  - [ ] Botão salvar
  - [ ] Botão voltar
- [ ] NodeEditor.jsx
  - [ ] Modal
  - [ ] Form edição
  - [ ] Validação
  - [ ] Salvar/cancelar
- [ ] MindMapCard.jsx
  - [ ] Preview
  - [ ] Título
  - [ ] Data
  - [ ] Ações (ver, duplicar, excluir)
- [ ] ImportModal.jsx
  - [ ] Upload area
  - [ ] Preview opcional
  - [ ] Importar/cancelar

#### Estilização
- [ ] Tailwind classes
- [ ] Responsividade
- [ ] Estados (hover, active, disabled)
- [ ] Feedback visual (loading, success, error)

### 13.3 Integração

#### API Calls
- [ ] Listar mapas
- [ ] Criar mapa
- [ ] Importar mapa
- [ ] Buscar mapa
- [ ] Salvar edições
- [ ] Excluir mapa
- [ ] Exportar mapa
- [ ] Duplicar mapa

#### Estados
- [ ] Loading
- [ ] Success
- [ ] Error
- [ ] Empty

#### Navegação
- [ ] Redirect após criar
- [ ] Redirect após importar
- [ ] Redirect após excluir
- [ ] Back button

### 13.4 Testes

#### Testes Manuais
- [ ] Criar mapa vazio
- [ ] Importar mind.mind
- [ ] Visualizar mapa
- [ ] Adicionar nó
- [ ] Editar nó
- [ ] Mover nó
- [ ] Remover nó
- [ ] Salvar edições
- [ ] Exportar mapa
- [ ] Testar compatibilidade do exportado
- [ ] Duplicar mapa
- [ ] Excluir mapa

#### Validações
- [ ] Usuário não pode ver mapas de outros
- [ ] Usuário não pode editar mapas de outros
- [ ] Usuário não pode excluir mapas de outros
- [ ] Upload apenas .mind ou .zip
- [ ] Tamanho máximo de arquivo
- [ ] Validar estrutura JSON

#### Edge Cases
- [ ] Mapa com 100+ nós
- [ ] Nó sem filhos
- [ ] Nó com muitos filhos
- [ ] Arquivo .mind inválido
- [ ] Rede lenta
- [ ] Erro de servidor

### 13.5 Documentação

- [ ] README: como usar a aplicação
- [ ] Comentários no código
- [ ] JSDoc em funções complexas
- [ ] Documentação de API (opcional)

### 13.6 Deploy

- [ ] Variáveis de ambiente (.env)
- [ ] Build assets (npm run build)
- [ ] Migrations em produção
- [ ] Configurar storage
- [ ] Configurar permissões
- [ ] SSL/HTTPS
- [ ] Backup do banco

---

## 14. Considerações Finais

### 14.1 Performance
- Lazy load de mapas na listagem
- Paginação se > 50 mapas
- Index no banco (user_id, mindmap_id, parent_id)
- Cache de queries frequentes

### 14.2 Segurança
- CSRF tokens (automático no Laravel)
- Validação de ownership em todas as operações
- Sanitização de inputs
- Rate limiting em uploads
- Validação de MIME types

### 14.3 UX
- Loading states claros
- Mensagens de erro amigáveis
- Confirmações antes de ações destrutivas
- Auto-save ou prompt antes de sair
- Atalhos visuais (tooltips)

### 14.4 Próximos Passos Após MVP
1. Coletar feedback de usuários
2. Identificar features mais solicitadas
3. Melhorar performance baseado em métricas
4. Adicionar funcionalidades da v2 por prioridade
5. Considerar monetização (planos, storage)

---

**Documento revisado em:** 26 de outubro de 2025
**Status:** Pronto para desenvolvimento
**Próximo passo:** Iniciar Fase 1 (Backend Base)
