import { Head, Link } from '@inertiajs/react';
import Header from '../Components/Header/Header';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="flex flex-col min-h-screen">
                <Header auth={auth} />

                {/*<div className="bg-gray-200">*/}
                {/*    <div className="grid grid-cols-2 items-center gap-1 px-4 lg:grid-cols-2">*/}
                {/*        <div className="flex flex-1 justify-start">*/}
                {/*            Logo*/}
                {/*        </div>*/}
                {/*        <nav className="flex flex-1 justify-end">*/}
                {/*            {auth.user ? (*/}
                {/*                <Link*/}
                {/*                    href={route('dashboard')}*/}
                {/*                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
                {/*                >*/}
                {/*                    Dashboard*/}
                {/*                </Link>*/}
                {/*            ) : (*/}
                {/*                <>*/}
                {/*                    <Link*/}
                {/*                        href={route('login')}*/}
                {/*                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
                {/*                    >*/}
                {/*                        Log in*/}
                {/*                    </Link>*/}
                {/*                    <Link*/}
                {/*                        href={route('register')}*/}
                {/*                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
                {/*                    >*/}
                {/*                        Register*/}
                {/*                    </Link>*/}
                {/*                </>*/}
                {/*            )}*/}
                {/*        </nav>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <main className="flex-1 bg-white p-4">
                    Основное содержимое
                </main>

                <footer className="bg-gray-800 text-white p-4 mt-auto">
                    <p>© 2025 Your Site. All rights reserved.</p>
                </footer>
            </div>
            {/*<div className="flex flex-col min-h-screen">*/}
            {/*    <img*/}
            {/*        id="background"*/}
            {/*        className="absolute -left-20 top-0 max-w-[877px]"*/}
            {/*        src="https://laravel.com/assets/img/welcome/background.svg"*/}
            {/*    />*/}
            {/*    <div className="relative flex min-h-screen flex-col items-center  selection:bg-[#FF2D20] selection:text-white">*/}
            {/*        <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl flex-grow container mx-auto p-4">*/}
            {/*            <header className="grid grid-cols-2 items-center gap-1 py-3 lg:grid-cols-2 border">*/}
            {/*                <div className="flex flex-1 justify-start">*/}
            {/*                    Logo*/}
            {/*                </div>*/}
            {/*                <nav className="flex flex-1 justify-end">*/}
            {/*                    {auth.user ? (*/}
            {/*                        <Link*/}
            {/*                            href={route('dashboard')}*/}
            {/*                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
            {/*                        >*/}
            {/*                            Dashboard*/}
            {/*                        </Link>*/}
            {/*                    ) : (*/}
            {/*                        <>*/}
            {/*                            <Link*/}
            {/*                                href={route('login')}*/}
            {/*                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
            {/*                            >*/}
            {/*                                Log in*/}
            {/*                            </Link>*/}
            {/*                            <Link*/}
            {/*                                href={route('register')}*/}
            {/*                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"*/}
            {/*                            >*/}
            {/*                                Register*/}
            {/*                            </Link>*/}
            {/*                        </>*/}
            {/*                    )}*/}
            {/*                </nav>*/}
            {/*            </header>*/}

            {/*            <main className="flex-grow container mx-auto p-4">*/}
            {/*                <p>Это основной контент. Он может быть коротким.</p>*/}
            {/*            </main>*/}

            {/*            <footer className="bg-gray-800 text-white p-4 text-center">*/}
            {/*                <p>© 2025 Your Site. All rights reserved.</p>*/}
            {/*            </footer>*/}

            {/*            /!*<main className="mt-6">*!/*/}
            {/*            /!*    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">*!/*/}
            {/*            /!*    </div>*!/*/}
            {/*            /!*</main>*!/*/}

            {/*            /!*<footer className="py-16 text-center text-sm text-black dark:text-white/70">*!/*/}
            {/*            /!*    Laravel v{laravelVersion} (PHP v{phpVersion})*!/*/}
            {/*            /!*</footer>*!/*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </>
    );
}
