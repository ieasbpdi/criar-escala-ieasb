import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Trash2, KeyRound, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

export function UserManagementModal({ isOpen, onClose, currentUser }) {
  const [usersList, setUsersList] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      loadSystemUsers();
    }
  }, [isOpen]);

  async function loadSystemUsers() {
    try {
      const { data, error } = await supabase.from('usuarios_sistema').select('id, username, is_admin, created_at');
      if (!error && data) {
        setUsersList(data);
      }
    } catch (err) {
      console.log('Erro ao carregar usuários:', err);
    }
  }

  if (!isOpen) return null;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!currentUser?.is_admin) {
      setMsg({ type: 'error', text: 'Apenas usuários Administradores podem cadastrar novos usuários!' });
      return;
    }

    if (!newUsername.trim() || !newPassword.trim()) {
      setMsg({ type: 'error', text: 'Preencha o nome de usuário e a senha.' });
      return;
    }

    try {
      // Inserir no Supabase
      const { error } = await supabase.from('usuarios_sistema').insert([{
        username: newUsername.trim(),
        password: newPassword.trim(),
        is_admin: isAdmin
      }]);

      if (error) {
        setMsg({ type: 'error', text: `Erro: ${error.message}` });
        return;
      }

      setMsg({ type: 'success', text: `Usuário "${newUsername}" criado com sucesso!` });
      setNewUsername('');
      setNewPassword('');
      setIsAdmin(false);
      setAdminAuthPassword('');
      loadSystemUsers();
    } catch (err) {
      setMsg({ type: 'error', text: 'Erro de conexão ao criar usuário.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (username === currentUser.username) {
      alert('Você não pode excluir o seu próprio usuário logado!');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) return;

    try {
      const { error } = await supabase.from('usuarios_sistema').delete().eq('id', userId);
      if (!error) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg">Gerenciar Usuários do Sistema</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {msg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {msg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Form de Cadastro */}
          <form onSubmit={handleCreateUser} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-600" /> Cadastrar Novo Usuário
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: pastor.valter"
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Senha</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">Conceder Acesso Administrador</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Cadastrar
              </button>
            </div>
          </form>

          {/* Lista de Usuários Existentes */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Usuários Cadastrados
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {usersList.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{u.username}</span>
                    {u.is_admin && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                        ADMIN
                      </span>
                    )}
                  </div>
                  {u.username !== currentUser?.username && (
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
