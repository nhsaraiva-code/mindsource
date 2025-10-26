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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Mapas Mentais
    Route::resource('mindmaps', MindMapController::class);
    Route::post('mindmaps/import', [MindMapController::class, 'import'])->name('mindmaps.import');
    Route::get('mindmaps/{mindmap}/export', [MindMapController::class, 'export'])->name('mindmaps.export');
    Route::post('mindmaps/{mindmap}/nodes', [MindMapController::class, 'storeNode'])->name('mindmaps.nodes.store');
    Route::put('mindmaps/{mindmap}/nodes/{node}', [MindMapController::class, 'updateNode'])->name('mindmaps.nodes.update');
    Route::delete('mindmaps/{mindmap}/nodes/{node}', [MindMapController::class, 'deleteNode'])->name('mindmaps.nodes.delete');
});

require __DIR__.'/auth.php';
