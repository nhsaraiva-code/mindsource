# Task 05 - Serviço de Exportação .mind

## Objetivo
Criar serviço para exportar mapas do banco de dados para arquivos .mind compatíveis.

## Descrição
Implementar `MindFileExporter` que:
1. Lê MindMap e seus nós do banco
2. Reconstrói estrutura JSON completa (com TODOS os campos)
3. Gera arquivo .mind (ZIP com map.json)
4. Garante compatibilidade 100% com formato original

## Arquivos a criar

### 1. `app/Services/MindFileExporter.php`

```php
<?php

namespace App\Services;

use App\Models\MindMap;
use App\Models\Node;
use ZipArchive;

class MindFileExporter
{
    /**
     * Exporta MindMap para arquivo .mind
     *
     * @param MindMap $mindmap
     * @return string Caminho do arquivo .mind gerado
     */
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

        // 2. Criar arquivo temporário
        $tempDir = storage_path('app/temp/' . uniqid('export_'));
        mkdir($tempDir, 0755, true);

        $jsonPath = $tempDir . '/map.json';
        file_put_contents($jsonPath, json_encode($mapData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 3. Criar ZIP
        $zipPath = storage_path('app/exports/' . $mindmap->id . '_' . time() . '.mind');
        $this->createZip($tempDir, $zipPath);

        // 4. Limpar temporários
        $this->cleanup($tempDir);

        return $zipPath;
    }

    /**
     * Constrói dados do nó recursivamente
     */
    protected function buildNodeData(Node $node): array
    {
        $data = [
            'title' => $node->title,
            'rank' => $node->rank,
        ];

        // Posição
        if ($node->pos_x !== null || $node->pos_y !== null) {
            $data['pos'] = [$node->pos_x ?? 0, $node->pos_y ?? 0];
        }

        // Campos opcionais (apenas se existirem)
        if ($node->icon) $data['icon'] = $node->icon;
        if ($node->style) $data['style'] = $node->style;
        if ($node->note) $data['note'] = $node->note;
        if ($node->link) $data['link'] = $node->link;
        if ($node->task_data) $data['task'] = $node->task_data;
        if ($node->external_task) $data['external_task'] = $node->external_task;
        if ($node->attachments) $data['attachments'] = $node->attachments;
        if ($node->image) $data['image'] = $node->image;
        if ($node->boundary) $data['boundary'] = $node->boundary;
        if ($node->video) $data['video'] = $node->video;

        // Properties (id, idea_id, etc)
        if ($node->properties) {
            foreach ($node->properties as $key => $value) {
                if ($value !== null) {
                    $data[$key] = $value;
                }
            }
        }

        // Filhos
        $children = $node->children()->get();
        if ($children->isNotEmpty()) {
            $data['children'] = $children->map(function ($child) {
                return $this->buildNodeData($child);
            })->toArray();
        }

        return $data;
    }

    /**
     * Cria arquivo ZIP
     */
    protected function createZip(string $sourceDir, string $zipPath): void
    {
        // Garantir que diretório de exports existe
        $exportsDir = dirname($zipPath);
        if (!is_dir($exportsDir)) {
            mkdir($exportsDir, 0755, true);
        }

        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \Exception('Não foi possível criar arquivo .mind');
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sourceDir),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($sourceDir) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();
    }

    /**
     * Limpa diretório temporário
     */
    protected function cleanup(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->cleanup($path) : unlink($path);
        }

        rmdir($dir);
    }
}
```

## Comandos para executar

```bash
# Criar diretório de exports
./vendor/bin/sail exec laravel.test mkdir -p storage/app/exports
```

## Critérios de aceitação

- [ ] Classe `MindFileExporter` criada
- [ ] Método `export()` implementado
- [ ] Estrutura JSON completa reconstruída
- [ ] Todos os campos do MindMap exportados (layout, theme_data, metadata)
- [ ] Todos os campos dos nós exportados
- [ ] Hierarquia de nós preservada (children recursivos)
- [ ] Arquivo ZIP criado corretamente
- [ ] map.json dentro do ZIP formatado (JSON_PRETTY_PRINT)
- [ ] Limpeza de arquivos temporários
- [ ] Diretório de exports criado se não existir

## Validação

```bash
./vendor/bin/sail artisan tinker

use App\Services\MindFileExporter;

$exporter = new MindFileExporter();
$mindmap = MindMap::first();
$filePath = $exporter->export($mindmap);

// Verificar arquivo
file_exists($filePath); // true

// Descompactar e verificar
$zip = new ZipArchive();
$zip->open($filePath);
$zip->extractTo('/tmp/test_export');
$zip->close();

$json = json_decode(file_get_contents('/tmp/test_export/map.json'), true);
echo $json['root']['title']; // Deve mostrar título do nó raiz
```

## Dependências
- Task 01 - Database
- Task 02 - Models
- Task 04 - Importer (para testar ciclo completo)

## Próxima tarefa
Task 06 - Controllers e Rotas
