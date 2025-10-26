# Task 10 - Complementos e Ajustes Finais

## Objetivo
Implementar funcionalidades complementares essenciais que completam o MVP: duplicação de mapas, preparação de diretórios storage e validações adicionais.

## Descrição
Esta task cobre itens críticos que não foram incluídos nas tasks anteriores mas são necessários para o MVP funcionar completamente conforme documentado.

## Arquivos a modificar

### 1. Adicionar método `duplicate()` em `app/Http/Controllers/MindMapController.php`

Adicionar ao final da classe:

```php
/**
 * Duplica um mapa mental existente
 */
public function duplicate(MindMap $mindmap)
{
    Gate::authorize('view', $mindmap);

    // Criar cópia do mapa
    $newMindmap = $mindmap->replicate();
    $newMindmap->title = $mindmap->title . ' (Cópia)';
    $newMindmap->user_id = auth()->id();
    $newMindmap->save();

    // Duplicar todos os nós recursivamente
    if ($mindmap->rootNode()) {
        $this->duplicateNodesRecursively($mindmap->rootNode(), $newMindmap, null);
    }

    return redirect()->route('mindmaps.show', $newMindmap)
        ->with('success', 'Mapa duplicado com sucesso!');
}

/**
 * Duplica nós recursivamente
 */
private function duplicateNodesRecursively(Node $node, MindMap $newMindmap, ?int $newParentId): Node
{
    // Criar cópia do nó
    $newNode = $node->replicate();
    $newNode->mindmap_id = $newMindmap->id;
    $newNode->parent_id = $newParentId;
    $newNode->save();

    // Duplicar filhos recursivamente
    foreach ($node->children as $child) {
        $this->duplicateNodesRecursively($child, $newMindmap, $newNode->id);
    }

    return $newNode;
}
```

Adicionar import no topo do arquivo:

```php
use App\Models\Node;
```

### 2. Adicionar rota de duplicação em `routes/web.php`

Adicionar dentro do grupo de rotas de mindmaps:

```php
Route::post('mindmaps/{mindmap}/duplicate', [MindMapController::class, 'duplicate'])
    ->name('mindmaps.duplicate');
```

### 3. Atualizar `resources/js/Pages/MindMaps/Index.jsx`

Adicionar botão "Duplicar" na tabela de ações. Substituir a célula de ações:

```jsx
<td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
    <div className="flex justify-end gap-2">
        <Link
            href={route('mindmaps.show', mindmap.id)}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
            Abrir
        </Link>
        <button
            onClick={() => router.post(route('mindmaps.duplicate', mindmap.id))}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
            Duplicar
        </button>
        <a
            href={route('mindmaps.export', mindmap.id)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
        >
            Exportar
        </a>
        <button
            onClick={() => handleDelete(mindmap)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
            Deletar
        </button>
    </div>
</td>
```

### 4. Melhorar validação em `app/Services/MindFileImporter.php`

Substituir o método `validate()`:

```php
/**
 * Valida estrutura do arquivo .mind
 */
protected function validate(array $mapData): void
{
    // Validar map_version
    if (!isset($mapData['map_version'])) {
        throw new \Exception('Estrutura inválida: map_version não encontrado');
    }

    // Validar root
    if (!isset($mapData['root']) || !is_array($mapData['root'])) {
        throw new \Exception('Estrutura inválida: nó raiz ausente ou inválido');
    }

    // Validar título do root
    if (!isset($mapData['root']['title']) || empty($mapData['root']['title'])) {
        throw new \Exception('Estrutura inválida: nó raiz sem título');
    }

    // Validar versão compatível
    $version = $mapData['map_version'];
    if (!in_array($version, ['2.0', '3.0'])) {
        throw new \Exception("Versão $version pode não ser compatível. Versões suportadas: 2.0, 3.0");
    }
}
```

### 5. Atualizar validação de MIME type em `app/Http/Controllers/MindMapController.php`

Modificar método `import()` para aceitar .mind como .zip:

```php
public function import(Request $request, MindFileImporter $importer)
{
    $request->validate([
        'file' => 'required|file|max:10240', // 10MB
    ]);

    $file = $request->file('file');

    // Validar que é um arquivo .mind ou .zip
    $extension = $file->getClientOriginalExtension();
    if (!in_array(strtolower($extension), ['mind', 'zip'])) {
        return back()->withErrors(['file' => 'O arquivo deve ter extensão .mind']);
    }

    $path = $file->store('temp');

    try {
        $mindmap = $importer->import(storage_path('app/' . $path), $request->user());

        // Limpar arquivo temporário
        unlink(storage_path('app/' . $path));

        return redirect()->route('mindmaps.show', $mindmap)
            ->with('success', 'Mapa importado com sucesso!');
    } catch (\Exception $e) {
        // Limpar arquivo em caso de erro
        if (file_exists(storage_path('app/' . $path))) {
            unlink(storage_path('app/' . $path));
        }

        return back()->withErrors(['file' => 'Erro ao importar: ' . $e->getMessage()]);
    }
}
```

## Comandos para executar

```bash
# 1. Criar diretórios necessários para storage
./vendor/bin/sail exec laravel.test mkdir -p storage/app/temp
./vendor/bin/sail exec laravel.test mkdir -p storage/app/exports
./vendor/bin/sail exec laravel.test chmod -R 775 storage/app/temp
./vendor/bin/sail exec laravel.test chmod -R 775 storage/app/exports

# 2. Adicionar .gitignore para não commitar arquivos temporários
echo "*" > storage/app/temp/.gitignore
echo "!.gitignore" >> storage/app/temp/.gitignore
echo "*" > storage/app/exports/.gitignore
echo "!.gitignore" >> storage/app/exports/.gitignore

# 3. Verificar rotas
./vendor/bin/sail artisan route:list --name=mindmaps

# 4. Testar no tinker
./vendor/bin/sail artisan tinker
```

## Critérios de aceitação

### Duplicação de Mapas
- [ ] Método `duplicate()` implementado no controller
- [ ] Método privado `duplicateNodesRecursively()` implementado
- [ ] Import de `Node` adicionado
- [ ] Rota `POST /mindmaps/{mindmap}/duplicate` criada
- [ ] Botão "Duplicar" adicionado na listagem
- [ ] Duplicar mapa cria novo mapa com "(Cópia)" no título
- [ ] Todos os nós são duplicados mantendo hierarquia
- [ ] Usuário é redirecionado para o novo mapa
- [ ] Mapa duplicado pertence ao usuário atual

### Diretórios Storage
- [ ] Diretório `storage/app/temp` criado
- [ ] Diretório `storage/app/exports` criado
- [ ] Permissões 775 aplicadas
- [ ] .gitignore criado em ambos os diretórios
- [ ] Diretórios não commitados no git (apenas .gitignore)

### Validações Melhoradas
- [ ] Validação de `map_version` implementada
- [ ] Validação de `root` implementada
- [ ] Validação de título do root implementada
- [ ] Validação de versão compatível (2.0, 3.0)
- [ ] Mensagens de erro claras e específicas
- [ ] Import valida extensão .mind ou .zip
- [ ] Arquivos temporários são limpos mesmo em caso de erro

### Interface
- [ ] Botão "Duplicar" visível na listagem
- [ ] Botão com cores corretas (azul)
- [ ] Dark mode aplicado no botão
- [ ] Mensagem de sucesso ao duplicar

## Validação

### Testar Duplicação

```bash
./vendor/bin/sail artisan tinker

# Criar mapa de teste
$user = User::first();
$map = $user->mindmaps()->create(['title' => 'Teste Original']);
$root = $map->nodes()->create(['title' => 'Raiz', 'rank' => 0]);
$child1 = $map->nodes()->create(['title' => 'Filho 1', 'parent_id' => $root->id, 'rank' => 0]);
$child2 = $map->nodes()->create(['title' => 'Filho 2', 'parent_id' => $root->id, 'rank' => 1]);

# Duplicar via controller (simular)
$controller = new App\Http\Controllers\MindMapController();
// Ou testar via interface
```

### Testar via Interface

1. **Duplicar Mapa:**
   - Acessar http://localhost/mindmaps
   - Clicar em "Duplicar" de um mapa existente
   - Verificar que novo mapa aparece com "(Cópia)"
   - Abrir mapa duplicado
   - Verificar que todos os nós estão lá
   - Verificar que hierarquia está preservada
   - Editar mapa duplicado (não deve afetar o original)

2. **Testar Import com Validação:**
   - Tentar importar arquivo .txt (deve rejeitar)
   - Tentar importar arquivo .zip sem map.json (deve dar erro claro)
   - Tentar importar .mind válido (deve funcionar)
   - Verificar mensagem de erro clara em caso de falha

3. **Verificar Diretórios:**
   - Importar um mapa
   - Verificar que `storage/app/temp` recebe arquivo temporário
   - Verificar que arquivo é deletado após importação
   - Exportar um mapa
   - Verificar que `storage/app/exports` contém o .mind
   - Baixar e verificar arquivo

4. **Dark Mode no Botão Duplicar:**
   - Alternar para dark mode
   - Verificar que botão "Duplicar" fica azul claro
   - Hover deve funcionar
   - Clicar e duplicar deve funcionar

## Comandos de Validação

```bash
# Verificar se diretórios existem
./vendor/bin/sail exec laravel.test ls -la storage/app/ | grep -E "temp|exports"

# Verificar permissões
./vendor/bin/sail exec laravel.test ls -la storage/app/temp
./vendor/bin/sail exec laravel.test ls -la storage/app/exports

# Verificar rota de duplicação
./vendor/bin/sail artisan route:list | grep duplicate

# Testar duplicação no tinker
./vendor/bin/sail artisan tinker
>>> $map = MindMap::first();
>>> $controller = app(App\Http\Controllers\MindMapController::class);
>>> // Verificar que método existe
>>> method_exists($controller, 'duplicate'); // true
>>> method_exists($controller, 'duplicateNodesRecursively'); // true
```

## Troubleshooting

### Erro: "Class 'Node' not found" no Controller
**Solução:** Adicionar `use App\Models\Node;` no topo do MindMapController.php

### Erro: "Permission denied" ao criar diretórios
**Solução:**
```bash
./vendor/bin/sail exec laravel.test chmod -R 775 storage/
./vendor/bin/sail exec laravel.test chown -R sail:sail storage/
```

### Erro: "Route [mindmaps.duplicate] not defined"
**Solução:** Verificar que a rota foi adicionada DENTRO do grupo `middleware(['auth', 'verified'])` em routes/web.php

### Botão "Duplicar" não aparece
**Solução:**
- Verificar que `router` foi importado no Index.jsx: `import { router } from '@inertiajs/react';`
- Limpar cache: `./vendor/bin/sail npm run dev`

## Dependências
- Task 06 - Controllers (para modificar)
- Task 07 - List Page (para adicionar botão)
- Task 04 - Importer (para melhorar validação)

## Próxima tarefa
Task 11 - Testes e Validação Final
