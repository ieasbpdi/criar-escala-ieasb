import React from 'react';
import { Church, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 mt-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Logo & Info */}
          <div className="flex flex-col items-center md:items-start gap-3 max-w-md">
            <div className="flex items-center gap-3">
              <img 
                src={`${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - HORIZONTAL.svg`} 
                alt="IEASB" 
                className="h-10 w-auto invert brightness-200" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Aplicação oficial para planejamento e geração automatizada da escala mensal de cultos da 
              <strong className="text-slate-200 font-semibold"> Igreja Evangélica Assembleia dos Santos no Brasil</strong> — Palmeira dos Índios.
            </p>
          </div>

          {/* Institutional Note */}
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-amber-400 font-medium bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Gerador Oficial de Escalas</span>
            </div>
            <p className="mt-2">© {new Date().getFullYear()} IEASB Palmeira dos Índios. Todos os direitos reservados.</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
