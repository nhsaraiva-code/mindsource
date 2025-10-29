<?php

use App\Http\Controllers\MindMapController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    // Buscar todos os mapas do usuário com seus nós
    $mindmaps = $user->mindmaps()->withCount('nodes')->get();

    // Calcular estatísticas
    $stats = [
        'total_mindmaps' => $mindmaps->count(),
        'total_nodes' => $mindmaps->sum('nodes_count'),
        'most_recent' => $mindmaps->sortByDesc('updated_at')->first(),
        'largest_map' => $mindmaps->sortByDesc('nodes_count')->first(),
    ];

    // Buscar mapas recentes (últimos 4)
    $recentMindmaps = $user->mindmaps()
        ->withCount('nodes')
        ->latest('updated_at')
        ->limit(4)
        ->get()
        ->map(fn($map) => [
            'id' => $map->id,
            'title' => $map->title,
            'nodes_count' => $map->nodes_count,
            'updated_at' => $map->updated_at->format('d/m/Y H:i'),
        ]);

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'recentMindmaps' => $recentMindmaps,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Mapas Mentais - rotas personalizadas devem vir ANTES do resource
    Route::post('mindmaps/import', [MindMapController::class, 'import'])->name('mindmaps.import');
    Route::get('mindmaps/{mindmap}/export', [MindMapController::class, 'export'])->name('mindmaps.export');
    Route::post('mindmaps/{mindmap}/duplicate', [MindMapController::class, 'duplicate'])->name('mindmaps.duplicate');
    Route::post('mindmaps/{mindmap}/nodes', [MindMapController::class, 'storeNode'])->name('mindmaps.nodes.store');
    Route::put('mindmaps/{mindmap}/nodes/{node}', [MindMapController::class, 'updateNode'])->name('mindmaps.nodes.update');
    Route::delete('mindmaps/{mindmap}/nodes/{node}', [MindMapController::class, 'deleteNode'])->name('mindmaps.nodes.delete');
    Route::resource('mindmaps', MindMapController::class);
});

require __DIR__.'/auth.php';
