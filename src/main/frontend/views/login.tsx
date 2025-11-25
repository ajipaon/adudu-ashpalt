import { useState } from 'react';
import { useSignal } from '@vaadin/hilla-react-signals';
import type { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useAuth } from 'Frontend/util/auth.js';

export const config: ViewConfig = {
    menu: { exclude: true },
    flowLayout: false,
};

export default function LoginView(): JSX.Element {
    const { login } = useAuth();
    const loginError = useSignal(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { defaultUrl, error, redirectUrl } = await login(username, password);
            if (error) {
                loginError.value = true;
                setTimeout(() => (loginError.value = false), 4000);
            } else {
                const url = redirectUrl ?? defaultUrl ?? '/';
                document.location = new URL(url, document.baseURI).pathname;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex flex-col h-screen items-center justify-center overflow-hidden select-none"
            style={{
                backgroundImage: 'url(/images/photo-background-1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}
        >
        <div className="relative z-10 w-full max-w-md p-8 mx-4 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                <div className="flex flex-col items-center mb-8">

                    <div className="w-20 h-20 mb-4 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-3xl font-bold text-white">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-300 text-center text-sm">Sign in to access your project dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {loginError.value && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-shake">
                            Invalid username or password
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-xs">
                        Use <span className="text-purple-400 font-mono">admin/admin</span> or <span className="text-purple-400 font-mono">user/user</span> to test
                    </p>
                </div>
            </div>
        </div>
    );
}

