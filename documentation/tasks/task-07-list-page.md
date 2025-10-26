# Task 07 - Página de Listagem de Mapas

## Objetivo
Criar interface React para listar todos os mapas mentais do usuário com opções de criar, importar, visualizar e deletar.

## Descrição
Implementar página `MindMaps/Index.jsx` que exibe uma tabela/grid com todos os mapas do usuário, com botões de ação e suporte a dark mode.

## Arquivos a criar

### 1. `resources/js/Pages/MindMaps/Index.jsx`

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ mindmaps }) {
    const [importing, setImporting] = useState(false);

    const handleDelete = (mindmap) => {
        if (confirm(`Tem certeza que deseja deletar "${mindmap.title}"?`)) {
            router.delete(route('mindmaps.destroy', mindmap.id));
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('mindmaps.import'), formData, {
            onFinish: () => setImporting(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Meus Mapas Mentais
                    </h2>
                    <div className="flex gap-2">
                        <label htmlFor="import-file">
                            <SecondaryButton
                                as="span"
                                disabled={importing}
                            >
                                {importing ? 'Importando...' : 'Importar .mind'}
                            </SecondaryButton>
                        </label>
                        <input
                            id="import-file"
                            type="file"
                            accept=".mind"
                            onChange={handleImport}
                            className="hidden"
                        />
                        <Link href={route('mindmaps.create')}>
                            <PrimaryButton>Novo Mapa</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Mapas Mentais" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {mindmaps.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6 text-center text-gray-900 dark:text-gray-100">
                                <p className="mb-4">Você ainda não tem mapas mentais.</p>
                                <Link href={route('mindmaps.create')}>
                                    <PrimaryButton>Criar Primeiro Mapa</PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Título
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Criado em
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Atualizado em
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {mindmaps.map((mindmap) => (
                                            <tr key={mindmap.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {mindmap.title}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {mindmap.created_at}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {mindmap.updated_at}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('mindmaps.show', mindmap.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            Abrir
                                                        </Link>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

### 2. `resources/js/Pages/MindMaps/Create.jsx`

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mindmaps.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Criar Novo Mapa Mental
                </h2>
            }
        >
            <Head title="Criar Mapa Mental" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="title" value="Título do Mapa" />

                                <TextInput
                                    id="title"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="off"
                                    placeholder="Digite o título do mapa mental"
                                />

                                <InputError className="mt-2" message={errors.title} />
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <PrimaryButton disabled={processing}>
                                    Criar Mapa
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

### 3. Adicionar link no menu de navegação - `resources/js/Layouts/AuthenticatedLayout.jsx`

Adicionar item de menu:

```jsx
<NavLink
    href={route('mindmaps.index')}
    active={route().current('mindmaps.*')}
>
    Mapas Mentais
</NavLink>
```

No menu responsivo também:

```jsx
<ResponsiveNavLink
    href={route('mindmaps.index')}
    active={route().current('mindmaps.*')}
>
    Mapas Mentais
</ResponsiveNavLink>
```

## Critérios de aceitação

- [ ] Página `MindMaps/Index.jsx` criada
- [ ] Lista exibe todos os mapas do usuário
- [ ] Botão "Novo Mapa" funcional
- [ ] Botão "Importar .mind" funcional (upload de arquivo)
- [ ] Link "Abrir" para cada mapa
- [ ] Link "Exportar" para download .mind
- [ ] Botão "Deletar" com confirmação
- [ ] Mensagem quando não há mapas
- [ ] Página `MindMaps/Create.jsx` criada
- [ ] Formulário de criação funcional
- [ ] Dark mode aplicado em todos os componentes
- [ ] Tabela responsiva
- [ ] Link "Mapas Mentais" adicionado ao menu
- [ ] Validação de erros exibida

## Validação

1. Acessar http://localhost/mindmaps
2. Ver lista vazia inicialmente
3. Clicar em "Criar Primeiro Mapa"
4. Preencher título e criar
5. Verificar se aparece na lista
6. Testar alternar dark mode (todos elementos devem mudar)
7. Testar exportar mapa
8. Testar deletar mapa (com confirmação)
9. Testar importar arquivo .mind

## Dependências
- Task 06 - Controllers
- Dark mode já implementado

## Próxima tarefa
Task 08 - Página de Visualização/Edição com React Flow
