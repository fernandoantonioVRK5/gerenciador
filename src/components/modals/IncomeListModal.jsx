// src/components/modals/IncomeListModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import AddIncomeModal from './AddIncomeModal';
import { format } from 'date-fns';

export default function IncomeListModal({ isOpen, onClose, selectedDate }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const fetchIncomes = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = format(new Date(year, month, 1), 'yyyy-MM-dd');
    const lastDay = format(new Date(year, month + 1, 0), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('renda')
      .select('*')
      .gte('data', firstDay)
      .lte('data', lastDay)
      .order('data', { ascending: false });

    if (error) {
      console.error('Erro ao buscar rendas:', error);
      setError('Não foi possível carregar as rendas.');
      setIncomes([]);
    } else {
      setIncomes(data);
    }
    setLoading(false);
  }, [isOpen, selectedDate]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);
  
  const handleDelete = async (incomeId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta renda?")) return;
    
    const { error } = await supabase
      .from('renda')
      .delete()
      .eq('id', incomeId);
      
    if (error) {
      alert("Erro ao excluir renda: " + error.message);
    } else {
      // Atualiza a lista localmente para uma resposta mais rápida
      setIncomes(prev => prev.filter(inc => inc.id !== incomeId));
    }
  };

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <AddIncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={() => {
          fetchIncomes(); // Recarrega a lista
        }}
        selectedDate={selectedDate}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg p-6 border border-zinc-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">Rendas de {format(selectedDate, 'MMMM yyyy')}</h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
              </div>

              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  <PlusCircle className="w-5 h-5" />
                  Adicionar Renda
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading && <p className="text-center text-zinc-400 py-4">Carregando...</p>}
                {error && <div className="text-center text-rose-400 py-4"><AlertCircle className="mx-auto mb-2 w-8 h-8"/><p>{error}</p></div>}
                {!loading && !error && incomes.length > 0 && (
                  <ul className="divide-y divide-zinc-800">
                    {incomes.map(income => (
                      <li key={income.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-zinc-200">{income.descricao}</p>
                          <p className="text-xs text-zinc-500">{format(new Date(income.data + 'T00:00:00'), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-emerald-400">{formatCurrency(income.valor)}</span>
                          <button onClick={() => handleDelete(income.id)} className="p-2 text-zinc-500 hover:text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!loading && !error && incomes.length === 0 && (
                  <p className="text-center text-zinc-500 py-8">Nenhuma renda cadastrada para este mês.</p>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}