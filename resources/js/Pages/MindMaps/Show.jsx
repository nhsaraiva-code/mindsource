import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Show({ mindmap }) {
    const { url } = usePage();

    useEffect(() => {
        // Verificar se há mensagem de sucesso na URL
        const params = new URLSearchParams(window.location.search);
        const successMessage = params.get('success');

        if (successMessage) {
            toast.success(successMessage);
            // Limpar o parâmetro da URL sem recarregar a página
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {mindmap.title}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('mindmaps.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Voltar
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={mindmap.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="mb-4 text-lg font-semibold">
                                Mapa Mental Importado com Sucesso!
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total de nós: {mindmap.nodes.length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Layout: {mindmap.layout}
                                </p>
                            </div>

                            <div className="mt-6">
                                <h4 className="mb-2 font-semibold">Estrutura do Mapa:</h4>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    <pre className="overflow-x-auto text-xs">
                                        {JSON.stringify(mindmap.nodes, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                    <strong>Nota:</strong> A visualização interativa do mapa mental será implementada em breve.
                                    Por enquanto, você pode ver a estrutura dos dados acima.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
