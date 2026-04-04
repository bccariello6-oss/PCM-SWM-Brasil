import React, { useState } from 'react';
import { supabase, IS_MOCK_MODE } from '../supabaseClient';
import { LogIn, Mail, Lock, Loader2, AlertCircle, ShieldAlert, ArrowRight, Settings, BarChart3, Clock, User, Briefcase, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const getErrorMessage = (msg: string) => {
        if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos. Verifique seus dados.';
        if (msg.includes('Email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada (e spam).';
        if (msg.includes('User already registered')) return 'Este e-mail já possui cadastro. Tente entrar.';
        if (msg.includes('Password should be at least 6 characters')) return 'A senha deve ter no mínimo 6 caracteres.';
        return msg;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role
                        }
                    }
                });
                if (signUpError) throw signUpError;

                if (authData.user) {
                    // Create profile in the 'profiles' table
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                full_name: fullName,
                                role: role,
                                email: email
                            }
                        ]);

                    if (profileError) {
                        console.error('Erro ao criar perfil:', profileError);
                        // Even if profile fails, we shouldn't necessarily block the user, 
                        // but we should inform them.
                    }
                }

                if (authData.session) {
                    setMessage('Cadastro realizado com sucesso! Bem-vindo.');
                } else {
                    setMessage('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
                    setMode('signin');
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(getErrorMessage(err.message || 'Ocorreu um erro na autenticação'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
            {/* Professional Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Animated Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            {IS_MOCK_MODE && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 p-2 px-4 rounded-full flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest z-50">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>Ambiente de Simulação</span>
                </div>
            )}

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Main Premium Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">

                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="mb-6 inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl">
                            <img src="/assets/logo.png" alt="SWM Logo" className="h-10 object-contain" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-white font-black tracking-[0.2em] text-base uppercase">
                                {mode === 'signup' ? 'Novo Cadastro' : 'PCM SWM BRASIL'}
                            </h2>
                            <div className="h-0.5 w-10 bg-blue-600 mx-auto rounded-full"></div>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.1em] max-w-xs mx-auto leading-relaxed opacity-70">
                                Gestão de Ativos & Engenharia Industrial
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-400 text-xs animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">{error}</span>
                                    {!IS_MOCK_MODE && error.includes('incorretos') && (
                                        <span className="text-[10px] opacity-70">Utilize o <b>Novo Cadastro</b> se for seu primeiro acesso.</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4 text-emerald-400 text-xs animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    E-mail Corporativo
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                                    <input
                                        type="email"
                                        placeholder="usuario@swmintl.com"
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-slate-600 font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {mode === 'signup' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Nome Completo
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                                            <input
                                                type="text"
                                                placeholder="Ex: Diogo Jesus"
                                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-slate-600 font-medium"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required={mode === 'signup'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                            Cargo / Função
                                        </label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                                            <input
                                                type="text"
                                                placeholder="Ex: Técnico de PCM"
                                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-slate-600 font-medium"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                required={mode === 'signup'}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        Senha
                                    </label>
                                    {mode === 'signin' && (
                                        <button type="button" className="text-[9px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                                            Esqueceu?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-slate-600 font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'signup' ? 'Confirmar Cadastro' : 'Entrar no Sistema'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === 'signin' ? 'signup' : 'signin');
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] transition-all"
                        >
                            {mode === 'signup' ? '← Ir para Login' : 'Não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    SWM International © 2026
                </p>
            </div>
        </div>
    );
};

export default Auth;
