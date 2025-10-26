<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('nodes')->onDelete('cascade');

            // Conteúdo básico
            $table->string('title');
            $table->integer('rank')->default(0);
            $table->integer('pos_x')->nullable();
            $table->integer('pos_y')->nullable();

            // Conteúdo rico (opcional)
            $table->string('icon')->nullable();
            $table->json('style')->nullable();
            $table->text('note')->nullable();
            $table->text('link')->nullable();

            // Tarefas (opcional)
            $table->json('task_data')->nullable();
            $table->json('external_task')->nullable();

            // Anexos e mídia
            $table->json('attachments')->nullable();
            $table->json('image')->nullable();

            // Propriedades visuais avançadas (preservar compatibilidade)
            $table->json('boundary')->nullable();
            $table->json('video')->nullable();

            // Metadados
            $table->json('properties')->nullable(); // id, idea_id, floating, offset_x, offset_y, free, layout

            $table->timestamps();

            $table->index('mindmap_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nodes');
    }
};
