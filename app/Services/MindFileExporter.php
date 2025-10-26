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
        // Verificar se o mapa tem nó raiz
        $rootNode = $mindmap->rootNode();
        if (!$rootNode) {
            throw new \Exception('Este mapa mental não possui nós para exportar.');
        }

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
            'root' => $this->buildNodeData($rootNode),
        ];

        // 2. Criar arquivo temporário
        $tempDir = storage_path('app/temp/' . uniqid('export_'));
        mkdir($tempDir, 0755, true);

        $jsonPath = $tempDir . '/map.json';
        file_put_contents($jsonPath, json_encode($mapData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

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
            $data['pos'] = [$node->pos_x, $node->pos_y];
        } else {
            $data['pos'] = [null, null];
        }

        // Timestamps
        if ($node->created_at) {
            $data['created_at'] = $node->created_at->toIso8601String();
        }
        if ($node->updated_at) {
            $data['updated_at'] = $node->updated_at->toIso8601String();
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

        // Adicionar campos null se não existirem (compatibilidade)
        if (!isset($data['icon'])) $data['icon'] = null;
        if (!isset($data['style'])) $data['style'] = null;
        if (!isset($data['note'])) $data['note'] = null;
        if (!isset($data['link'])) $data['link'] = null;
        if (!isset($data['task'])) $data['task'] = null;
        if (!isset($data['external_task'])) $data['external_task'] = null;
        if (!isset($data['boundary'])) $data['boundary'] = null;
        if (!isset($data['video'])) $data['video'] = null;

        // Attachments e image sempre como arrays (mesmo vazios)
        if (!isset($data['attachments'])) $data['attachments'] = [];
        if (!isset($data['image'])) $data['image'] = null;

        // Properties (expandir como campos individuais se existir)
        if ($node->properties) {
            $data['property'] = $node->properties;
        } else {
            $data['property'] = null;
        }

        // Filhos
        $children = $node->children()->get();
        if ($children->isNotEmpty()) {
            $data['children'] = $children->map(function ($child) {
                return $this->buildNodeData($child);
            })->toArray();
        } else {
            $data['children'] = [];
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
