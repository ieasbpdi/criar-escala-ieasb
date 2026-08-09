import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileDown, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

// Feriados básicos do BR (simulação simples)
const getHolidays = (year) => [
  { date: new Date(year, 4, 11), name: 'Dia das Mães' }, // 2º dom maio (aproximado, requer calculo real)
  { date: new Date(year, 7, 10), name: 'Dia dos Pais' },  // 2º dom agosto (aproximado)
  { date: new Date(year, 9, 12), name: 'Dia das Crianças' }, // 12 de outubro
];

export function EscalasWizard({ onBack }) {
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cultosData, setCultosData] = useState({});

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    // Initialize data for this month
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    const initialData = {};
    days.forEach(day => {
      const dayOfWeek = getDay(day);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // 0: Domingo, 2: Terça, 4: Quinta
      if (dayOfWeek === 0) {
        initialData[dateStr] = { type: 'Culto com a família', hasEBD: true, time: '19:00' };
      } else if (dayOfWeek === 2) {
        initialData[dateStr] = { type: 'Culto de doutrina', time: '19:30' };
      } else if (dayOfWeek === 4) {
        initialData[dateStr] = { type: 'Culto de portas abertas', time: '19:30' };
      }
    });
    
    setCultosData(initialData);
    setStep(2);
  };

  const handleUpdateDay = (dateStr, field, value) => {
    setCultosData(prev => ({
      ...prev,
      [dateStr]: { ...prev[dateStr], [field]: value }
    }));
  };

  const generatePDF = () => {
    alert('Geração de PDF será implementada na próxima etapa!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar ao Hub
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Stepper Header */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          {[
            { num: 1, title: 'Mês' },
            { num: 2, title: 'Cultos' },
            { num: 3, title: 'Resumo e PDF' }
          ].map(s => (
            <div key={s.num} className={`flex-1 text-center py-4 text-sm font-medium ${step >= s.num ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Etapa {s.num}: {s.title}
            </div>
          ))}
        </div>

        {/* Step 1: Select Month */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Selecione o mês da escala ({currentYear})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {months.map(month => (
                <button
                  key={month.toISOString()}
                  onClick={() => handleMonthSelect(month)}
                  className="py-4 rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center gap-2 transition-colors group"
                >
                  <CalendarIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {format(month, 'MMMM', { locale: ptBR })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Define Cultos */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Definições de {format(selectedMonth, 'MMMM', { locale: ptBR })}</h2>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
              {Object.entries(cultosData).sort().map(([dateStr, data]) => {
                const dateObj = new Date(dateStr + 'T12:00:00');
                const dayName = format(dateObj, 'EEEE', { locale: ptBR });
                const dayNum = format(dateObj, 'dd');
                const isSunday = getDay(dateObj) === 0;
                
                return (
                  <div key={dateStr} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">
                      Dia {dayNum} - {dayName}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isSunday && (
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700">
                          <input 
                            type="checkbox" 
                            id={`ebd-${dateStr}`}
                            checked={data.hasEBD}
                            onChange={(e) => handleUpdateDay(dateStr, 'hasEBD', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`ebd-${dateStr}`} className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            Haverá Escola Bíblica Dominical (09h30)?
                          </label>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Culto (Noite)</label>
                        <select 
                          value={data.type}
                          onChange={(e) => {
                            handleUpdateDay(dateStr, 'type', e.target.value);
                            if (e.target.value === 'Santa Ceia' && getDay(dateObj) === 2) {
                              handleUpdateDay(dateStr, 'time', '17:00'); // Regra específica para terça
                            }
                          }}
                          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          {isSunday && (
                            <>
                              <option value="Culto com a família">Culto com a família</option>
                              <option value="Culto com as senhoras">Culto com as senhoras</option>
                              <option value="Culto com os senhores">Culto com os senhores</option>
                              <option value="Culto com os jovens">Culto com os jovens</option>
                              <option value="Santa Ceia">Santa Ceia</option>
                            </>
                          )}
                          {getDay(dateObj) === 2 && (
                            <>
                              <option value="Culto de doutrina">Culto de doutrina</option>
                              <option value="Santa Ceia">Santa Ceia</option>
                            </>
                          )}
                          {getDay(dateObj) === 4 && (
                            <option value="Culto de portas abertas">Culto de portas abertas</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600 dark:hover:text-white dark:hover:bg-slate-700">
                Voltar
              </button>
              <button onClick={() => setStep(3)} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700">
                Avançar para Resumo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resumo */}
        {step === 3 && (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tudo pronto!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">As definições de cultos para {format(selectedMonth, 'MMMM', { locale: ptBR })} foram salvas. Clique abaixo para gerar o arquivo PDF formatado com a escala final.</p>
            
            <div className="flex justify-center gap-4">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600">
                Revisar Cultos
              </button>
              <button onClick={generatePDF} className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm">
                <FileDown className="w-5 h-5 mr-2" /> Gerar PDF da Escala
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
