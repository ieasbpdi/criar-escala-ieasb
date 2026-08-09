import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, LogIn, ShieldAlert } from 'lucide-react';
import { supabase } from '../utils/supabase';

export function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Buscar usuário no Supabase na tabela usuarios_sistema
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('username', username.trim())
        .single();

      if (error || !data) {
        // Fallback local se o banco ainda não tiver a tabela criada
        if (username.trim() === 'admin' && password === 'admin123') {
          onLoginSuccess({ username: 'admin', is_admin: true });
          return;
        }
        setErrorMsg('Usuário não encontrado. Verifique os dados digitados.');
        setLoading(false);
        return;
      }

      if (data.password !== password) {
        setErrorMsg('Senha incorreta.');
        setLoading(false);
        return;
      }

      // Sucesso
      onLoginSuccess({
        id: data.id,
        username: data.username,
        is_admin: data.is_admin
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao conectar ao banco de dados Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center space-y-3">
          <img 
            src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - MONO.svg`} 
            alt="IEASB" 
            className="h-16 w-auto mx-auto object-contain"
          />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Criar Escala</h2>
          <p className="text-xs text-slate-500 font-medium">
            Igreja Evangélica Assembleia dos Santos no Brasil
          </p>
        </div>

        {/* Notice */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Acesso restrito. Faça login para gerenciar as escalas.</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Usuário</label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Senha</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Entrar no Sistema
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Dica: Usuário inicial padrão: <strong className="text-slate-600">admin</strong> | Senha: <strong className="text-slate-600">admin123</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
