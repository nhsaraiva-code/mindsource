import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Index({ mindmaps }) {
    const [importing, setImporting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mindmapToDelete, setMindmapToDelete] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const mindmapsData = mindmaps.data || mindmaps;

    const handleDelete = (mindmap) => {
        setMindmapToDelete(mindmap);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (mindmapToDelete) {
            router.delete(route('mindmaps.destroy', mindmapToDelete.id));
            setShowDeleteModal(false);
            setMindmapToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setMindmapToDelete(null);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            const response = await axios.post(route('mindmaps.import'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
            });

            // Se sucesso, mostrar toast e recarregar a lista sem reload
            setImporting(false);
            toast.success(response.data.message);

            // Recarregar apenas os dados da página sem reload completo
            router.reload({ only: ['mindmaps'] });
        } catch (error) {
            setImporting(false);
            console.error('Erro ao importar:', error);
            console.error('Response data:', error.response?.data);

            // Mostrar mensagem de erro
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.file?.[0] || 'Erro ao importar arquivo';
            alert('Erro ao importar:\n\n' + errorMessage);
        } finally {
            // Resetar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();

        post(route('mindmaps.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        reset();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Meus Mapas Mentais
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                        >
                            {importing ? 'Importando...' : 'Importar .mind'}
                        </SecondaryButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mind"
                            onChange={handleImport}
                            className="hidden"
                        />
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            Novo Mapa
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Mapas Mentais" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {mindmapsData.length === 0 ? (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6 text-center text-gray-900 dark:text-gray-100">
                                <p className="mb-4">Você ainda não tem mapas mentais.</p>
                                <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                    Criar Primeiro Mapa
                                </PrimaryButton>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-200 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                                Título
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                                Criado em
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                                Atualizado em
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {mindmapsData.map((mindmap) => (
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
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors"
                                                        >
                                                            Abrir
                                                        </Link>
                                                        <a
                                                            href={route('mindmaps.export', mindmap.id)}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors"
                                                        >
                                                            Exportar
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(mindmap)}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
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

                            {/* Paginação */}
                            {mindmaps.links && mindmaps.links.length > 3 && (
                                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        {mindmaps.links[0].url && (
                                            <Link
                                                href={mindmaps.links[0].url}
                                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Anterior
                                            </Link>
                                        )}
                                        {mindmaps.links[mindmaps.links.length - 1].url && (
                                            <Link
                                                href={mindmaps.links[mindmaps.links.length - 1].url}
                                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Próxima
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Mostrando <span className="font-medium">{mindmaps.from || 0}</span> até{' '}
                                                <span className="font-medium">{mindmaps.to || 0}</span> de{' '}
                                                <span className="font-medium">{mindmaps.total || 0}</span> resultados
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                {mindmaps.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        disabled={!link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 dark:bg-purple-500'
                                                                : link.url
                                                                ? 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
                                                                : 'pointer-events-none text-gray-300 dark:text-gray-600'
                                                        } ${
                                                            index === 0
                                                                ? 'rounded-l-md'
                                                                : index === mindmaps.links.length - 1
                                                                ? 'rounded-r-md'
                                                                : ''
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showCreateModal} onClose={closeModal} maxWidth="md">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Criar Novo Mapa Mental
                    </h2>

                    <div className="mt-6">
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

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <SecondaryButton onClick={closeModal} type="button">
                            Cancelar
                        </SecondaryButton>

                        <PrimaryButton disabled={processing}>
                            Criar Mapa
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showDeleteModal} onClose={cancelDelete} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Confirmar Exclusão
                    </h2>

                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Tem certeza que deseja deletar o mapa mental{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            "{mindmapToDelete?.title}"
                        </span>
                        ? Esta ação não pode ser desfeita.
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <SecondaryButton onClick={cancelDelete}>
                            Cancelar
                        </SecondaryButton>

                        <button
                            onClick={confirmDelete}
                            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 dark:focus:ring-offset-gray-800"
                        >
                            Deletar
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
