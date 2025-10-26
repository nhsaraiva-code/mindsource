<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MindMap extends Model
{
    use HasFactory;

    protected $table = 'mindmaps';

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
        return $this->hasMany(Node::class, 'mindmap_id');
    }

    /**
     * Nó raiz do mapa (sem parent_id)
     */
    public function rootNode()
    {
        return $this->nodes()->whereNull('parent_id')->first();
    }
}
