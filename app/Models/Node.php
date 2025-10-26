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
        return $this->belongsTo(MindMap::class, 'mindmap_id');
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
