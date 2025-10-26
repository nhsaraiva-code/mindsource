# Task 04 - Serviço de Importação .mind

## Objetivo
Criar serviço para importar arquivos .mind e salvar no banco de dados com 100% de compatibilidade.

## Descrição
Implementar `MindFileImporter` que:
1. Extrai o arquivo .mind (ZIP)
2. Lê o map.json
3. Salva todos os dados no banco (preservando TUDO para compatibilidade)
4. Cria nós recursivamente respeitando hierarquia

## Arquivos a criar

### 1. `app/Services/MindFileImporter.php`

```php
<?php

namespace App\Services;

use App\Models\MindMap;
use App\Models\Node;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
        $zip = new ZipArchive();
        $extractPath = storage_path('app/temp/' . uniqid('mind_'));

        if ($zip->open($filePath) !== true) {
            throw new \Exception('Não foi possível abrir o arquivo .mind');
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
            'properties' => [
                'id' => $nodeData['id'] ?? null,
                'idea_id' => $nodeData['idea_id'] ?? null,
                'floating' => $nodeData['floating'] ?? null,
                'offset_x' => $nodeData['offset_x'] ?? null,
                'offset_y' => $nodeData['offset_y'] ?? null,
                'free' => $nodeData['free'] ?? null,
                'layout' => $nodeData['layout'] ?? null,
            ],
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
```

## Comandos para executar

```bash
# Criar serviço
mkdir -p app/Services
# Depois criar o arquivo manualmente
```

## Critérios de aceitação

- [ ] Classe `MindFileImporter` criada
- [ ] Método `import()` implementado
- [ ] Extração de ZIP funcionando
- [ ] Leitura de map.json funcionando
- [ ] Criação de MindMap com todos os campos
- [ ] Metadata (attachments, connections, etc) salva corretamente
- [ ] Nós criados recursivamente respeitando hierarquia
- [ ] Todos os campos do nó salvos (incluindo boundary, video, properties)
- [ ] Transação de banco de dados (rollback em caso de erro)
- [ ] Limpeza de arquivos temporários
- [ ] Tratamento de erros adequado

## Validação

```bash
./vendor/bin/sail artisan tinker

use App\Services\MindFileImporter;

$importer = new MindFileImporter();
$user = User::first();
$mindmap = $importer->import('/caminho/para/mind.mind', $user);

// Verificar
$mindmap->title;
$mindmap->nodes()->count();
$mindmap->rootNode()->children()->count();
```

## Dependências
- Task 01 - Database
- Task 02 - Models

## Próxima tarefa
Task 05 - Serviço de Exportação
