# Task 02 - Models e Relacionamentos

## Objetivo
Criar os Models `MindMap` e `Node` com seus relacionamentos e configurações.

## Descrição
Implementar os Eloquent Models que representarão mapas mentais e nós, incluindo relacionamentos hierárquicos e com usuários.

## Arquivos a criar

### 1. `app/Models/MindMap.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MindMap extends Model
{
    use HasFactory;

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

    /**
     * Usuário dono do mapa
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Todos os nós do mapa
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(Node::class);
    }

    /**
     * Nó raiz do mapa (sem parent_id)
     */
    public function rootNode()
    {
        return $this->nodes()->whereNull('parent_id')->first();
    }
}
```

### 2. `app/Models/Node.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    use HasFactory;

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
        'image' => 'array',
        'boundary' => 'array',
        'video' => 'array',
        'properties' => 'array',
    ];

    /**
     * Mapa mental ao qual este nó pertence
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(MindMap::class);
    }

    /**
     * Nó pai (hierarquia)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'parent_id');
    }

    /**
     * Nós filhos
     */
    public function children(): HasMany
    {
        return $this->hasMany(Node::class, 'parent_id')->orderBy('rank');
    }

    /**
     * Todos os descendentes recursivamente
     */
    public function descendants()
    {
        return $this->children()->with('descendants');
    }
}
```

### 3. Atualizar `app/Models/User.php`

Adicionar relacionamento com mapas:

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Mapas mentais do usuário
 */
public function mindmaps(): HasMany
{
    return $this->hasMany(MindMap::class);
}
```

## Comandos para executar

```bash
# Criar models
./vendor/bin/sail artisan make:model MindMap
./vendor/bin/sail artisan make:model Node
```

## Critérios de aceitação

- [ ] Model `MindMap` criado com todos os fillable e casts
- [ ] Model `Node` criado com todos os fillable e casts
- [ ] Relacionamento `user()` em MindMap
- [ ] Relacionamento `nodes()` em MindMap
- [ ] Método `rootNode()` em MindMap
- [ ] Relacionamento `mindmap()` em Node
- [ ] Relacionamento `parent()` em Node
- [ ] Relacionamento `children()` em Node (ordenado por rank)
- [ ] Método `descendants()` em Node (recursivo)
- [ ] Relacionamento `mindmaps()` adicionado ao User
- [ ] Todos os campos JSON configurados nos casts

## Validação

Testar no tinker:

```bash
./vendor/bin/sail artisan tinker

# Criar mapa de teste
$user = User::first();
$map = $user->mindmaps()->create(['title' => 'Teste']);

# Criar nó raiz
$root = $map->nodes()->create(['title' => 'Raiz']);

# Criar nó filho
$child = $map->nodes()->create(['title' => 'Filho', 'parent_id' => $root->id, 'rank' => 0]);

# Testar relacionamentos
$map->rootNode(); // deve retornar o nó raiz
$root->children; // deve retornar o filho
$child->parent; // deve retornar o raiz
```

## Dependências
- Task 01 - Database

## Próxima tarefa
Task 03 - Policies de Autorização
