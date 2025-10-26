<?php

namespace App\Services;

use App\Models\MindMap;
use App\Models\Node;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class MindFileImporter
{
    /**
     * Importa arquivo .mind para o banco de dados
     *
     * @param string $filePath Caminho do arquivo .mind
     * @param User $user Usuário dono do mapa
     * @return MindMap
     */
    public function import(string $filePath, User $user): MindMap
    {
        // 1. Extrair ZIP
        $extractPath = $this->extractZip($filePath);

        // 2. Ler map.json
        $mapData = $this->readMapJson($extractPath);

        // 3. Criar MindMap e Nodes em transação
        $mindmap = DB::transaction(function () use ($mapData, $user) {
            return $this->createMindMap($mapData, $user);
        });

        // 4. Limpar arquivos temporários
        $this->cleanup($extractPath);

        return $mindmap;
    }

    /**
     * Extrai arquivo ZIP para diretório temporário
     */
    protected function extractZip(string $filePath): string
    {
        // Verificar se o arquivo existe
        if (!file_exists($filePath)) {
            throw new \Exception('Arquivo não encontrado: ' . $filePath);
        }

        $zip = new ZipArchive();
        $extractPath = storage_path('app/temp/' . uniqid('mind_'));

        $status = $zip->open($filePath);
        if ($status !== true) {
            // Mostrar código de erro específico
            $errors = [
                ZipArchive::ER_EXISTS => 'Arquivo já existe',
                ZipArchive::ER_INCONS => 'ZIP inconsistente',
                ZipArchive::ER_MEMORY => 'Erro de memória',
                ZipArchive::ER_NOENT => 'Arquivo não existe',
                ZipArchive::ER_NOZIP => 'Não é um arquivo ZIP válido',
                ZipArchive::ER_OPEN => 'Não foi possível abrir o arquivo',
                ZipArchive::ER_READ => 'Erro de leitura',
                ZipArchive::ER_SEEK => 'Erro de busca',
            ];
            $errorMsg = $errors[$status] ?? 'Erro desconhecido (' . $status . ')';
            throw new \Exception('Erro ao abrir arquivo .mind: ' . $errorMsg);
        }

        // Criar diretório de extração se não existir
        if (!is_dir(dirname($extractPath))) {
            mkdir(dirname($extractPath), 0755, true);
        }

        $zip->extractTo($extractPath);
        $zip->close();

        return $extractPath;
    }

    /**
     * Lê e decodifica map.json
     */
    protected function readMapJson(string $extractPath): array
    {
        $jsonPath = $extractPath . '/map.json';

        if (!file_exists($jsonPath)) {
            throw new \Exception('Arquivo map.json não encontrado no .mind');
        }

        $content = file_get_contents($jsonPath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Erro ao decodificar map.json: ' . json_last_error_msg());
        }

        return $data;
    }

    /**
     * Cria MindMap e seus nós
     */
    protected function createMindMap(array $mapData, User $user): MindMap
    {
        // Criar MindMap (preservar TUDO para compatibilidade 100%)
        $mindmap = $user->mindmaps()->create([
            'title' => $mapData['root']['title'] ?? 'Mapa sem título',
            'map_version' => $mapData['map_version'] ?? '3.0',
            'layout' => $mapData['layout'] ?? 1,
            'theme_data' => $mapData['theme'] ?? null,
            'metadata' => [
                'attachments' => $mapData['attachments'] ?? [],
                'connections' => $mapData['connections'] ?? [],
                'custom_colors' => $mapData['custom_colors'] ?? [],
                'images' => $mapData['images'] ?? [],
                'slides' => $mapData['slides'] ?? [],
            ],
        ]);

        // Criar nós recursivamente a partir do root
        if (isset($mapData['root'])) {
            $this->createNodesRecursively($mindmap, $mapData['root'], null);
        }

        return $mindmap;
    }

    /**
     * Cria nós recursivamente
     */
    protected function createNodesRecursively(MindMap $mindmap, array $nodeData, ?int $parentId): Node
    {
        // Criar nó atual
        $node = $this->saveNode($mindmap, $nodeData, $parentId);

        // Criar nós filhos recursivamente
        if (isset($nodeData['children']) && is_array($nodeData['children'])) {
            foreach ($nodeData['children'] as $childData) {
                $this->createNodesRecursively($mindmap, $childData, $node->id);
            }
        }

        return $node;
    }

    /**
     * Salva um nó no banco
     */
    protected function saveNode(MindMap $mindmap, array $nodeData, ?int $parentId): Node
    {
        return $mindmap->nodes()->create([
            'parent_id' => $parentId,
            'title' => $nodeData['title'] ?? '',
            'rank' => $nodeData['rank'] ?? 0,
            'pos_x' => $nodeData['pos'][0] ?? null,
            'pos_y' => $nodeData['pos'][1] ?? null,
            'icon' => $nodeData['icon'] ?? null,
            'style' => $nodeData['style'] ?? null,
            'note' => $nodeData['note'] ?? null,
            'link' => $nodeData['link'] ?? null,
            'task_data' => $nodeData['task'] ?? null,
            'external_task' => $nodeData['external_task'] ?? null,
            'attachments' => $nodeData['attachments'] ?? null,
            'image' => $nodeData['image'] ?? null,
            'boundary' => $nodeData['boundary'] ?? null,
            'video' => $nodeData['video'] ?? null,
            'properties' => $nodeData['property'] ?? null,
        ]);
    }

    /**
     * Limpa arquivos temporários
     */
    protected function cleanup(string $extractPath): void
    {
        if (file_exists($extractPath)) {
            $this->deleteDirectory($extractPath);
        }
    }

    /**
     * Deleta diretório recursivamente
     */
    protected function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }
}
