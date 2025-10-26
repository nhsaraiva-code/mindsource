# Task 11 - Testes e Validação Final

## Objetivo
Criar testes automatizados e realizar validação manual completa do MVP, incluindo verificação de dark mode em todas as páginas.

## Descrição
Implementar testes unitários e de feature para garantir que todas as funcionalidades do MVP estão funcionando corretamente, com ênfase especial em dark mode.

## Arquivos a criar

### 1. `tests/Feature/MindMapTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\MindMap;
use App\Models\Node;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MindMapTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_view_their_mindmaps_list()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test Map']);

        $response = $this->actingAs($user)->get(route('mindmaps.index'));

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('MindMaps/Index')
            ->has('mindmaps', 1)
            ->where('mindmaps.0.title', 'Test Map')
        );
    }

    /** @test */
    public function user_cannot_view_other_users_mindmaps()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $mindmap = $user1->mindmaps()->create(['title' => 'User 1 Map']);

        $response = $this->actingAs($user2)->get(route('mindmaps.show', $mindmap));

        $response->assertForbidden();
    }

    /** @test */
    public function user_can_create_mindmap()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('mindmaps.store'), [
            'title' => 'New Map',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mindmaps', [
            'user_id' => $user->id,
            'title' => 'New Map',
        ]);

        // Verificar que nó raiz foi criado
        $mindmap = MindMap::where('title', 'New Map')->first();
        $this->assertCount(1, $mindmap->nodes);
        $this->assertNull($mindmap->nodes->first()->parent_id);
    }

    /** @test */
    public function user_can_update_mindmap_nodes()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test Map']);
        $node = $mindmap->nodes()->create(['title' => 'Root', 'pos_x' => 0, 'pos_y' => 0]);

        $response = $this->actingAs($user)->put(route('mindmaps.update', $mindmap), [
            'nodes' => [
                [
                    'id' => $node->id,
                    'title' => 'Updated Root',
                    'pos_x' => 100,
                    'pos_y' => 200,
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('nodes', [
            'id' => $node->id,
            'title' => 'Updated Root',
            'pos_x' => 100,
            'pos_y' => 200,
        ]);
    }

    /** @test */
    public function user_can_delete_mindmap()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test Map']);
        $node = $mindmap->nodes()->create(['title' => 'Root']);

        $response = $this->actingAs($user)->delete(route('mindmaps.destroy', $mindmap));

        $response->assertRedirect(route('mindmaps.index'));
        $this->assertDatabaseMissing('mindmaps', ['id' => $mindmap->id]);
        $this->assertDatabaseMissing('nodes', ['id' => $node->id]); // Cascade delete
    }

    /** @test */
    public function mindmap_export_returns_download()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test Map']);
        $mindmap->nodes()->create(['title' => 'Root']);

        $response = $this->actingAs($user)->get(route('mindmaps.export', $mindmap));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
        $response->assertDownload();
    }
}
```

### 2. `tests/Feature/MindMapPolicyTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\MindMap;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class MindMapPolicyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_view_own_mindmap()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test']);

        $this->assertTrue(Gate::forUser($user)->allows('view', $mindmap));
    }

    /** @test */
    public function user_cannot_view_other_users_mindmap()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $mindmap = $user1->mindmaps()->create(['title' => 'Test']);

        $this->assertFalse(Gate::forUser($user2)->allows('view', $mindmap));
    }

    /** @test */
    public function user_can_update_own_mindmap()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test']);

        $this->assertTrue(Gate::forUser($user)->allows('update', $mindmap));
    }

    /** @test */
    public function user_cannot_update_other_users_mindmap()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $mindmap = $user1->mindmaps()->create(['title' => 'Test']);

        $this->assertFalse(Gate::forUser($user2)->allows('update', $mindmap));
    }

    /** @test */
    public function user_can_delete_own_mindmap()
    {
        $user = User::factory()->create();
        $mindmap = $user->mindmaps()->create(['title' => 'Test']);

        $this->assertTrue(Gate::forUser($user)->allows('delete', $mindmap));
    }

    /** @test */
    public function user_cannot_delete_other_users_mindmap()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $mindmap = $user1->mindmaps()->create(['title' => 'Test']);

        $this->assertFalse(Gate::forUser($user2)->allows('delete', $mindmap));
    }
}
```

### 3. `tests/Unit/MindFileImporterTest.php`

```php
<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\MindFileImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MindFileImporterTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_imports_mind_file_correctly()
    {
        $user = User::factory()->create();
        $importer = new MindFileImporter();

        // Usar arquivo mind.mind de teste
        $filePath = base_path('mind.mind');

        if (file_exists($filePath)) {
            $mindmap = $importer->import($filePath, $user);

            $this->assertNotNull($mindmap);
            $this->assertEquals($user->id, $mindmap->user_id);
            $this->assertGreaterThan(0, $mindmap->nodes()->count());
            $this->assertNotNull($mindmap->rootNode());
        } else {
            $this->markTestSkipped('Arquivo mind.mind não encontrado para teste');
        }
    }
}
```

## Checklist de Validação Manual

### Funcionalidades Básicas

- [ ] **Autenticação**
  - [ ] Login funciona
  - [ ] Logout funciona
  - [ ] Registro funciona
  - [ ] Rotas protegidas redirecionam para login

- [ ] **Listagem de Mapas**
  - [ ] Exibe lista de mapas do usuário
  - [ ] Mostra mensagem quando não há mapas
  - [ ] Botão "Novo Mapa" funciona
  - [ ] Botão "Importar .mind" funciona
  - [ ] Links "Abrir" funcionam
  - [ ] Links "Exportar" funcionam
  - [ ] Botões "Deletar" funcionam com confirmação
  - [ ] Paginação (se implementada)

- [ ] **Criação de Mapas**
  - [ ] Formulário exibe corretamente
  - [ ] Validação de título funciona
  - [ ] Mapa criado com nó raiz
  - [ ] Redirecionamento após criação

- [ ] **Visualização/Edição**
  - [ ] Mapa carrega corretamente
  - [ ] Nós exibidos nas posições corretas
  - [ ] Conexões entre nós visíveis
  - [ ] Arrastar nós funciona
  - [ ] Zoom funciona
  - [ ] Pan funciona
  - [ ] MiniMap funciona
  - [ ] Editar título do nó (duplo clique)
  - [ ] Adicionar nó filho funciona
  - [ ] Deletar nó funciona
  - [ ] Botão "Salvar" persiste mudanças
  - [ ] Botão "Exportar" baixa .mind

- [ ] **Import/Export**
  - [ ] Upload de .mind funciona
  - [ ] Mapa importado corretamente
  - [ ] Todos os nós criados
  - [ ] Hierarquia preservada
  - [ ] Export gera arquivo .mind
  - [ ] Arquivo exportado pode ser reimportado
  - [ ] Ciclo completo: export → reimport mantém dados

- [ ] **Autorização**
  - [ ] Usuário só vê seus próprios mapas
  - [ ] Não pode acessar mapas de outros usuários
  - [ ] Erro 403 ao tentar acessar mapa de outro

### Dark Mode (CRÍTICO!)

- [ ] **Menu de Navegação**
  - [ ] Fundo do header muda
  - [ ] Texto do menu muda
  - [ ] Logo muda de cor
  - [ ] Dropdown muda de cor
  - [ ] Botão de tema funciona
  - [ ] Ícone do tema correto (sol/lua)

- [ ] **Listagem de Mapas**
  - [ ] Fundo da página muda
  - [ ] Card/tabela muda de cor
  - [ ] Texto muda de cor
  - [ ] Bordas mudam de cor
  - [ ] Botões mantêm estilo dark

- [ ] **Formulário de Criação**
  - [ ] Fundo do formulário muda
  - [ ] Inputs mudam de cor
  - [ ] Labels mudam de cor
  - [ ] Botões mantêm estilo dark

- [ ] **Visualização React Flow**
  - [ ] Canvas muda de cor (cinza escuro)
  - [ ] Nós mudam de cor (cinza médio)
  - [ ] Texto dos nós muda (claro)
  - [ ] Edges mudam de cor (cinza)
  - [ ] Controles (+/-/🔒) em dark
  - [ ] MiniMap em dark
  - [ ] Background grid em dark
  - [ ] Input de edição de nó em dark
  - [ ] Botões +/× nos nós em dark

- [ ] **Transições**
  - [ ] Mudança de tema é suave
  - [ ] Sem flickering
  - [ ] Todas as cores mudam simultaneamente
  - [ ] Preferência persiste no localStorage

- [ ] **Páginas de Autenticação**
  - [ ] Login em dark mode
  - [ ] Registro em dark mode
  - [ ] Recuperação de senha em dark mode

- [ ] **Perfil do Usuário**
  - [ ] Página de perfil em dark mode
  - [ ] Formulários em dark mode
  - [ ] Modal de confirmação em dark mode

## Comandos para executar testes

```bash
# Rodar todos os testes
./vendor/bin/sail artisan test

# Rodar testes específicos
./vendor/bin/sail artisan test --filter MindMapTest

# Rodar com coverage
./vendor/bin/sail artisan test --coverage
```

## Critérios de aceitação

- [ ] Todos os testes passam (100%)
- [ ] Todas as funcionalidades do checklist validadas
- [ ] Dark mode funciona em 100% das telas
- [ ] Sem erros no console do navegador
- [ ] Sem erros no log do Laravel
- [ ] Performance aceitável (carregamento < 2s)
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Acessibilidade básica (navegação por teclado)

## Documentação de bugs encontrados

Se encontrar bugs durante os testes, documentar em `documentation/bugs.md`:

```markdown
# Bugs Encontrados

## [CRÍTICO] Título do bug
**Como reproduzir:**
1. Passo 1
2. Passo 2

**Comportamento esperado:**
...

**Comportamento atual:**
...

**Evidência:**
Screenshot ou log

**Status:** Pendente/Corrigido
```

## Dependências
- Todas as tarefas anteriores (01-10)

## Próxima tarefa
MVP COMPLETO! 🎉

Após conclusão, revisar `documentation/mvp.md` e atualizar com informações de deployment se necessário.
