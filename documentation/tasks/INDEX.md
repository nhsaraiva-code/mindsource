# 📑 Índice Visual de Tarefas - MVP Mapa Mental

## 🏗️ Fase 1: Fundação Backend (Tasks 01-03)

| Task | Nome | Tempo Estimado | Complexidade | Arquivos |
|------|------|----------------|--------------|----------|
| **01** | [Estrutura de Banco de Dados](task-01-database.md) | 30min | ⭐ Baixa | 2 migrations |
| **02** | [Models e Relacionamentos](task-02-models.md) | 45min | ⭐⭐ Média | 3 models |
| **03** | [Policies de Autorização](task-03-policies.md) | 30min | ⭐ Baixa | 1 policy |

**Total Fase 1:** ~1h45min

---

## ⚙️ Fase 2: Lógica de Negócio (Tasks 04-06)

| Task | Nome | Tempo Estimado | Complexidade | Arquivos |
|------|------|----------------|--------------|----------|
| **04** | [Serviço de Importação](task-04-importer.md) | 2h | ⭐⭐⭐ Alta | 1 service |
| **05** | [Serviço de Exportação](task-05-exporter.md) | 1h30min | ⭐⭐⭐ Alta | 1 service |
| **06** | [Controllers e Rotas](task-06-controllers.md) | 1h30min | ⭐⭐ Média | 1 controller, rotas |

**Total Fase 2:** ~5h

---

## 🎨 Fase 3: Interface Frontend (Tasks 07-09)

| Task | Nome | Tempo Estimado | Complexidade | Arquivos | Dark Mode |
|------|------|----------------|--------------|----------|-----------|
| **07** | [Página de Listagem](task-07-list-page.md) | 2h | ⭐⭐ Média | 2 páginas React | ✅ Obrigatório |
| **08** | [Visualização React Flow](task-08-view-edit-page.md) | 3h | ⭐⭐⭐⭐ Muito Alta | 1 página, CSS | ✅ Obrigatório |
| **09** | [Operações com Nós](task-09-node-operations.md) | 2h30min | ⭐⭐⭐ Alta | 1 componente, controller | ✅ Obrigatório |

**Total Fase 3:** ~7h30min

---

## 🔧 Fase 4: Complementos (Task 10)

| Task | Nome | Tempo Estimado | Complexidade | Arquivos |
|------|------|----------------|--------------|----------|
| **10** | [Complementos e Ajustes](task-10-complementos.md) | 1h30min | ⭐⭐ Média | Controller, rotas, página |

**Total Fase 4:** ~1h30min

---

## ✅ Fase 5: Validação (Task 11)

| Task | Nome | Tempo Estimado | Complexidade | Arquivos | Dark Mode |
|------|------|----------------|--------------|----------|-----------|
| **11** | [Testes e Validação](task-11-tests.md) | 3h | ⭐⭐⭐ Alta | 3 arquivos de teste | ✅ Validação completa |

**Total Fase 5:** ~3h

---

## 📊 Resumo Geral

| Métrica | Valor |
|---------|-------|
| **Total de Tarefas** | 11 |
| **Tempo Total Estimado** | ~18h45min |
| **Arquivos a Criar/Modificar** | ~22 arquivos |
| **Linhas de Código Estimadas** | ~3200 linhas |
| **Complexidade Média** | ⭐⭐⭐ Média-Alta |

---

## 🎯 Dependências entre Tarefas

```
         [Task 01]
              ↓
         [Task 02] ←─────┐
              ↓          │
    ┌────[Task 03]       │
    │         ↓          │
    │    [Task 04] ──────┤
    │         ↓          │
    │    [Task 05]       │
    │         ↓          │
    └───→[Task 06]       │
              ↓          │
         [Task 07]       │
              ↓          │
         [Task 08]       │
              ↓          │
         [Task 09]       │
              ↓          │
         [Task 10]       │
              ↓          │
         [Task 11] ←─────┘
```

---

## 🌙 Tarefas com Dark Mode Obrigatório

| Task | Componentes com Dark Mode |
|------|---------------------------|
| **07** | • Listagem de mapas<br>• Formulário de criação<br>• Tabela<br>• Botões<br>• Links |
| **08** | • React Flow canvas<br>• Nós padrão<br>• Edges<br>• Controls<br>• MiniMap<br>• Background |
| **09** | • Nós customizados<br>• Input de edição<br>• Botões +/×<br>• Handles |
| **10** | • Botão "Duplicar" na listagem |
| **11** | • Validação de todas as páginas<br>• Checklist completo |

---

## 📝 Checklist Rápido de Progresso

### Backend
- [ ] Task 01 - Migrations criadas e executadas
- [ ] Task 02 - Models funcionando
- [ ] Task 03 - Policies protegendo rotas
- [ ] Task 04 - Import funcionando
- [ ] Task 05 - Export funcionando
- [ ] Task 06 - Controller com todas as rotas

### Frontend
- [ ] Task 07 - Listagem completa com dark mode
- [ ] Task 08 - React Flow funcionando com dark mode
- [ ] Task 09 - CRUD de nós com dark mode

### Complementos
- [ ] Task 10 - Duplicação de mapas funcionando
- [ ] Task 10 - Diretórios storage configurados
- [ ] Task 10 - Validações melhoradas

### Validação
- [ ] Task 11 - Todos os testes passando
- [ ] Task 11 - Checklist manual completo
- [ ] Task 11 - Dark mode validado 100%

### MVP Completo
- [ ] Todas as 11 tarefas concluídas
- [ ] Testes passando
- [ ] Dark mode em todas as telas
- [ ] Documentação atualizada

---

## 🚀 Como Começar

1. **Ler:** `README.md` neste diretório
2. **Começar:** Task 01
3. **Seguir:** Em ordem sequencial
4. **Validar:** Critérios de cada task
5. **Finalizar:** Com Task 10

---

## 💡 Dicas

- ✅ **Commitar após cada task**
- ✅ **Testar antes de prosseguir**
- ✅ **Validar dark mode em cada etapa**
- ✅ **Documentar issues encontrados**
- ✅ **Pedir ajuda se necessário**

---

**Pronto para começar? Abra [Task 01 - Database](task-01-database.md)!** 🎯
