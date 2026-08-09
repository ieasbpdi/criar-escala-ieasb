import React from 'react';
import { CalendarDays, ArrowRight } from 'lucide-react';

export function Hub({ onSelectTool }) {
  const tools = [
    {
      id: 'escalas',
      name: 'Gerador de Escalas',
      description: 'Gere escalas mensais de cultos e eventos automaticamente em PDF.',
      icon: CalendarDays,
      color: 'bg-blue-500'
    }
    // Future tools can be added here
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Bem-vindo ao Hub de Ferramentas</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Selecione uma das ferramentas abaixo para iniciar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow p-6 flex flex-col items-start cursor-pointer group"
            onClick={() => onSelectTool(tool.id)}
          >
            <div className={`p-3 rounded-lg ${tool.color} text-white mb-4`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{tool.description}</p>
            <button className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
              Acessar ferramenta <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
