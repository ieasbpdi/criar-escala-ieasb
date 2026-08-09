import React, { useState } from 'react';
import { Calendar, FileDown, CheckCircle2, AlertCircle, ChevronDown, Sparkles, UserCheck, Music, DoorClosed, Droplets, BookOpen, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

// Datas comemorativas principais
const getCommemorativeDates = (year, monthIndex) => {
  const dates = [];
  
  // Exemplo de cálculo aproximado ou datas fixas
  if (monthIndex === 4) { // Maio - Dia das Mães (2º domingo)
    dates.push({ day: 11, name: 'Culto de Dia das Mães' });
  }
  if (monthIndex === 7) { // Agosto - Dia dos Pais (2º domingo)
    dates.push({ day: 10, name: 'Culto de Dia dos Pais' });
  }
  if (monthIndex === 9) { // Outubro - Dia das Crianças
    dates.push({ day: 12, name: 'Culto com as Crianças' });
  }
  return dates;
};

export function EscalasWizard() {
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cultosData, setCultosData] = useState({});

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const monthIdx = month.getMonth();
    const commemorative = getCommemorativeDates(currentYear, monthIdx);

    const initialData = {};

    days.forEach(day => {
      const dayOfWeek = getDay(day); // 0: Dom, 2: Ter, 4: Qui, 6: Sáb
      const dayNum = day.getDate();
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const comm = commemorative.find(c => c.day === dayNum);

      if (dayOfWeek === 0) { // Domingo
        initialData[`${dateStr}_ebd`] = {
          isEbd: true,
          dateStr,
          title: 'ESCOLA BÍBLICA DOMINICAL',
          time: '09H30',
          professor: 'AUXILIAR DIEGO',
          enabled: true
        };
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: comm ? comm.name : 'Culto com a participação das famílias',
          time: '19H00',
          dirigente: 'DIÁCONO REGIVALDO',
          louvor: 'TODOS OS DEPARTAMENTOS',
          porta: 'DIÁCONO NOELCIO',
          agua: 'DIÁCONO ERIVÂNIO',
          enabled: true
        };
      } else if (dayOfWeek === 2) { // Terça
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: comm ? comm.name : 'Culto de doutrina',
          time: '19H00',
          dirigente: 'PASTOR VALTER',
          louvor: 'MISSIONÁRIA MARIA',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'DIÁCONO REGIVALDO',
          enabled: true
        };
      } else if (dayOfWeek === 4) { // Quinta
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: comm ? comm.name : 'Culto de portas abertas',
          time: '19H00',
          dirigente: 'PASTOR VALTER',
          louvor: 'TODOS OS DEPARTAMENTOS',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'DIÁCONO NOELCIO',
          enabled: true
        };
      } else if (dayOfWeek === 6) { // Sábado
        initialData[`${dateStr}_tarde`] = {
          isEbd: false,
          dateStr,
          title: 'CÍRCULO DA ORAÇÃO',
          time: '14H00',
          dirigente: 'IRMÃ VANESSA E IRMÃ SIMONE',
          louvor: 'MISSIONÁRIA MARIA E IRMÃ KHAUNNY',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'IRMÃ EDILMA',
          enabled: true
        };
      }
    });

    setCultosData(initialData);
    setStep(2);
  };

  const handleUpdateItem = (key, field, value) => {
    setCultosData(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const monthNameUpper = format(selectedMonth, 'MMMM', { locale: ptBR }).toUpperCase();
    
    // Header Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Igreja Evangelica Assembleia dos Santos no Brasil – Palmeira dos índios', 105, 20, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ESCALA DE CULTOS E OUTRAS REALIZAÇÕES', 105, 26, { align: 'center' });
    doc.text(monthNameUpper, 105, 32, { align: 'center' });

    let y = 40;
    const pageHeight = 280;

    Object.entries(cultosData).forEach(([key, item]) => {
      if (!item.enabled) return;

      const dateObj = new Date(item.dateStr + 'T12:00:00');
      const dayNumStr = format(dateObj, 'dd');
      const dayOfWeekStr = format(dateObj, 'EEEE', { locale: ptBR }).toUpperCase();

      // Check page break
      const itemHeight = item.isEbd ? 20 : 35;
      if (y + itemHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }

      // Title Banner
      const isSantaCeia = item.title.toUpperCase().includes('SANTA CEIA');
      const bannerBgColor = isSantaCeia ? [153, 0, 0] : [0, 150, 136]; // Red vs Teal
      
      doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
      doc.rect(15, y, 180, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      const bannerText = `DIA ${dayNumStr} DE ${monthNameUpper} (${dayOfWeekStr}) – ${item.title.toUpperCase()} ÀS ${item.time}`;
      doc.text(bannerText, 17, y + 5);

      y += 10;

      // Details Bullet Points
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      if (item.isEbd) {
        doc.text(`➢  PROFESSOR: ${(item.professor || '').toUpperCase()}`, 20, y);
        y += 7;
      } else {
        doc.text(`➢  DIRIGENTE: ${(item.dirigente || '').toUpperCase()}`, 20, y);
        y += 5;
        doc.text(`➢  LOUVOR: ${(item.louvor || '').toUpperCase()}`, 20, y);
        y += 5;
        doc.text(`➢  PORTA: ${(item.porta || '').toUpperCase()}`, 20, y);
        y += 5;
        doc.text(`➢  ÁGUA: ${(item.agua || '').toUpperCase()}`, 20, y);
        y += 7;
      }
    });

    const fileName = `ESCALA DE ${monthNameUpper} - IEASB.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Wizard Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
          
          {[
            { num: 1, label: 'Seleção do Mês' },
            { num: 2, label: 'Definição da Escala' },
            { num: 3, label: 'Baixar PDF' }
          ].map((s) => {
            const isActive = step >= s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-4 ring-slate-950' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Seleção de Mês */}
      {step === 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              Selecione o Mês da Escala ({currentYear})
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Escolha qual mês você deseja organizar os cultos e gerar o arquivo final.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {months.map((month) => {
              const monthName = format(month, 'MMMM', { locale: ptBR });
              return (
                <button
                  key={month.toISOString()}
                  onClick={() => handleMonthSelect(month)}
                  className="group relative p-5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl flex flex-col items-center gap-3 transition-all duration-200 text-left hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-amber-400 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-white font-semibold capitalize text-base group-hover:text-amber-400 transition-colors">
                    {monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Definição dos Cultos */}
      {step === 2 && selectedMonth && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Preenchimento Mensal</span>
              <h2 className="text-2xl font-bold text-white capitalize">
                Escala de {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Trocar Mês
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2 text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                Avançar para Resumo <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(cultosData).map(([key, item]) => {
              const dateObj = new Date(item.dateStr + 'T12:00:00');
              const dayNum = format(dateObj, 'dd');
              const dayName = format(dateObj, 'EEEE', { locale: ptBR });

              return (
                <div 
                  key={key}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.title.toUpperCase().includes('SANTA CEIA')
                      ? 'bg-slate-900/90 border-red-900/40 hover:border-red-600/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/20">
                        {dayNum}
                      </span>
                      <div>
                        <h3 className="font-bold text-white capitalize text-base flex items-center gap-2">
                          {dayName} — {item.title}
                        </h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> Horário: {item.time}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Event On/Off */}
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.enabled}
                        onChange={(e) => handleUpdateItem(key, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 relative"></div>
                      <span className="ml-2 text-xs font-medium text-slate-400">Incluir na escala</span>
                    </label>
                  </div>

                  {item.enabled && (
                    <div className="space-y-4">
                      {/* Select Tipo de Culto (se não for EBD nem Sábado) */}
                      {!item.isEbd && getDay(dateObj) !== 6 && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-300">Tipo de Culto</label>
                          <div className="relative">
                            <select
                              value={item.title}
                              onChange={(e) => handleUpdateItem(key, 'title', e.target.value)}
                              className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors pr-10"
                            >
                              {getDay(dateObj) === 0 && (
                                <>
                                  <option value="Culto com a participação das famílias">Culto com a participação das famílias</option>
                                  <option value="Culto com a participação das senhoras">Culto com a participação das senhoras</option>
                                  <option value="Culto com a participação dos senhores">Culto com a participação dos senhores</option>
                                  <option value="Culto com a participação dos jovens">Culto com a participação dos jovens</option>
                                  <option value="Culto de Santa Ceia">Culto de Santa Ceia</option>
                                </>
                              )}
                              {getDay(dateObj) === 2 && (
                                <>
                                  <option value="Culto de doutrina">Culto de doutrina</option>
                                  <option value="Culto de Santa Ceia">Culto de Santa Ceia</option>
                                </>
                              )}
                              {getDay(dateObj) === 4 && (
                                <option value="Culto de portas abertas">Culto de portas abertas</option>
                              )}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Inputs de Integrantes */}
                      {item.isEbd ? (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Professor da EBD
                          </label>
                          <input 
                            type="text" 
                            value={item.professor || ''} 
                            onChange={(e) => handleUpdateItem(key, 'professor', e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2 focus:border-amber-500 focus:outline-none"
                            placeholder="Ex: AUXILIAR DIEGO"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Dirigente
                            </label>
                            <input 
                              type="text" 
                              value={item.dirigente || ''}
                              onChange={(e) => handleUpdateItem(key, 'dirigente', e.target.value)}
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Music className="w-3.5 h-3.5 text-amber-400" /> Louvor
                            </label>
                            <input 
                              type="text" 
                              value={item.louvor || ''}
                              onChange={(e) => handleUpdateItem(key, 'louvor', e.target.value)}
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <DoorClosed className="w-3.5 h-3.5 text-amber-400" /> Porta
                            </label>
                            <input 
                              type="text" 
                              value={item.porta || ''}
                              onChange={(e) => handleUpdateItem(key, 'porta', e.target.value)}
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-amber-400" /> Água
                            </label>
                            <input 
                              type="text" 
                              value={item.agua || ''}
                              onChange={(e) => handleUpdateItem(key, 'agua', e.target.value)}
                              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Resumo e Download */}
      {step === 3 && selectedMonth && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-2xl max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Escala Pronta para Exportação!</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Sua escala para o mês de <strong className="text-white capitalize">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong> foi estruturada com sucesso no modelo oficial da IEASB.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setStep(2)}
              className="px-5 py-3 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              Revisar Dados
            </button>
            <button 
              onClick={generatePDF}
              className="px-6 py-3 text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <FileDown className="w-5 h-5" /> Baixar PDF Formatado
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
