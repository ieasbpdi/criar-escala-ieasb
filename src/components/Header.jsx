import React from 'react';
import { Users } from 'lucide-react';

export function Header({ onOpenMembersModal }) {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 shadow-sm relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <img 
            src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - MONO.svg`} 
            alt="Logo IEASB" 
            className="h-12 sm:h-14 w-auto object-contain"
            onError={(e) => {
              // Fallback se não encontrar o MONO.svg
              e.target.src = `${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - HORIZONTAL.svg`;
            }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Criar Escala
            </h1>
          </div>
        </div>

        {/* Gerenciar Membros / Nomes */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMembersModal}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            title="Gerenciar lista de pessoas para as escalas"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Gerenciar Nomes</span>
          </button>
        </div>

      </div>
    </header>
  );
}
