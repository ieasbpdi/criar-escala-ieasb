import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, FileDown, CheckCircle2, AlertCircle, Clock, UserCheck, Music, DoorClosed, Droplets, BookOpen, ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

import { DEFAULT_MEMBERS, sortMembers } from '../utils/members';
import { getBrazilianHolidays } from '../utils/holidays';
import { CustomSelect } from './CustomSelect';
import { MembersModal } from './MembersModal';
import { supabase } from '../utils/supabase';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

const ALL_CULTO_TYPES = [
  'Culto com a participação das famílias',
  'Culto com a participação das senhoras',
  'Culto com a participação dos senhores',
  'Culto com a participação dos jovens',
  'Culto de doutrina',
  'Culto de portas abertas',
  'Culto de Santa Ceia'
];

export function EscalasWizard({ isMembersModalOpen, setIsMembersModalOpen }) {
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cultosData, setCultosData] = useState({});
  const [members, setMembers] = useState(DEFAULT_MEMBERS);

  // Carregar membros do Supabase se existir
  useEffect(() => {
    async function loadMembersFromSupabase() {
      try {
        const { data, error } = await supabase.from('membros_igreja').select('nome');
        if (!error && data && data.length > 0) {
          const names = data.map(d => d.nome);
          setMembers(sortMembers(names));
        }
      } catch (err) {
        console.log('Supabase inacessível ou tabela não criada ainda:', err);
      }
    }
    loadMembersFromSupabase();
  }, []);

  const handleAddMember = async (name) => {
    const updated = sortMembers([...members, name]);
    setMembers(updated);
    try {
      await supabase.from('membros_igreja').insert([{ nome: name }]);
    } catch (err) {
      console.log('Erro ao salvar no Supabase:', err);
    }
  };

  const handleRemoveMember = async (name) => {
    const updated = members.filter(m => m !== name);
    setMembers(updated);
    try {
      await supabase.from('membros_igreja').delete().eq('nome', name);
    } catch (err) {
      console.log('Erro ao deletar no Supabase:', err);
    }
  };

  const handleResetMembers = () => {
    setMembers(sortMembers(DEFAULT_MEMBERS));
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const holidays = getBrazilianHolidays(month.getFullYear());
    const initialData = {};

    const sortedMemberList = sortMembers(members);
    const defaultPerson = sortedMemberList[0] || '';

    days.forEach(day => {
      const dayOfWeek = getDay(day); // 0: Dom, 2: Ter, 4: Qui, 6: Sáb
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Checar se há feriado/data comemorativa nesta data
      const matchedHoliday = holidays.find(h => 
        h.date.getDate() === day.getDate() && h.date.getMonth() === day.getMonth()
      );

      if (dayOfWeek === 0) { // Domingo
        initialData[`${dateStr}_ebd`] = {
          isEbd: true,
          dateStr,
          title: 'ESCOLA BÍBLICA DOMINICAL',
          time: '09H30',
          professor: 'AUXILIAR DIEGO',
          enabled: true,
          holiday: null
        };
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: matchedHoliday ? matchedHoliday.name : 'Culto com a participação das famílias',
          time: '19H00',
          dirigente: 'DIÁCONO REGIVALDO',
          louvor: 'TODOS OS DEPARTAMENTOS',
          porta: 'DIÁCONO NOELCIO',
          agua: 'DIÁCONO ERIVÂNIO',
          enabled: true,
          holiday: matchedHoliday ? matchedHoliday.name : null
        };
      } else if (dayOfWeek === 2) { // Terça
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: matchedHoliday ? matchedHoliday.name : 'Culto de doutrina',
          time: '19H00',
          dirigente: 'PASTOR VALTER',
          louvor: 'MISSIONÁRIA MARIA',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'DIÁCONO REGIVALDO',
          enabled: true,
          holiday: matchedHoliday ? matchedHoliday.name : null
        };
      } else if (dayOfWeek === 4) { // Quinta
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: matchedHoliday ? matchedHoliday.name : 'Culto de portas abertas',
          time: '19H00',
          dirigente: 'PASTOR VALTER',
          louvor: 'TODOS OS DEPARTAMENTOS',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'DIÁCONO NOELCIO',
          enabled: true,
          holiday: matchedHoliday ? matchedHoliday.name : null
        };
      } else if (dayOfWeek === 6) { // Sábado
        initialData[`${dateStr}_tarde`] = {
          isEbd: false,
          dateStr,
          title: matchedHoliday ? matchedHoliday.name : 'CÍRCULO DA ORAÇÃO',
          time: '14H00',
          dirigente: 'IRMÃ VANESSA E IRMÃ SIMONE',
          louvor: 'MISSIONÁRIA MARIA E IRMÃ KHAUNNY',
          porta: 'DIÁCONO JOSUÉ',
          agua: 'IRMÃ EDILMA',
          enabled: true,
          holiday: matchedHoliday ? matchedHoliday.name : null
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

      const itemHeight = item.isEbd ? 20 : 35;
      if (y + itemHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }

      // Title Banner Color: Dark Red for Santa Ceia, Teal for others
      const isSantaCeia = item.title.toUpperCase().includes('SANTA CEIA');
      const bannerBgColor = isSantaCeia ? [153, 0, 0] : [0, 150, 136];
      
      doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
      doc.rect(15, y, 180, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      const bannerText = `DIA ${dayNumStr} DE ${monthNameUpper} (${dayOfWeekStr}) – ${item.title.toUpperCase()} ÀS ${item.time}`;
      doc.text(bannerText, 17, y + 5);

      y += 10;

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

  const sortedMemberList = sortMembers(members);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Modal de Gestão de Membros */}
      <MembersModal 
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onResetDefault={handleResetMembers}
      />

      {/* Stepper Progress Bar (Bolinhas e Linha Perfeitamente Alinhadas) */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Linha que liga apenas o centro da bolinha 1 até a 3 */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          
          {[
            { num: 1, label: 'Mês' },
            { num: 2, label: 'Definições' },
            { num: 3, label: 'Baixar PDF' }
          ].map((s) => {
            const isActive = step >= s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Seleção de Mês */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              Selecione o Mês da Escala ({currentYear})
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Os feriados e datas comemorativas nacionais serão identificados automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {months.map((month) => {
              const monthName = format(month, 'MMMM', { locale: ptBR });
              return (
                <button
                  key={month.toISOString()}
                  onClick={() => handleMonthSelect(month)}
                  className="group p-5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl flex flex-col items-center gap-3 transition-all duration-200 text-left cursor-pointer hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100/80 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <span className="text-slate-900 font-semibold capitalize text-base group-hover:text-blue-700 transition-colors">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Preenchimento Mensal</span>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                Escala de {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors"
              >
                Trocar Mês
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                Avançar para Resumo <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {Object.entries(cultosData).map(([key, item]) => {
              const dateObj = new Date(item.dateStr + 'T12:00:00');
              const dayNum = format(dateObj, 'dd');
              const dayName = format(dateObj, 'EEEE', { locale: ptBR });

              // Opções de tipos para o select
              let availableTypes = ALL_CULTO_TYPES;
              if (item.isEbd) availableTypes = ['ESCOLA BÍBLICA DOMINICAL'];
              if (getDay(dateObj) === 6) availableTypes = ['CÍRCULO DA ORAÇÃO', ...ALL_CULTO_TYPES];

              return (
                <div 
                  key={key}
                  className={`p-5 rounded-2xl border bg-white shadow-sm transition-all ${
                    item.title.toUpperCase().includes('SANTA CEIA')
                      ? 'border-red-300 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Alert Feriado Automático */}
                  {item.holiday && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Data Especial Detectada Automática: <strong>{item.holiday}</strong></span>
                    </div>
                  )}

                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm flex items-center justify-center">
                        {dayNum}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 capitalize text-base">
                          {dayName} — {item.title}
                        </h3>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> Horário: {item.time}
                        </span>
                      </div>
                    </div>

                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.enabled}
                        onChange={(e) => handleUpdateItem(key, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-600">Incluir na escala</span>
                    </label>
                  </div>

                  {item.enabled && (
                    <div className="space-y-4">
                      {/* Select Tipo de Culto Customizado */}
                      {!item.isEbd && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700">Tipo de Culto</label>
                          <CustomSelect 
                            value={item.title}
                            onChange={(val) => handleUpdateItem(key, 'title', val)}
                            options={availableTypes}
                          />
                        </div>
                      )}

                      {/* Integrantes com CustomSelect */}
                      {item.isEbd ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-blue-600" /> Professor da EBD
                          </label>
                          <CustomSelect 
                            value={item.professor || ''}
                            onChange={(val) => handleUpdateItem(key, 'professor', val)}
                            options={sortedMemberList}
                            placeholder="Selecione o professor..."
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Dirigente
                            </label>
                            <CustomSelect 
                              value={item.dirigente || ''}
                              onChange={(val) => handleUpdateItem(key, 'dirigente', val)}
                              options={sortedMemberList}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <Music className="w-3.5 h-3.5 text-blue-600" /> Louvor
                            </label>
                            <CustomSelect 
                              value={item.louvor || ''}
                              onChange={(val) => handleUpdateItem(key, 'louvor', val)}
                              options={['TODOS OS DEPARTAMENTOS', ...sortedMemberList]}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <DoorClosed className="w-3.5 h-3.5 text-blue-600" /> Porta
                            </label>
                            <CustomSelect 
                              value={item.porta || ''}
                              onChange={(val) => handleUpdateItem(key, 'porta', val)}
                              options={sortedMemberList}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-blue-600" /> Água
                            </label>
                            <CustomSelect 
                              value={item.agua || ''}
                              onChange={(val) => handleUpdateItem(key, 'agua', val)}
                              options={sortedMemberList}
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
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Escala Pronta para Exportação!</h2>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Sua escala para o mês de <strong className="text-slate-900 capitalize">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong> foi estruturada com sucesso.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setStep(2)}
              className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors"
            >
              Revisar Dados
            </button>
            <button 
              onClick={generatePDF}
              className="px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-5 h-5" /> Baixar PDF Formatado
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
