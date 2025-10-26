import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    FiZap,
    FiDownload,
    FiUpload,
    FiEdit3,
    FiShare2,
    FiLock,
    FiArrowRight,
    FiCheck
} from 'react-icons/fi';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="MindSource - Organize suas ideias visualmente" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
                {/* Navigation */}
                <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-purple-100 dark:border-purple-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="w-10 h-10" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    MindSource
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/20"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-6 py-2.5 text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/20"
                                        >
                                            Começar Grátis
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 font-medium mb-8 animate-pulse">
                                <FiZap className="text-lg" />
                                <span>100% Compatível com formato .mind</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                Organize suas ideias
                                <br />
                                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    visualmente
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                                Crie, edite e compartilhe mapas mentais de forma intuitiva.
                                Importe e exporte seus projetos sem perder nenhum dado.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                {!auth.user && (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-xl shadow-purple-500/20 flex items-center gap-2 group"
                                        >
                                            Começar Gratuitamente
                                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-8 py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg border-2 border-purple-200 dark:border-purple-800"
                                        >
                                            Já tenho conta
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Tudo que você precisa
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                Funcionalidades poderosas para potencializar sua criatividade
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiEdit3 className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Editor Intuitivo
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Interface moderna e fácil de usar. Crie e edite mapas mentais com apenas alguns cliques.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiUpload className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Importação Total
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Importe arquivos .mind de outros aplicativos sem perder nenhuma informação.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiDownload className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Exportação Fácil
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Exporte seus mapas no formato .mind compatível com outros softwares do mercado.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiShare2 className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Organize Tudo
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Gerencie todos os seus mapas em um só lugar. Acesse de qualquer dispositivo.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiLock className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Totalmente Seguro
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Seus dados são protegidos. Cada mapa pertence apenas a você.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiZap className="text-white text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Rápido e Eficiente
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Performance otimizada para mapas com centenas de nós. Sem travamentos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-12 shadow-2xl">
                            <div className="text-center text-white">
                                <h2 className="text-4xl font-bold mb-6">
                                    Por que escolher o MindSource?
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mt-12">
                                    {[
                                        'Compatibilidade 100% com formato .mind',
                                        'Interface moderna e intuitiva',
                                        'Zero perda de dados na importação',
                                        'Acesse de qualquer lugar',
                                        'Organize projetos ilimitados',
                                        'Totalmente gratuito para começar'
                                    ].map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FiCheck className="text-white text-sm" />
                                            </div>
                                            <span className="text-lg">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {!auth.user && (
                    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Pronto para começar?
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                                Crie sua conta gratuita agora e organize suas ideias de forma visual.
                            </p>
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-xl shadow-purple-500/20 group"
                            >
                                Criar Conta Gratuita
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-100 dark:border-purple-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="w-8 h-8" />
                                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    MindSource
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                © 2025 MindSource. Organize suas ideias visualmente.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
