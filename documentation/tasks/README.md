# Tarefas do MVP - Mapa Mental

Este diretório contém todas as tarefas necessárias para completar o MVP da aplicação de mapas mentais.

## 📋 Lista de Tarefas

### Backend - Estrutura Base
- **[Task 01](task-01-database.md)** - Estrutura de Banco de Dados
  - Criar migrations para `mindmaps` e `nodes`
  - Configurar relacionamentos e indexes
  - Garantir suporte a JSON para compatibilidade

- **[Task 02](task-02-models.md)** - Models e Relacionamentos
  - Criar Models `MindMap` e `Node`
  - Configurar relacionamentos hierárquicos
  - Definir fillable, casts e métodos auxiliares

- **[Task 03](task-03-policies.md)** - Policies de Autorização
  - Criar `MindMapPolicy`
  - Garantir isolamento entre usuários
  - Implementar gates de autorização

### Backend - Lógica de Negócio
- **[Task 04](task-04-importer.md)** - Serviço de Importação .mind
  - Criar `MindFileImporter`
  - Extrair e processar arquivos ZIP
  - Salvar com 100% de compatibilidade

- **[Task 05](task-05-exporter.md)** - Serviço de Exportação .mind
  - Criar `MindFileExporter`
  - Reconstruir estrutura JSON completa
  - Gerar arquivo .mind compatível

- **[Task 06](task-06-controllers.md)** - Controllers e Rotas
  - Criar `MindMapController`
  - Implementar CRUD completo
  - Configurar rotas protegidas

### Frontend - Interfaces
- **[Task 07](task-07-list-page.md)** - Página de Listagem
  - Criar `MindMaps/Index.jsx`
  - Listar mapas do usuário
  - Botões de ação (criar, importar, exportar, deletar)
  - **Aplicar dark mode completo**

- **[Task 08](task-08-view-edit-page.md)** - Página de Visualização/Edição
  - Criar `MindMaps/Show.jsx`
  - Integrar React Flow
  - Drag & drop, zoom, pan
  - **Aplicar dark mode no React Flow**

- **[Task 09](task-09-node-operations.md)** - Operações com Nós
  - Criar componente `MindMapNode`
  - Editar título (duplo clique)
  - Adicionar/deletar nós
  - **Dark mode nos nós customizados**

### Complementos e Ajustes
- **[Task 10](task-10-complementos.md)** - Complementos e Ajustes Finais
  - Implementar duplicação de mapas
  - Configurar diretórios storage
  - Melhorar validações de import
  - Adicionar botão duplicar na listagem

### Validação e Testes
- **[Task 11](task-11-tests.md)** - Testes e Validação Final
  - Criar testes unitários e de feature
  - Checklist de validação manual
  - **Validação completa de dark mode**
  - Documentar bugs

## 🎯 Ordem de Execução Recomendada

Execute as tarefas **em ordem sequencial (01 → 11)**, pois cada uma depende das anteriores:

```
Task 01 (Database)
    ↓
Task 02 (Models) - depende de 01
    ↓
Task 03 (Policies) - depende de 02
    ↓
Task 04 (Importer) - depende de 01, 02
    ↓
Task 05 (Exporter) - depende de 01, 02, 04
    ↓
Task 06 (Controllers) - depende de 02, 03, 04, 05
    ↓
Task 07 (List Page) - depende de 06
    ↓
Task 08 (View/Edit Page) - depende de 06, 07
    ↓
Task 09 (Node Operations) - depende de 08
    ↓
Task 10 (Complementos) - depende de 06, 07
    ↓
Task 11 (Tests) - depende de todas
```

## ✅ Critérios de Aceitação do MVP

Ao completar todas as tarefas, o MVP deve ter:

### Funcionalidades Core
- ✅ CRUD completo de mapas mentais
- ✅ Import de arquivos .mind (100% compatível)
- ✅ Export para arquivos .mind (100% compatível)
- ✅ Visualização interativa com React Flow
- ✅ Edição de nós (posição, título)
- ✅ Hierarquia de nós (pai-filho)
- ✅ Autorização (usuários isolados)

### Interface
- ✅ Listagem de mapas
- ✅ Formulário de criação
- ✅ Editor visual (React Flow)
- ✅ Drag & drop
- ✅ Zoom e pan
- ✅ MiniMap

### Dark Mode (OBRIGATÓRIO em 100% da aplicação)
- ✅ Menu de navegação
- ✅ Todas as páginas
- ✅ Todos os componentes Breeze
- ✅ React Flow (canvas, nós, edges)
- ✅ Nós customizados
- ✅ Formulários e inputs
- ✅ Modais e dropdowns
- ✅ Botões e links
- ✅ Persistência de preferência

### Qualidade
- ✅ Testes automatizados
- ✅ Validação manual completa
- ✅ Sem erros no console
- ✅ Performance aceitável

## 🌙 Atenção Especial: Dark Mode

**MUITO IMPORTANTE:** Dark mode deve estar implementado em **TODAS** as interfaces criadas.

Cada tarefa de frontend (07, 08, 09) tem critérios específicos de dark mode que devem ser validados.

A Task 10 inclui checklist completo de dark mode para validação final.

## 📝 Como usar este guia

1. **Antes de cada tarefa:**
   - Ler o arquivo .md da tarefa
   - Entender os objetivos e dependências
   - Preparar ambiente

2. **Durante a tarefa:**
   - Seguir os passos descritos
   - Criar/modificar arquivos listados
   - Executar comandos necessários

3. **Após cada tarefa:**
   - Validar critérios de aceitação
   - Executar comandos de validação
   - Marcar checkboxes como concluídos
   - Commitar alterações

4. **Ao final de todas as tarefas:**
   - Executar Task 11 (testes e validação)
   - Validar checklist completo
   - Documentar issues encontrados
   - Celebrar MVP completo! 🎉

## 🐛 Reportar Problemas

Se encontrar problemas ou ambiguidades nas tarefas:

1. Documentar em `documentation/bugs.md`
2. Tentar resolver com base no MVP documentado
3. Consultar `documentation/mvp.md` para referência

## 📚 Documentação de Referência

- **MVP Completo:** `../mvp.md`
- **Análise de Estrutura:** `../analysis.md`
- **Histórico de Instalação:** `../initial.md`

---

**Boa sorte com o desenvolvimento! 🚀**
