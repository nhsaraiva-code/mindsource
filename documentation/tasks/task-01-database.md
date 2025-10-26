# Task 01 - Estrutura de Banco de Dados

## Objetivo
Criar as migrations para as tabelas `mindmaps` e `nodes` conforme especificado no MVP.

## Descrição
Implementar o schema de banco de dados que armazenará os mapas mentais e seus nós. Cada mapa pertence a um usuário e pode ter múltiplos nós hierárquicos.

## Arquivos a criar

### 1. `database/migrations/xxxx_create_mindmaps_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('mindmaps');
    }
};
```

### 2. `database/migrations/xxxx_create_nodes_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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

    public function down(): void
    {
        Schema::dropIfExists('nodes');
    }
};
```

## Comandos para executar

```bash
# Criar migrations
./vendor/bin/sail artisan make:migration create_mindmaps_table
./vendor/bin/sail artisan make:migration create_nodes_table

# Executar migrations
./vendor/bin/sail artisan migrate
```

## Critérios de aceitação

- [ ] Migration `create_mindmaps_table` criada
- [ ] Migration `create_nodes_table` criada
- [ ] Tabelas criadas no banco de dados sem erros
- [ ] Foreign keys configuradas corretamente
- [ ] Indexes criados nos campos apropriados
- [ ] Campos JSON para preservar compatibilidade com .mind
- [ ] Cascade delete funcionando (deletar mapa deleta todos os nós)

## Validação

```bash
# Verificar se as tabelas foram criadas
./vendor/bin/sail artisan db:show

# Verificar estrutura das tabelas
./vendor/bin/sail artisan db:table mindmaps
./vendor/bin/sail artisan db:table nodes
```

## Dependências
- Nenhuma

## Próxima tarefa
Task 02 - Models e Relacionamentos
