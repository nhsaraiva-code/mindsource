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
