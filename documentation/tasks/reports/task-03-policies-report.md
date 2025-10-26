# Relatório - Task 03: Policies de Autorização

**Data:** 26 de outubro de 2025
**Status:** ✅ Concluída
**Desenvolvedor:** Claude Code
**Tempo estimado:** 30 minutos

---

## Objetivo

Criar Policy de autorização para garantir que usuários só possam acessar, editar e deletar seus próprios mapas mentais, implementando isolamento de dados entre usuários.

---

## Atividades Realizadas

### 1. Criação da MindMapPolicy

#### 1.1 Criação do arquivo
- **Comando:** `./sail artisan make:policy MindMapPolicy --model=MindMap`
- **Arquivo:** `app/Policies/MindMapPolicy.php`

#### 1.2 Métodos implementados

**1. viewAny(User $user): bool**
- **Propósito:** Determina se o usuário pode ver a lista de mapas mentais
- **Retorno:** `true` - Qualquer usuário autenticado pode ver a lista (será filtrada para mostrar apenas seus mapas)
- **Uso:** Index de mapas mentais

**2. view(User $user, MindMap $mindMap): bool**
- **Propósito:** Determina se o usuário pode ver um mapa mental específico
- **Validação:** `$user->id === $mindMap->user_id`
- **Retorno:** `true` apenas se o usuário é o dono do mapa
- **Uso:** Visualização de mapa específico

**3. create(User $user): bool**
- **Propósito:** Determina se o usuário pode criar mapas mentais
- **Retorno:** `true` - Qualquer usuário autenticado pode criar
- **Uso:** Formulário de criação de mapa

**4. update(User $user, MindMap $mindMap): bool**
- **Propósito:** Determina se o usuário pode atualizar um mapa mental
- **Validação:** `$user->id === $mindMap->user_id`
- **Retorno:** `true` apenas se o usuário é o dono do mapa
- **Uso:** Edição de mapa

**5. delete(User $user, MindMap $mindMap): bool**
- **Propósito:** Determina se o usuário pode deletar um mapa mental
- **Validação:** `$user->id === $mindMap->user_id`
- **Retorno:** `true` apenas se o usuário é o dono do mapa
- **Uso:** Exclusão de mapa

**6. export(User $user, MindMap $mindMap): bool**
- **Propósito:** Determina se o usuário pode exportar um mapa mental
- **Validação:** `$user->id === $mindMap->user_id`
- **Retorno:** `true` apenas se o usuário é o dono do mapa
- **Uso:** Exportação de mapa como arquivo .mind

### 2. Registro da Policy

#### 2.1 Arquivo modificado
- **Arquivo:** `app/Providers/AppServiceProvider.php`

#### 2.2 Imports adicionados
```php
use App\Models\MindMap;
use App\Policies\MindMapPolicy;
use Illuminate\Support\Facades\Gate;
```

#### 2.3 Registro no método boot()
```php
Gate::policy(MindMap::class, MindMapPolicy::class);
```

Este registro associa o Model `MindMap` à sua Policy, permitindo que o Laravel automaticamente verifique as permissões ao usar métodos como `$this->authorize()` nos controllers.

---

## Validação e Testes

### Preparação dos Testes

**Usuários criados:**
- User 1: teste (teste@teste.com) - ID: 1
- User 2: Usuário 2 (user2@teste.com) - ID: 2

### Teste 1: viewAny - Visualizar lista de mapas

**Objetivo:** Verificar se qualquer usuário autenticado pode acessar a listagem de mapas (que será filtrada posteriormente).

**Procedimento:**
```php
Gate::forUser($user1)->allows('viewAny', MindMap::class);
Gate::forUser($user2)->allows('viewAny', MindMap::class);
```

**Resultado:** ✅ **PASSOU**
- User 1 pode ver lista: **SIM ✓**
- User 2 pode ver lista: **SIM ✓**

**Conclusão:** Ambos os usuários autenticados podem acessar a listagem.

### Teste 2: view - Visualizar mapa específico

**Objetivo:** Verificar se apenas o dono pode visualizar um mapa específico.

**Procedimento:**
- Mapa criado pertencente ao User 1
- User 1 tenta visualizar o mapa
- User 2 tenta visualizar o mesmo mapa

**Resultado:** ✅ **PASSOU**
- User 1 (dono) pode ver o mapa: **SIM ✓**
- User 2 (não-dono) pode ver o mapa: **NÃO ✗**

**Conclusão:** Apenas o dono pode visualizar o mapa.

### Teste 3: create - Criar mapas

**Objetivo:** Verificar se qualquer usuário autenticado pode criar mapas.

**Procedimento:**
```php
Gate::forUser($user1)->allows('create', MindMap::class);
Gate::forUser($user2)->allows('create', MindMap::class);
```

**Resultado:** ✅ **PASSOU**
- User 1 pode criar mapas: **SIM ✓**
- User 2 pode criar mapas: **SIM ✓**

**Conclusão:** Ambos os usuários podem criar novos mapas.

### Teste 4: update - Atualizar mapa

**Objetivo:** Verificar se apenas o dono pode atualizar um mapa.

**Procedimento:**
- Mapa criado pertencente ao User 1
- User 1 tenta atualizar o mapa
- User 2 tenta atualizar o mesmo mapa

**Resultado:** ✅ **PASSOU**
- User 1 (dono) pode atualizar o mapa: **SIM ✓**
- User 2 (não-dono) pode atualizar o mapa: **NÃO ✗**

**Conclusão:** Apenas o dono pode atualizar o mapa.

### Teste 5: delete - Deletar mapa

**Objetivo:** Verificar se apenas o dono pode deletar um mapa.

**Procedimento:**
- Mapa criado pertencente ao User 1
- User 1 tenta deletar o mapa
- User 2 tenta deletar o mesmo mapa

**Resultado:** ✅ **PASSOU**
- User 1 (dono) pode deletar o mapa: **SIM ✓**
- User 2 (não-dono) pode deletar o mapa: **NÃO ✗**

**Conclusão:** Apenas o dono pode deletar o mapa.

### Teste 6: export - Exportar mapa

**Objetivo:** Verificar se apenas o dono pode exportar um mapa.

**Procedimento:**
- Mapa criado pertencente ao User 1
- User 1 tenta exportar o mapa
- User 2 tenta exportar o mesmo mapa

**Resultado:** ✅ **PASSOU**
- User 1 (dono) pode exportar o mapa: **SIM ✓**
- User 2 (não-dono) pode exportar o mapa: **NÃO ✗**

**Conclusão:** Apenas o dono pode exportar o mapa.

### Teste 7: Isolamento entre usuários - Cenário completo

**Objetivo:** Verificar o isolamento completo de dados entre dois usuários com seus respectivos mapas.

**Preparação:**
- Criado "Mapa A do User 1" (Owner: User 1)
- Criado "Mapa A do User 2" (Owner: User 2)

#### User 1 acessando seus próprios mapas

**Resultado:** ✅ **PASSOU**
- Ver próprio mapa: **SIM ✓**
- Atualizar próprio mapa: **SIM ✓**
- Deletar próprio mapa: **SIM ✓**

#### User 1 tentando acessar mapas do User 2

**Resultado:** ✅ **PASSOU**
- Ver mapa alheio: **NÃO ✓**
- Atualizar mapa alheio: **NÃO ✓**
- Deletar mapa alheio: **NÃO ✓**

#### User 2 acessando seus próprios mapas

**Resultado:** ✅ **PASSOU**
- Ver próprio mapa: **SIM ✓**
- Atualizar próprio mapa: **SIM ✓**
- Deletar próprio mapa: **SIM ✓**

#### User 2 tentando acessar mapas do User 1

**Resultado:** ✅ **PASSOU**
- Ver mapa alheio: **NÃO ✓**
- Atualizar mapa alheio: **NÃO ✓**
- Deletar mapa alheio: **NÃO ✓**

#### Verificação de isolamento de dados

**Resultado:**
- Total de mapas do User 1: 4
- Total de mapas do User 2: 1

**Conclusão:** ✅ **ISOLAMENTO FUNCIONANDO CORRETAMENTE!**

Cada usuário:
1. ✅ Pode realizar todas as operações em seus próprios mapas
2. ✅ Não pode realizar nenhuma operação em mapas de outros usuários
3. ✅ Vê apenas seus próprios mapas através do relacionamento

---

## Critérios de Aceitação

Todos os critérios foram atendidos:

- ✅ Policy `MindMapPolicy` criada
- ✅ Método `viewAny()` implementado
- ✅ Método `view()` implementado (verifica user_id)
- ✅ Método `create()` implementado
- ✅ Método `update()` implementado (verifica user_id)
- ✅ Método `delete()` implementado (verifica user_id)
- ✅ Método `export()` implementado (verifica user_id)
- ✅ Policy registrada no AppServiceProvider

---

## Arquivos Criados/Modificados

### Criados:
1. `app/Policies/MindMapPolicy.php`

### Modificados:
1. `app/Providers/AppServiceProvider.php` - Registro da policy

---

## Observações Importantes

### 1. Diferença entre viewAny e view

**viewAny:**
- Controla se o usuário pode **acessar a listagem** de mapas
- Retorna `true` para qualquer usuário autenticado
- A filtragem dos mapas é feita no controller usando `auth()->user()->mindmaps()`

**view:**
- Controla se o usuário pode **visualizar um mapa específico**
- Verifica se `user_id === mindMap->user_id`
- Impede acesso direto a mapas de outros usuários via URL

### 2. Método export customizado

Embora não seja um método padrão do Laravel, adicionamos o método `export()` específico para a aplicação:
- Permite controlar quem pode exportar mapas como arquivo `.mind`
- Usa a mesma lógica de validação de ownership
- Será usado no controller de exportação

### 3. Uso da Policy nos Controllers

Para usar a policy nos controllers, podemos:

**Opção 1: Método authorize()**
```php
public function show(MindMap $mindmap)
{
    $this->authorize('view', $mindmap);
    // ... código continua se autorizado
}
```

**Opção 2: Gate facade**
```php
use Illuminate\Support\Facades\Gate;

if (Gate::allows('view', $mindmap)) {
    // Permitido
}

if (Gate::denies('update', $mindmap)) {
    // Negado
}
```

**Opção 3: User model**
```php
if ($user->can('view', $mindmap)) {
    // Permitido
}

if ($user->cannot('update', $mindmap)) {
    // Negado
}
```

### 4. Segurança em Múltiplas Camadas

A segurança foi implementada em camadas:

1. **Policy:** Valida permissões de acesso
2. **Relacionamento:** `$user->mindmaps()` já filtra apenas mapas do usuário
3. **Foreign Key:** `user_id` garante ownership no banco
4. **Controller:** Usará `authorize()` para verificar permissões

### 5. Mensagens de Erro

Quando a policy nega acesso, o Laravel automaticamente:
- Retorna HTTP 403 (Forbidden) se usar `$this->authorize()`
- Permite tratamento customizado se usar `Gate::allows()` ou `$user->can()`

---

## Testes Funcionais - Resumo

Total de testes executados: **7**

| # | Teste | Métodos | Status |
|---|-------|---------|--------|
| 1 | viewAny - Lista de mapas | viewAny() | ✅ PASSOU |
| 2 | view - Mapa específico | view() | ✅ PASSOU |
| 3 | create - Criar mapas | create() | ✅ PASSOU |
| 4 | update - Atualizar mapa | update() | ✅ PASSOU |
| 5 | delete - Deletar mapa | delete() | ✅ PASSOU |
| 6 | export - Exportar mapa | export() | ✅ PASSOU |
| 7 | Isolamento completo entre usuários | Todos | ✅ PASSOU |

**Taxa de sucesso:** 100% (7/7)

### Cenários Testados

**✅ Cenários com permissão (permitidos):**
- Usuário autenticado visualizar lista de mapas
- Usuário autenticado criar novos mapas
- Dono visualizar seu próprio mapa
- Dono atualizar seu próprio mapa
- Dono deletar seu próprio mapa
- Dono exportar seu próprio mapa

**✅ Cenários sem permissão (bloqueados):**
- Usuário não-dono visualizar mapa alheio
- Usuário não-dono atualizar mapa alheio
- Usuário não-dono deletar mapa alheio
- Usuário não-dono exportar mapa alheio

---

## Matriz de Permissões

| Ação | Usuário Autenticado | Dono do Mapa | Não-Dono |
|------|---------------------|--------------|----------|
| viewAny (listar) | ✅ Sim | ✅ Sim | ✅ Sim |
| create (criar) | ✅ Sim | ✅ Sim | ✅ Sim |
| view (visualizar) | - | ✅ Sim | ❌ Não |
| update (atualizar) | - | ✅ Sim | ❌ Não |
| delete (deletar) | - | ✅ Sim | ❌ Não |
| export (exportar) | - | ✅ Sim | ❌ Não |

---

## Exemplo de Uso em Controller

```php
class MindMapController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', MindMap::class);

        // Usuário autorizado - retornar apenas seus mapas
        return auth()->user()->mindmaps()->get();
    }

    public function show(MindMap $mindmap)
    {
        $this->authorize('view', $mindmap);

        // Usuário autorizado - pode visualizar
        return $mindmap;
    }

    public function update(Request $request, MindMap $mindmap)
    {
        $this->authorize('update', $mindmap);

        // Usuário autorizado - pode atualizar
        $mindmap->update($request->validated());
        return $mindmap;
    }

    public function destroy(MindMap $mindmap)
    {
        $this->authorize('delete', $mindmap);

        // Usuário autorizado - pode deletar
        $mindmap->delete();
        return response()->noContent();
    }

    public function export(MindMap $mindmap)
    {
        $this->authorize('export', $mindmap);

        // Usuário autorizado - pode exportar
        return $exporter->export($mindmap);
    }
}
```

---

## Próximos Passos

A estrutura de Policies está completa e testada. A próxima task (Task 04) será criar o Serviço de Importação de arquivos `.mind`, que permitirá importar mapas mentais existentes para a aplicação.

---

## Conclusão

A Task 03 foi concluída com sucesso. As Policies foram criadas, registradas e testadas extensivamente. Todos os testes passaram, confirmando que:

1. ✅ MindMapPolicy criada com 6 métodos de autorização
2. ✅ Policy registrada no AppServiceProvider
3. ✅ Usuários autenticados podem criar mapas
4. ✅ Usuários autenticados podem ver a lista de mapas
5. ✅ Apenas donos podem visualizar, editar, deletar e exportar seus mapas
6. ✅ Isolamento completo de dados entre usuários
7. ✅ Segurança implementada em múltiplas camadas

O sistema está pronto para receber os Controllers e Services, com a segurança de que apenas donos poderão acessar seus próprios mapas mentais.
