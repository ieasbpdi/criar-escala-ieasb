import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, FileDown, CheckCircle2, AlertCircle, Clock, UserCheck, Music, DoorClosed, Droplets, BookOpen, ChevronLeft, ChevronRight, Gift, FileEdit, Trash2, Edit3, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

import { sortMembers } from '../utils/members';
import { getBrazilianHolidays } from '../utils/holidays';
import { CustomSelect } from './CustomSelect';
import { MembersModal } from './MembersModal';
import { supabase } from '../utils/supabase';

const currentDate = new Date();
const currentYearNum = currentDate.getFullYear();

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [draftActionModal, setDraftActionModal] = useState(null); // Agora recebe o rascunho específico
  const [draftsListModal, setDraftsListModal] = useState(null); // Recebe o month para listar rascunhos
  const [saveDraftModal, setSaveDraftModal] = useState(false); // Modal para pegar nome do autor
  const [draftAuthor, setDraftAuthor] = useState('');
  const [confirmDeleteDraft, setConfirmDeleteDraft] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cloudDrafts, setCloudDrafts] = useState({}); // { '2026-0': [{...}], ... }
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Fechar modais com Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showSuccessModal) setShowSuccessModal(false);
        if (draftActionModal) setDraftActionModal(null);
        if (confirmDeleteDraft) setConfirmDeleteDraft(null);
        if (draftsListModal) setDraftsListModal(null);
        if (saveDraftModal) setSaveDraftModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuccessModal, draftActionModal, confirmDeleteDraft, draftsListModal, saveDraftModal]);

  // Rolagem para o topo ao trocar de passo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const [selectedYear, setSelectedYear] = useState(currentYearNum);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cultosData, setCultosData] = useState({});
  const [members, setMembers] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [allBirthdays, setAllBirthdays] = useState([]);

  // Meses do ano selecionado
  const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(selectedYear, i, 1));

  // Carregar rascunhos da Nuvem
  useEffect(() => {
    async function loadDrafts() {
      try {
        const { data, error } = await supabase.from('escalas_salvas').select('*');
        if (!error && data) {
          const grouped = {};
          data.forEach(d => {
            if (!grouped[d.mes_ano]) grouped[d.mes_ano] = [];
            grouped[d.mes_ano].push(d);
          });
          setCloudDrafts(grouped);
        }
      } catch (err) {
        console.log('Erro ao carregar rascunhos:', err);
      }
    }
    loadDrafts();
  }, [refreshKey]);

  // Carregar membros do Supabase
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

  // Carregar Aniversários do Supabase
  useEffect(() => {
    async function loadBirthdays() {
      try {
        const { data, error } = await supabase.from('aniversarios').select('*');
        if (!error && data) {
          setAllBirthdays(data); // Para usar no passo 2
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = data.filter(b => {
            let bDate = new Date(today.getFullYear(), b.mes - 1, b.dia);
            if (bDate < today) {
              bDate.setFullYear(today.getFullYear() + 1);
            }
            const diffTime = bDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays >= 0 && diffDays <= 3;
          });
          
          setUpcomingBirthdays(upcoming.sort((a,b) => {
            let da = new Date(today.getFullYear(), a.mes - 1, a.dia);
            if (da < today) da.setFullYear(today.getFullYear() + 1);
            let db = new Date(today.getFullYear(), b.mes - 1, b.dia);
            if (db < today) db.setFullYear(today.getFullYear() + 1);
            return da - db;
          }));
        }
      } catch (err) {
        console.log('Erro ao carregar aniversários:', err);
      }
    }
    loadBirthdays();
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

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const holidays = getBrazilianHolidays(month.getFullYear());
    const initialData = {};

    const savedDefaults = JSON.parse(localStorage.getItem('escalaDefaults') || '{}');

    days.forEach(day => {
      const dayOfWeek = getDay(day);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      const matchedHoliday = holidays.find(h => 
        h.date.getDate() === day.getDate() && h.date.getMonth() === day.getMonth()
      );

      // Check if it's new year eve
      const isNewYearEve = day.getDate() === 31 && day.getMonth() === 11;
      const isEveOfHoliday = holidays.find(h => {
        const hDate = new Date(h.date);
        hDate.setDate(hDate.getDate() - 1);
        return hDate.getDate() === day.getDate() && hDate.getMonth() === day.getMonth();
      });

      const holidayInfo = isNewYearEve ? 'CULTO DE VIRADA' : (matchedHoliday ? matchedHoliday.name : null);
      const eveInfo = isEveOfHoliday ? `Véspera de ${isEveOfHoliday.name}` : null;
      
      const birthdaysOnDay = allBirthdays.filter(b => b.dia === day.getDate() && b.mes === day.getMonth() + 1);
      const birthdayInfo = birthdaysOnDay.length > 0 
        ? `Aniversário de: ${birthdaysOnDay.map(b => b.membro_nome).join(', ')}`
        : null;

      const getDefault = (dWeek, time, field, fallback = '') => savedDefaults[`${dWeek}_${time}_${field}`] || fallback;

      if (dayOfWeek === 0) { // Domingo
        initialData[`${dateStr}_ebd`] = {
          isEbd: true,
          dateStr,
          title: 'ESCOLA BÍBLICA DOMINICAL',
          time: '09H30',
          professor: getDefault(0, 'ebd', 'professor'),
          enabled: true,
          holiday: holidayInfo,
          eve: eveInfo,
          birthday: birthdayInfo
        };
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: holidayInfo || 'Culto com a participação das famílias',
          time: '19H00',
          dirigente: getDefault(0, 'noite', 'dirigente'),
          louvor: getDefault(0, 'noite', 'louvor', 'TODOS OS DEPARTAMENTOS'),
          porta: getDefault(0, 'noite', 'porta'),
          agua: getDefault(0, 'noite', 'agua'),
          enabled: true,
          holiday: holidayInfo,
          eve: eveInfo,
          birthday: birthdayInfo
        };
      } else if (dayOfWeek === 2) { // Terça
        const isLastTuesday = days.filter(d => getDay(d) === 2).pop().getDate() === day.getDate();
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: holidayInfo || (isLastTuesday ? 'Culto de Santa Ceia' : 'Culto de doutrina'),
          time: '19H00',
          dirigente: getDefault(2, 'noite', 'dirigente'),
          louvor: getDefault(2, 'noite', 'louvor'),
          porta: getDefault(2, 'noite', 'porta'),
          agua: getDefault(2, 'noite', 'agua'),
          enabled: true,
          holiday: holidayInfo,
          eve: eveInfo,
          birthday: birthdayInfo
        };
      } else if (dayOfWeek === 4) { // Quinta
        initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: holidayInfo || 'Culto de portas abertas',
          time: '19H00',
          dirigente: getDefault(4, 'noite', 'dirigente'),
          louvor: getDefault(4, 'noite', 'louvor', 'TODOS OS DEPARTAMENTOS'),
          porta: getDefault(4, 'noite', 'porta'),
          agua: getDefault(4, 'noite', 'agua'),
          enabled: true,
          holiday: holidayInfo,
          eve: eveInfo,
          birthday: birthdayInfo
        };
      } else if (dayOfWeek === 6) { // Sábado
        initialData[`${dateStr}_tarde`] = {
          isEbd: false,
          dateStr,
          title: holidayInfo || 'CÍRCULO DA ORAÇÃO',
          time: '14H00',
          dirigente: getDefault(6, 'tarde', 'dirigente'),
          louvor: getDefault(6, 'tarde', 'louvor'),
          porta: getDefault(6, 'tarde', 'porta'),
          agua: getDefault(6, 'tarde', 'agua'),
          enabled: true,
          holiday: holidayInfo,
          eve: eveInfo,
          birthday: birthdayInfo
        };
      }
      
      if (isNewYearEve && dayOfWeek !== 0 && dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 6) {
         initialData[`${dateStr}_noite`] = {
          isEbd: false,
          dateStr,
          title: 'CULTO DE VIRADA',
          time: '21H00',
          dirigente: getDefault(dayOfWeek, 'noite', 'dirigente'),
          louvor: getDefault(dayOfWeek, 'noite', 'louvor', 'TODOS OS DEPARTAMENTOS'),
          porta: getDefault(dayOfWeek, 'noite', 'porta'),
          agua: getDefault(dayOfWeek, 'noite', 'agua'),
          enabled: true,
          holiday: 'CULTO DE VIRADA',
          eve: eveInfo,
          birthday: birthdayInfo
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

  const getLogoDataUrl = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 500;
        canvas.height = img.naturalHeight || 150;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({ url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const handleSaveTemporary = (silent = false) => {
    if (!silent) {
      setSaveDraftModal(true);
    } else {
      // Salva silencioso sem autor se for apenas fallback, mas como é na nuvem, melhor não fazer silent na nuvem sem autor.
      // O silent agora é substituído pelo modal.
    }
  };

  const confirmSaveDraft = async () => {
    if (!draftAuthor.trim()) return alert("Por favor, informe seu nome.");
    setIsSavingDraft(true);
    const key = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
    const payload = {
      mes_ano: key,
      nome_rascunho: `Rascunho de ${draftAuthor}`, // Fallback para a coluna nome_rascunho
      autor_rascunho: draftAuthor,
      dados: cultosData
    };
    try {
      await supabase.from('escalas_salvas').insert([payload]);
      setRefreshKey(prev => prev + 1);
      setSaveDraftModal(false);
      setDraftAuthor('');
      alert('Os dados desta escala foram salvos na nuvem e ficarão disponíveis para você e sua equipe.');
      setStep(2); // Vai para step 2, ou poderia ir para step 1. Como a tela 3 já tem "Voltar", vamos manter no step 3 e apenas fechar modal? O original ia pra setStep(2) pra editar, não faz muito sentido. Vamos apenas exibir a msg de sucesso e continuar no step 3 (já estamos nele, ou no 1). 
    } catch (err) {
      console.log('Erro ao salvar:', err);
      alert('Ocorreu um erro ao salvar o rascunho.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const monthNameUpper = format(selectedMonth, 'MMMM', { locale: ptBR }).toUpperCase();
    const yearStr = selectedMonth.getFullYear();
    
    // Carregar logos
    const logoUrl = `${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO2.svg`;
    const logoVertUrl = `${import.meta.env.BASE_URL}logos-igreja/SÍMBOLO - ASB - TEXTO - VERTICAL2.svg`;
    
    const [logoData, logoVertData] = await Promise.all([
      getLogoDataUrl(logoUrl),
      getLogoDataUrl(logoVertUrl)
    ]);

    let startY = 15;

    if (logoData) {
      const targetWidth = 35; // Ajustado para não ficar gigante
      const targetHeight = (targetWidth * logoData.height) / logoData.width;
      doc.addImage(logoData.url, 'PNG', 105 - (targetWidth / 2), startY, targetWidth, targetHeight);
      startY += targetHeight + 5;
    } else {
      startY += 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Palmeira dos Índios', 105, startY, { align: 'center' });
    startY += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ESCALA DE CULTOS E OUTRAS REALIZAÇÕES', 105, startY, { align: 'center' });
    startY += 6;
    doc.text(`MÊS DE ${monthNameUpper} DE ${yearStr}`, 105, startY, { align: 'center' });

    let y = startY + 10;
    const pageHeight = 275;

    Object.entries(cultosData).forEach(([key, item]) => {
      if (!item.enabled) return;

      const dateObj = new Date(item.dateStr + 'T12:00:00');
      const dayNumStr = format(dateObj, 'dd');
      const dayOfWeekStr = format(dateObj, 'EEEE', { locale: ptBR }).toUpperCase();

      const itemHeight = item.isEbd ? 22 : 36;
      if (y + itemHeight > pageHeight) {
        doc.addPage();
        y = 20;
      }

      const isSantaCeia = item.title.toUpperCase().includes('SANTA CEIA');
      const bannerBgColor = isSantaCeia ? [186, 28, 28] : [0, 150, 135];
      
      doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
      doc.rect(15, y, 180, 6, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      
      const itemTitle = item.title === 'Outro' && item.customTitle ? item.customTitle.toUpperCase() : item.title.toUpperCase();
      const bannerText = `DIA ${dayNumStr} DE ${monthNameUpper} (${dayOfWeekStr}) - ${itemTitle} ÀS ${item.time}`;
      doc.text(bannerText, 17, y + 4.5);

      y += 11;

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      if (item.isEbd) {
        doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
        doc.circle(17, y - 1.2, 1.2, 'F');
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'normal');
        doc.text('PROFESSOR: ', 20, y);
        let w = doc.getTextWidth('PROFESSOR: ');
        doc.setFont('helvetica', 'bold');
        doc.text((item.professor || '').toUpperCase(), 20 + w, y);
        y += 7;
      } else {
        doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
        doc.circle(17, y - 1.2, 1.2, 'F');
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'normal');
        doc.text('DIRIGENTE: ', 20, y);
        let w1 = doc.getTextWidth('DIRIGENTE: ');
        doc.setFont('helvetica', 'bold');
        doc.text((item.dirigente || '').toUpperCase(), 20 + w1, y);
        y += 6;
        
        doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
        doc.circle(17, y - 1.2, 1.2, 'F');
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'normal');
        doc.text('LOUVOR: ', 20, y);
        let w2 = doc.getTextWidth('LOUVOR: ');
        doc.setFont('helvetica', 'bold');
        doc.text((item.louvor || '').toUpperCase(), 20 + w2, y);
        y += 6;
        
        doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
        doc.circle(17, y - 1.2, 1.2, 'F');
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'normal');
        doc.text('PORTA: ', 20, y);
        let w3 = doc.getTextWidth('PORTA: ');
        doc.setFont('helvetica', 'bold');
        doc.text((item.porta || '').toUpperCase(), 20 + w3, y);
        y += 6;
        
        doc.setFillColor(bannerBgColor[0], bannerBgColor[1], bannerBgColor[2]);
        doc.circle(17, y - 1.2, 1.2, 'F');
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'normal');
        doc.text('ÁGUA: ', 20, y);
        let w4 = doc.getTextWidth('ÁGUA: ');
        doc.setFont('helvetica', 'bold');
        doc.text((item.agua || '').toUpperCase(), 20 + w4, y);
        y += 10;
      }
    });

    // Bloco Final (Rodapé)
    if (y > 220) {
      doc.addPage();
    }
    
    let footerY = 230; // Fixado a uma distância constante do final

    if (logoVertData) {
      const targetWidth = 35;
      const targetHeight = (targetWidth * logoVertData.height) / logoVertData.width;
      doc.addImage(logoVertData.url, 'PNG', 105 - (targetWidth / 2), footerY, targetWidth, targetHeight);
      footerY += targetHeight + 6;
    } else {
      footerY += 30;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Lado esquerdo (Alinhado à direita)
    const leftX = 101; // Ajustado para ficar mais perto
    let leftY = footerY;
    const lineHeight = 6.5; // Aumentado o vão entre as linhas
    
    doc.text('Pastor José Valter da Silva', leftX, leftY, { align: 'right' }); leftY += lineHeight;
    doc.text('Secretários: Primeiro(a) secretário(a)', leftX, leftY, { align: 'right' }); leftY += lineHeight;
    doc.text('Vanessa Soares de Araújo; segundo(a)', leftX, leftY, { align: 'right' }); leftY += lineHeight;
    doc.text('secretário(a) José Yago Silva Góes', leftX, leftY, { align: 'right' });
    
    // Lado direito (Alinhado à esquerda)
    const rightX = 106; // Ajustado para ficar mais perto
    let rightY = footerY;
    doc.text('CNPJ: 08.936.324/0001-48', rightX, rightY, { align: 'left' }); rightY += lineHeight;
    doc.text('Loteamento Bosque das Bromélias, Quadra', rightX, rightY, { align: 'left' }); rightY += lineHeight;
    doc.text('C, Nº 8, Palmeira de Fora - Palmeira dos', rightX, rightY, { align: 'left' }); rightY += lineHeight;
    doc.text('Índios, Alagoas', rightX, rightY, { align: 'left' });

    // Paginação
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }

    const fileName = `ESCALA DE ${monthNameUpper} ${yearStr} - IEASB.pdf`;
    doc.save(fileName);
    
    // Salva automaticamente e mostra o modal
    handleSaveTemporary(true);
    setShowSuccessModal(true);
  };

  const sortedMemberList = sortMembers(members);

  const handleSetDefault = (dayOfWeek, timeKey, field, value, isChecked) => {
    const defaults = JSON.parse(localStorage.getItem('escalaDefaults') || '{}');
    const key = `${dayOfWeek}_${timeKey}_${field}`;
    if (isChecked) {
      defaults[key] = value;
    } else {
      delete defaults[key];
    }
    localStorage.setItem('escalaDefaults', JSON.stringify(defaults));
  };

  const getTemporaryData = (year, monthIndex) => {
    try {
      const key = `escalaTempData_${year}_${monthIndex}`;
      const payloadStr = localStorage.getItem(key);
      if (!payloadStr) return null;
      const payload = JSON.parse(payloadStr);
      if (new Date().getTime() > payload.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return payload.data;
    } catch {
      return null;
    }
  };

  const handleContinueSaved = (month, savedData, e) => {
    e.stopPropagation();
    setSelectedMonth(month);
    setCultosData(savedData);
    setStep(2);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Modal de Gestão de Membros */}
      <MembersModal 
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      {/* Modal de Sucesso após gerar PDF */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Salvo com Sucesso!</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Seu PDF foi baixado e os dados desta escala foram salvos no seu dispositivo.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-6">
                <p className="text-amber-800 text-xs font-semibold flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Você pode voltar aqui em até 7 dias para editar e gerar um novo PDF sem precisar preencher tudo de novo!
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drafts List Modal */}
      {draftsListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button 
              type="button"
              onClick={() => setDraftsListModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileEdit className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Rascunhos Salvos</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Selecione o rascunho de {format(draftsListModal.month, 'MMMM yyyy', { locale: ptBR })} que deseja acessar:
            </p>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
              {draftsListModal.drafts.map((draft, idx) => (
                <button
                  key={draft.id || idx}
                  type="button"
                  onClick={() => {
                    setDraftsListModal(null);
                    setDraftActionModal({ month: draftsListModal.month, draft });
                  }}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-left flex justify-between items-center"
                >
                  <span className="truncate flex-1">Rascunho {idx + 1}</span>
                  <span className="text-xs text-slate-500 font-normal">por {draft.autor_rascunho || 'Desconhecido'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Draft Action Modal */}
      {draftActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button 
              type="button"
              onClick={() => setDraftActionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileEdit className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Gerenciar Rascunho</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Criado por <strong>{draftActionModal.draft.autor_rascunho || 'Desconhecido'}</strong>. O que deseja fazer com esta escala?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={(e) => {
                  handleContinueSaved(draftActionModal.month, draftActionModal.draft.dados, e);
                  setDraftActionModal(null);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Continuar Editando
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = draftActionModal.draft;
                  setDraftActionModal(null);
                  setConfirmDeleteDraft({ month: draftActionModal.month, draftId: d.id, autor: d.autor_rascunho });
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Apagar Rascunho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button 
              type="button"
              onClick={() => setConfirmDeleteDraft(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Apagar Rascunho?</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Tem certeza que deseja apagar o rascunho de <strong>{confirmDeleteDraft.autor || 'Desconhecido'}</strong>? Esta ação removerá o rascunho para todos os usuários.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await supabase.from('escalas_salvas').delete().eq('id', confirmDeleteDraft.draftId);
                    setRefreshKey(prev => prev + 1);
                    setConfirmDeleteDraft(null);
                  } catch (err) {
                    alert('Erro ao apagar o rascunho na nuvem.');
                  }
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Sim, Apagar Definitivamente
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteDraft(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Não, Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Draft Modal */}
      {saveDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
            <button 
              type="button"
              onClick={() => setSaveDraftModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Salvar Rascunho na Nuvem</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Informe seu nome para que sua equipe saiba quem criou este rascunho.
            </p>
            <input 
              type="text" 
              value={draftAuthor} 
              onChange={e => setDraftAuthor(e.target.value)} 
              placeholder="Ex: João Silva"
              className="w-full mb-6 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-center"
            />
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isSavingDraft || !draftAuthor.trim()}
                onClick={confirmSaveDraft}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isSavingDraft ? 'Salvando...' : 'Salvar e Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 max-w-md mx-auto">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-[18px] left-[15%] right-[15%] h-0.5 bg-slate-200 z-0" />
          
          {[
            { num: 1, label: 'Mês' },
            { num: 2, label: 'Definições' },
            { num: 3, label: 'Baixar PDF' }
          ].map((s) => {
            const isActive = step >= s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-2">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-4 ring-slate-50' 
                      : 'bg-white text-slate-400 border border-slate-300'
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

      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          
          {upcomingBirthdays.length > 0 && (
            <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl p-4 sm:p-5 shadow-lg shadow-fuchsia-500/20 text-white flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg leading-tight">Aniversariantes Próximos 🎉</h3>
                <p className="text-fuchsia-100 text-sm mt-0.5">
                  Não esqueça de parabenizar nossos irmãos.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {upcomingBirthdays.map(b => {
                  const isToday = b.dia === currentDate.getDate() && b.mes === currentDate.getMonth() + 1;
                  return (
                    <div key={b.membro_nome} className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-between gap-4 text-sm font-medium">
                      <span>{b.membro_nome}</span>
                      <span className="bg-white text-fuchsia-600 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                        {isToday ? 'É Hoje!' : `Dia ${String(b.dia).padStart(2,'0')}/${String(b.mes).padStart(2,'0')}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              Selecione o Mês da Escala ({selectedYear})
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Os feriados e datas comemorativas nacionais serão identificados automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {yearMonths.map((month) => {
              const monthEnd = endOfMonth(month);
              const isPast = isBefore(monthEnd, startOfMonth(currentDate));

              return (
                <button
                  key={month.toISOString()}
                  onClick={() => handleMonthSelect(month)}
                  className={`group relative p-5 border rounded-2xl flex flex-col items-center gap-3 transition-all duration-200 text-left cursor-pointer hover:shadow-md ${
                    isPast 
                      ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100' 
                      : 'bg-white hover:bg-blue-50/60 border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    isPast 
                      ? 'bg-slate-200 text-slate-500 group-hover:bg-slate-600 group-hover:text-white' 
                      : 'bg-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <CalendarIcon className="w-5 h-5" />
                  </div>

                  <div className="text-center w-full">
                    <span className="text-sm font-bold text-slate-700 capitalize mt-2">
                        {format(month, 'MMMM', { locale: ptBR })}
                      </span>
                    {isPast && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 text-slate-600 font-semibold text-[10px] rounded-md uppercase tracking-wider">
                        Passado
                      </span>
                    )}
                    
                    {(() => {
                      const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
                      const savedDrafts = cloudDrafts[monthKey];
                      if (savedDrafts && savedDrafts.length > 0) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDraftsListModal({ month, drafts: savedDrafts }); }}
                            className="absolute top-2 right-2 p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                            title="Ver rascunhos salvos"
                          >
                            <FileEdit className="w-5 h-5" />
                          </button>
                        );
                      }
                      return null;
                    })()}

                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Navegar entre Anos:
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> {selectedYear - 1}
              </button>

              <div className="w-48">
                <CustomSelect
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(Number(val))}
                  options={Array.from({ length: 7 }, (_, i) => currentYearNum - 3 + i).map(year => ({
                    value: year,
                    label: `Ano ${year} ${year === currentYearNum ? '(Atual)' : ''}`
                  }))}
                />
              </div>

              <button
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
              >
                {selectedYear + 1} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

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
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Trocar Mês
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Avançar para Resumo <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(cultosData).map(([key, item]) => {
              const dateObj = new Date(item.dateStr + 'T12:00:00');
              const dayNum = format(dateObj, 'dd');
              const dayName = format(dateObj, 'EEEE', { locale: ptBR });

              let availableTypes = ALL_CULTO_TYPES;
              if (item.isEbd) availableTypes = ['ESCOLA BÍBLICA DOMINICAL'];
              if (getDay(dateObj) === 6) availableTypes = ['CÍRCULO DA ORAÇÃO', ...ALL_CULTO_TYPES];

              const isSantaCeia = item.title.toUpperCase().includes('SANTA CEIA');

              return (
                <div 
                  key={key}
                  className={`p-5 rounded-2xl border bg-white shadow-sm transition-all ${
                    isSantaCeia
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-slate-200'
                  }`}
                >
                  {item.holiday && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Data Especial Detectada: <strong>{item.holiday}</strong></span>
                    </div>
                  )}
                  
                  {item.eve && (
                    <div className="mb-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Lembrete: <strong>{item.eve}</strong></span>
                    </div>
                  )}

                  {item.birthday && (
                    <div className="mb-3 p-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-800 text-xs font-semibold flex items-center gap-2">
                      <Gift className="w-4 h-4 text-fuchsia-600 shrink-0" />
                      <span>{item.birthday}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center border ${
                        isSantaCeia 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {dayNum}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 capitalize text-base">
                          {dayName}
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

                  {item.enabled ? (
                    <div className="space-y-4">
                      {!item.isEbd && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-700">Tipo de Culto</label>
                          <CustomSelect 
                            value={item.title}
                            onChange={(val) => handleUpdateItem(key, 'title', val)}
                            options={[...availableTypes, 'Outro']}
                          />
                          {item.title === 'Outro' && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-1">
                              <input
                                type="text"
                                placeholder="Nome do evento..."
                                value={item.customTitle || ''}
                                onChange={(e) => handleUpdateItem(key, 'customTitle', e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="time"
                                value={item.time.replace('H', ':')}
                                onChange={(e) => handleUpdateItem(key, 'time', e.target.value.replace(':', 'H'))}
                                className="w-full sm:w-32 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {item.isEbd ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-blue-600" /> Professor da EBD
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" className="w-3 h-3 text-blue-600" onChange={(e) => handleSetDefault(getDay(dateObj), 'ebd', 'professor', item.professor, e.target.checked)} />
                              <span className="text-[10px] text-slate-500 font-semibold">Deixar padrão</span>
                            </label>
                          </div>
                          <CustomSelect 
                            value={item.professor || ''}
                            onChange={(val) => handleUpdateItem(key, 'professor', val)}
                            options={sortedMemberList}
                            placeholder="Selecione..."
                            showTempAdd={true}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Dirigente
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 text-blue-600" onChange={(e) => handleSetDefault(getDay(dateObj), getDay(dateObj) === 6 ? 'tarde' : 'noite', 'dirigente', item.dirigente, e.target.checked)} />
                                <span className="text-[10px] text-slate-500 font-semibold">Deixar padrão</span>
                              </label>
                            </div>
                            <CustomSelect 
                              value={item.dirigente || ''}
                              onChange={(val) => handleUpdateItem(key, 'dirigente', val)}
                              options={sortedMemberList}
                              showTempAdd={true}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                <Music className="w-3.5 h-3.5 text-blue-600" /> Louvor
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 text-blue-600" onChange={(e) => handleSetDefault(getDay(dateObj), getDay(dateObj) === 6 ? 'tarde' : 'noite', 'louvor', item.louvor, e.target.checked)} />
                                <span className="text-[10px] text-slate-500 font-semibold">Deixar padrão</span>
                              </label>
                            </div>
                            <CustomSelect 
                              value={item.louvor || ''}
                              onChange={(val) => handleUpdateItem(key, 'louvor', val)}
                              options={['TODOS OS DEPARTAMENTOS', ...sortedMemberList]}
                              showTempAdd={true}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                <DoorClosed className="w-3.5 h-3.5 text-blue-600" /> Porta
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 text-blue-600" onChange={(e) => handleSetDefault(getDay(dateObj), getDay(dateObj) === 6 ? 'tarde' : 'noite', 'porta', item.porta, e.target.checked)} />
                                <span className="text-[10px] text-slate-500 font-semibold">Deixar padrão</span>
                              </label>
                            </div>
                            <CustomSelect 
                              value={item.porta || ''}
                              onChange={(val) => handleUpdateItem(key, 'porta', val)}
                              options={sortedMemberList}
                              showTempAdd={true}
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                <Droplets className="w-3.5 h-3.5 text-blue-600" /> Água
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" className="w-3 h-3 text-blue-600" onChange={(e) => handleSetDefault(getDay(dateObj), getDay(dateObj) === 6 ? 'tarde' : 'noite', 'agua', item.agua, e.target.checked)} />
                                <span className="text-[10px] text-slate-500 font-semibold">Deixar padrão</span>
                              </label>
                            </div>
                            <CustomSelect 
                              value={item.agua || ''}
                              onChange={(val) => handleUpdateItem(key, 'agua', val)}
                              options={sortedMemberList}
                              showTempAdd={true}
                            />
                          </div>

                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-center sm:text-left">
                      <button
                        onClick={() => {
                          setCultosData(prev => ({
                            ...prev,
                            [key]: { 
                              ...prev[key], 
                              enabled: true, 
                              title: 'Outro', 
                              customTitle: '',
                              isEbd: false 
                            }
                          }));
                        }}
                        className="px-4 py-2 bg-slate-100 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors border border-slate-200 shadow-sm"
                      >
                        + Adicionar outro evento neste lugar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && selectedMonth && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Escala Pronta para Exportação!</h2>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Sua escala para o mês de <strong className="text-slate-900 capitalize">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong> foi estruturada com sucesso.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button 
                type="button"
                onClick={generatePDF}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all cursor-pointer"
              >
                <FileDown className="w-5 h-5" />
                Baixar PDF Formatado
              </button>

              <button 
                type="button"
                onClick={() => setStep(2)}
                className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-200 transition-all cursor-pointer"
              >
                <Edit3 className="w-5 h-5" />
                Editar Dados da Escala
              </button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Voltar à Página Inicial
              </button>
            </div>
        </div>
      )}

    </div>
  );
}
