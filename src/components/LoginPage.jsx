import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabase';

export function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  // Verificar se já existe algum usuário no banco
  useEffect(() => {
    async function checkExistingUsers() {
      try {
        const { data, error } = await supabase.from('usuarios_sistema').select('id').limit(1);
        if (!error && data && data.length === 0) {
          setIsFirstSetup(true);
        }
      } catch (err) {
        console.log('Erro ao checar usuários no Supabase:', err);
      }
    }
    checkExistingUsers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o nome de usuário e a senha.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isFirstSetup) {
        // Cadastrar o Primeiro Usuário como Admin
        const { data, error } = await supabase.from('usuarios_sistema').insert([{
          username: username.trim(),
          password: password.trim(),
          is_admin: true
        }]).select().single();

        if (error) {
          setErrorMsg(`Erro ao criar conta inicial: ${error.message}`);
          setLoading(false);
          return;
        }

        onLoginSuccess({
          id: data.id,
          username: data.username,
          is_admin: true
        });
        return;
      }

      // Login Normal no Supabase
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('username', username.trim())
        .single();

      if (error || !data) {
        setErrorMsg('Usuário não encontrado. Verifique se o nome foi cadastrado.');
        setLoading(false);
        return;
      }

      if (data.password !== password) {
        setErrorMsg('Senha incorreta.');
        setLoading(false);
        return;
      }

      // Sucesso no Login
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
            src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - VERTICAL2.svg`} 
            alt="IEASB" 
            className="h-24 w-auto mx-auto object-contain"
          />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Criar Escala</h2>
          <p className="text-xs text-slate-500 font-medium">
            Igreja Evangélica Assembleia dos Santos no Brasil
          </p>
        </div>

        {/* Notice */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {isFirstSetup 
              ? 'Nenhuma conta cadastrada. Crie seu usuário e senha inicial (Admin).' 
              : 'Acesso restrito. Digite seu nome de usuário e senha para acessar.'
            }
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Seu Nome / Usuário</label>
            <div className="relative">
              <input 
                id="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Sua Senha</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              <span>Processando...</span>
            ) : isFirstSetup ? (
              <>
                <UserPlus className="w-4 h-4" /> Criar Conta Inicial Administradora
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Entrar no Sistema
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
