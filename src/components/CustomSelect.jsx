import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, ArrowRight } from 'lucide-react';

export function CustomSelect({ value, onChange, options, placeholder = 'Selecione...', showTempAdd = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingTemp, setIsAddingTemp] = useState(false);
  const [tempName, setTempName] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAddingTemp(false);
        setTempName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => (typeof o === 'string' ? o === value : o.value === value));
  const selectedLabel = typeof selectedOption === 'string' ? selectedOption : (selectedOption?.label || value || placeholder);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) setIsAddingTemp(false);
          setIsOpen(!isOpen);
        }}
        className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-left text-sm text-slate-800 font-medium flex items-center justify-between shadow-sm transition-all cursor-pointer"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-fadeIn">
          
          {showTempAdd && (
            <div className="px-2 pb-2 mb-1 border-b border-slate-100">
              {isAddingTemp ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nome de fora..."
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tempName.trim()) {
                        e.preventDefault();
                        onChange(tempName.trim());
                        setIsOpen(false);
                        setIsAddingTemp(false);
                        setTempName('');
                      }
                    }}
                    className="w-full text-sm px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempName.trim()) {
                        onChange(tempName.trim());
                        setIsOpen(false);
                        setIsAddingTemp(false);
                        setTempName('');
                      }
                    }}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTemp(true)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar nome de fora
                </button>
              )}
            </div>
          )}

          {options.map((opt) => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const isSelected = optVal === value;

            return (
              <button
                key={optVal}
                type="button"
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
