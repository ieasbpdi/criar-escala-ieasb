import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start gap-3 max-w-lg">
            <img 
              src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - MONO.svg`} 
              alt="IEASB" 
              className="h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" 
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              Aplicação da <strong className="text-slate-800 font-semibold">Igreja Evangélica Assembleia dos Santos no Brasil</strong> — Palmeira dos Índios.
              Este repositório serve unicamente para criar a escala mensal da igreja de forma automatizada e prática.
            </p>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-400">
            <p>© {new Date().getFullYear()} IEASB Palmeira dos Índios. Todos os direitos reservados.</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
