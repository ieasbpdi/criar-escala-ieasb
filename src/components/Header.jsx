import React from 'react';
import { Moon, Sun, Wrench } from 'lucide-react';
import logo from '../assets/logo.png';

export function Header({ darkMode, setDarkMode }) {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm transition-colors duration-200 border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo placeholder, user will replace the actual file */}
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600">
             <img src={logo} alt="IEASB" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Criar Escala IEASB
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assembleia dos Santos no Brasil</p>
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          title="Alternar Tema"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
