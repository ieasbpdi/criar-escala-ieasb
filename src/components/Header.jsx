import React from 'react';
import { Moon, Sun, Calendar, Sparkles } from 'lucide-react';

export function Header({ darkMode, setDarkMode }) {
  return (
    <header className="bg-slate-900 border-b border-amber-500/20 text-white shadow-xl relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner flex items-center justify-center">
            <img 
              src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - HORIZONTAL.svg`} 
              alt="Logo IEASB" 
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                // Fallback text if logo fails
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sistema de Gestão
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Criar Escala IEASB
            </h1>
            <p className="text-xs text-slate-400 font-medium">Palmeira dos Índios — AL</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-medium"
            title="Alternar Tema"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
