import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 px-4 sm:px-6 lg:px-8">
            {/* Logo e Nome */}
            <div className="mb-8">
                <Link href="/" className="flex flex-col items-center gap-4 group">
                    <ApplicationLogo className="h-16 w-16 transition-transform group-hover:scale-110" />
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        MindSource
                    </span>
                </Link>
            </div>

            {/* Card do formulário */}
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl rounded-2xl px-8 py-10 border border-purple-100 dark:border-purple-500/30">
                    {children}
                </div>

                {/* Link de volta para home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                    >
                        ← Voltar para página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}
