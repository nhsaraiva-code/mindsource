# Task 03 - Policies de Autorização

## Objetivo
Criar Policy para garantir que usuários só possam acessar seus próprios mapas mentais.

## Descrição
Implementar autorização baseada em policies para garantir isolamento de dados entre usuários. Um usuário só pode visualizar, editar e deletar seus próprios mapas.

## Arquivos a criar

### 1. `app/Policies/MindMapPolicy.php`

```php
<?php

namespace App\Policies;

use App\Models\MindMap;
use App\Models\User;

class MindMapPolicy
{
    /**
     * Determina se o usuário pode ver qualquer mapa mental
     */
    public function viewAny(User $user): bool
    {
        return true; // Usuário autenticado pode ver lista (apenas seus mapas)
    }

    /**
     * Determina se o usuário pode ver este mapa mental específico
     */
    public function view(User $user, MindMap $mindMap): bool
    {
        return $user->id === $mindMap->user_id;
    }

    /**
     * Determina se o usuário pode criar mapas mentais
     */
    public function create(User $user): bool
    {
        return true; // Qualquer usuário autenticado pode criar
    }

    /**
     * Determina se o usuário pode atualizar este mapa mental
     */
    public function update(User $user, MindMap $mindMap): bool
    {
        return $user->id === $mindMap->user_id;
    }

    /**
     * Determina se o usuário pode deletar este mapa mental
     */
    public function delete(User $user, MindMap $mindMap): bool
    {
        return $user->id === $mindMap->user_id;
    }

    /**
     * Determina se o usuário pode exportar este mapa mental
     */
    public function export(User $user, MindMap $mindMap): bool
    {
        return $user->id === $mindMap->user_id;
    }
}
```

### 2. Registrar Policy em `app/Providers/AppServiceProvider.php`

```php
use App\Models\MindMap;
use App\Policies\MindMapPolicy;
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::policy(MindMap::class, MindMapPolicy::class);
}
```

Ou em `app/Providers/AuthServiceProvider.php` (se existir):

```php
protected $policies = [
    MindMap::class => MindMapPolicy::class,
];
```

## Comandos para executar

```bash
# Criar policy
./vendor/bin/sail artisan make:policy MindMapPolicy --model=MindMap
```

## Critérios de aceitação

- [ ] Policy `MindMapPolicy` criada
- [ ] Método `viewAny()` implementado
- [ ] Método `view()` implementado (verifica user_id)
- [ ] Método `create()` implementado
- [ ] Método `update()` implementado (verifica user_id)
- [ ] Método `delete()` implementado (verifica user_id)
- [ ] Método `export()` implementado (verifica user_id)
- [ ] Policy registrada no AppServiceProvider ou AuthServiceProvider

## Validação

Testar no tinker:

```bash
./vendor/bin/sail artisan tinker

# Criar dois usuários
$user1 = User::first();
$user2 = User::skip(1)->first();

# Criar mapa do user1
$map = $user1->mindmaps()->create(['title' => 'Mapa User 1']);

# Testar autorização
Gate::allows('view', $map); // user1 atual - deve retornar true
Gate::forUser($user2)->allows('view', $map); // user2 - deve retornar false
```

## Dependências
- Task 02 - Models

## Próxima tarefa
Task 04 - Serviço de Importação
