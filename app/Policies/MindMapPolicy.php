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
