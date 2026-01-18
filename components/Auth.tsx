import React, { useState } from 'react';
import { supabase, IS_MOCK_MODE } from '../supabaseClient';
import { LogIn, Mail, Lock, Loader2, AlertCircle, UserPlus, ArrowLeft, ShieldAlert, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                setMessage('Conta simulada pronta! Agora você já pode entrar.');
                setMode('signin');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            {/* Left Column - Login Form */}
            <div className="w-full lg:w-[45%] p-8 lg:p-20 flex flex-col justify-center items-center lg:items-start relative">

                {IS_MOCK_MODE && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 bg-amber-500/10 border border-amber-500/20 p-2 px-4 rounded-full flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase tracking-wider animate-pulse whitespace-nowrap">
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        <span>Modo Simulação</span>
                    </div>
                )}

                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-12 flex justify-center lg:justify-start">
                        <img src="/assets/logo.png" alt="SWM Logo" className="h-16 object-contain" />
                    </div>

                    <h2 className="text-blue-900 font-bold tracking-[0.2em] text-sm mb-10 text-center lg:text-left uppercase">
                        {mode === 'signup' ? 'Novo Cadastro' : 'CSM SWM BRASIL'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-xs animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 text-xs animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                                E-mail ou Matrícula
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="exemplo@swm-intl.com"
                                    className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium placeholder:text-slate-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                    Senha
                                </label>
                                {mode === 'signin' && (
                                    <button type="button" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                                        Esqueci minha senha
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium placeholder:text-slate-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {mode === 'signin' && (
                            <div className="flex items-center gap-3 ml-1">
                                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20" />
                                <label htmlFor="remember" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">
                                    Manter conectado
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-800 hover:bg-blue-900 text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'signup' ? 'Confirmar Cadastro' : 'Entrar no Portal'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-16 text-center space-y-4">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            {mode === 'signup' ? 'Já possui acesso?' : 'Não tem uma conta?'}
                        </p>
                        <button
                            onClick={() => {
                                setMode(mode === 'signin' ? 'signup' : 'signin');
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase tracking-[0.2em] transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1"
                        >
                            {mode === 'signup' ? 'Voltar para o Login' : 'Novo Cadastro'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column - Brand Imagery */}
            <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-slate-900">
                <img
                    src="/assets/factory.png"
                    alt="Factory background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-[10s] ease-linear"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-transparent to-transparent"></div>

                <div className="absolute top-1/2 left-20 -translate-y-1/2 max-w-xl space-y-8">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Operação Brasil</span>
                    </div>

                    <h2 className="text-6xl font-black text-white leading-tight">
                        Inovação e Qualidade em <span className="text-blue-400 italic">Papéis.</span>
                    </h2>

                    <p className="text-blue-100/70 text-lg font-medium leading-relaxed max-w-md">
                        Garantindo a eficiência operacional através da gestão moderna de ativos e materiais do grupo SWM.
                    </p>
                </div>

                <div className="absolute bottom-20 left-20 flex gap-20">
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-white tracking-tighter">100%</p>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Disponibilidade</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-white tracking-tighter">+500</p>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Colaboradores</p>
                    </div>
                </div>

                {/* Industrial Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>
        </div>
    );
};

export default Auth;
