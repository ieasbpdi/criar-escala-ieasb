import React from 'react';
import { Users, Shield, LogOut, UserCheck } from 'lucide-react';

export function Header({ currentUser, onOpenMembersModal, onOpenUserManagementModal, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 shadow-sm relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <img 
            src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - MONO.svg`} 
            alt="Logo IEASB" 
            className="h-12 sm:h-14 w-auto object-contain"
            onError={(e) => {
              e.target.src = `${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - HORIZONTAL.svg`;
            }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Criar Escala
            </h1>
            {currentUser && (
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Usuário: <strong className="text-slate-800">{currentUser.username}</strong>
                {currentUser.is_admin && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold text-[10px] rounded">ADMIN</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMembersModal}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Gerenciar lista de pessoas para as escalas"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Gerenciar Nomes</span>
          </button>

          {currentUser?.is_admin && (
            <button
              onClick={onOpenUserManagementModal}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Cadastrar e gerenciar usuários do sistema"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Gerenciar Usuários</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-300 text-slate-600 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

      </div>
    </header>
  );
}
