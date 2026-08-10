import React, { useState, useEffect } from 'react';
import { X, Gift, Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { CustomSelect } from './CustomSelect';

export function BirthdaysModal({ isOpen, onClose, currentUser }) {
  const [birthdays, setBirthdays] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const daysOptions = Array.from({length: 31}, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
  const monthsOptions = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadBirthdays();
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase.from('membros_igreja').select('nome');
      if (!error && data) {
        setMembers(data.map(d => d.nome).sort((a, b) => a.localeCompare(b)));
      }
    } catch (err) {
      console.log('Erro ao carregar membros:', err);
    }
  };

  const loadBirthdays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('aniversarios').select('*').order('mes', { ascending: true }).order('dia', { ascending: true });
      if (!error && data) {
        setBirthdays(data);
      }
    } catch (err) {
      console.log('Erro ao carregar aniversários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedDay || !selectedMonth) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Criamos uma data fictícia de nascimento apenas para gravar corretamente na coluna Date,
    // pois o que realmente importa pro sistema é o dia e mês.
    const fakeYear = 2000;
    const dateStr = `${fakeYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    try {
      const { error } = await supabase.from('aniversarios').upsert({
        membro_nome: selectedMember,
        data_nascimento: dateStr,
        dia: selectedDay,
        mes: selectedMonth
      }, { onConflict: 'membro_nome' });

      if (error) throw error;
      
      setSelectedMember('');
      setSelectedDay('');
      setSelectedMonth('');
      loadBirthdays();
    } catch (err) {
      console.log('Erro ao salvar aniversário:', err);
      alert('Erro ao salvar aniversário. Verifique a conexão com o banco.');
    }
  };

  const handleRemoveBirthday = async (nome) => {
    try {
      const { error } = await supabase.from('aniversarios').delete().eq('membro_nome', nome);
      if (error) throw error;
      loadBirthdays();
    } catch (err) {
      console.log('Erro ao deletar aniversário:', err);
    }
  };

  if (!isOpen) return null;

  const filteredBirthdays = birthdays.filter(b => 
    b.membro_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gerenciar Aniversários</h2>
              <p className="text-xs text-slate-500 font-medium">Cadastre e acompanhe os aniversários dos membros</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Adicionar (Apenas para Admins) */}
          {currentUser?.is_admin && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Registrar Novo Aniversário</h3>
              <div className="space-y-4">
                
                <div className="flex flex-col gap-1.5 relative z-20">
                  <label className="text-xs font-semibold text-slate-600">Membro</label>
                  <CustomSelect
                    value={selectedMember}
                    onChange={setSelectedMember}
                    options={members}
                    placeholder="Selecione o membro..."
                  />
                </div>

                <div className="flex gap-4 relative z-10">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-semibold text-slate-600">Dia</label>
                    <CustomSelect
                      value={selectedDay}
                      onChange={setSelectedDay}
                      options={daysOptions}
                      placeholder="Dia"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-[2]">
                    <label className="text-xs font-semibold text-slate-600">Mês</label>
                    <CustomSelect
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      options={monthsOptions}
                      placeholder="Mês"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleAddBirthday}
                  className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm rounded-xl transition-colors mt-2"
                >
                  Salvar Aniversário
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Aniversariantes Registrados</h3>
              <span className="text-xs font-semibold text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-lg">
                {birthdays.length} cadastrados
              </span>
            </div>

            {birthdays.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar membro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none"
                />
              </div>
            )}

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-xs text-slate-500">Carregando...</div>
              ) : filteredBirthdays.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                  Nenhum aniversário encontrado.
                </div>
              ) : (
                filteredBirthdays.map((b) => (
                  <div key={b.membro_nome} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-fuchsia-200 hover:shadow-sm transition-all group">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.membro_nome}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Faz aniversário dia {String(b.dia).padStart(2, '0')}/{String(b.mes).padStart(2, '0')}
                      </p>
                    </div>
                    {currentUser?.is_admin && (
                      <button
                        onClick={() => handleRemoveBirthday(b.membro_nome)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
