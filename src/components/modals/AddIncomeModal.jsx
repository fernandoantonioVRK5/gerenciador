// src/components/modals/AddIncomeModal.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';

export default function AddIncomeModal({ isOpen, onClose, onSave, selectedDate }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usa a data selecionada como padrão para o novo registro
  const dataRenda = format(selectedDate, 'yyyy-MM-dd');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0 || !descricao) {
      alert('Por favor, preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('renda')
      .insert({
        descricao,
        valor: valorNumerico,
        data: dataRenda,
      });

    if (error) {
      alert('Erro ao adicionar renda: ' + error.message);
    } else {
      onSave(); // Avisa o componente pai para recarregar os dados
      onClose(); // Fecha o modal
      // Limpa o formulário
      setDescricao('');
      setValor('');
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-zinc-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Adicionar Nova Renda</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Descrição (Ex: Salário, Freelance)" 
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                className="input-style" 
                required 
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="Valor" 
                value={valor} 
                onChange={(e) => setValor(e.target.value)} 
                className="input-style" 
                required 
              />
               <div className="text-sm text-zinc-400">
                Esta renda será adicionada ao mês de <span className="font-semibold text-cyan-400">{format(selectedDate, 'MMMM \'de\' yyyy')}</span>.
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Renda'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}