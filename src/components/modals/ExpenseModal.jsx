import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { addMonths, format } from 'date-fns';

export default function ExpenseModal({ isOpen, onClose, cardId, onSave, initialData }) {
  // Estados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataCompra, setDataCompra] = useState('');
  const [dataCobranca, setDataCobranca] = useState('');

  // Estados de controle da UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParcelado, setIsParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState(2);
  const [isDespesaFixa, setIsDespesaFixa] = useState(false);
  const [isRecorrente, setIsRecorrente] = useState(false);
  
  // Determina o modo (criar vs. editar) com base na existência de 'initialData'
  const isEditMode = Boolean(initialData);

  // Efeito para preencher/limpar o formulário quando o modal abre
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // MODO EDIÇÃO: Preenche o formulário com os dados existentes
        const parentExpense = initialData.despesas || initialData.despesas_fixas;
        setDescricao(parentExpense.descricao);
        setValor(initialData.valor_parcela); // Edita o valor da parcela individual
        setCategoria(parentExpense.categoria || '');
        // A data da compra só existe para despesas variáveis
        setDataCompra(parentExpense.data_compra ? format(new Date(parentExpense.data_compra + 'T00:00:00'), 'yyyy-MM-dd') : '');
        setDataCobranca(format(new Date(initialData.data_vencimento + 'T00:00:00'), 'yyyy-MM-dd'));
        setIsDespesaFixa(Boolean(initialData.despesas_fixas));
        // Desabilita as opções estruturais na edição para simplificar
        setIsParcelado(false);
        setIsRecorrente(parentExpense.recorrente || false);
      } else {
        // MODO CRIAÇÃO: Limpa o formulário
        const today = new Date().toISOString().slice(0, 10);
        setDescricao('');
        setValor('');
        setCategoria('');
        setDataCompra(today);
        setDataCobranca(today);
        setIsParcelado(false);
        setNumeroParcelas(2);
        setIsDespesaFixa(false);
        setIsRecorrente(false);
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0 || !dataCobranca) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      setIsSubmitting(false);
      return;
    }

    if (isEditMode) {
      // --- LÓGICA DE ATUALIZAÇÃO (UPDATE) ---
      const parentExpense = initialData.despesas || initialData.despesas_fixas;
      const fromTable = initialData.despesas ? 'despesas' : 'despesas_fixas';
      
      // Atualiza o registro mestre (descrição, categoria, etc.)
      const { error: despesaError } = await supabase
        .from(fromTable)
        .update({ descricao, categoria, data_compra: dataCompra })
        .eq('id', parentExpense.id);
        
      // Atualiza a parcela individual (valor e data de vencimento)
      const { error: parcelaError } = await supabase
        .from('parcelas')
        .update({ valor_parcela: valorNumerico, data_vencimento: dataCobranca })
        .eq('id', initialData.id);

      if (despesaError || parcelaError) {
        alert("Erro ao atualizar a despesa. " + (despesaError?.message || parcelaError?.message));
      }
    } else {
      // --- LÓGICA DE CRIAÇÃO (INSERT) ---
      if (isDespesaFixa) {
        const diaVencimento = new Date(dataCobranca + 'T00:00:00').getDate();
        const { data, error } = await supabase.from('despesas_fixas').insert({ descricao, valor_mensal: valorNumerico, categoria, metodo_pagamento: cardId, dia_vencimento: diaVencimento, recorrente: isRecorrente }).select('id').single();
        if (error) { alert('Erro ao criar despesa fixa: ' + error.message); setIsSubmitting(false); return; }
        
        const parcelasCount = isRecorrente ? 12 : 1;
        const dataInicialCobranca = new Date(dataCobranca + 'T00:00:00');
        const parcelas = Array.from({ length: parcelasCount }, (_, i) => ({
          despesa_fixa_id: data.id, numero_parcela: i + 1, valor_parcela: valorNumerico, data_vencimento: format(addMonths(dataInicialCobranca, i), 'yyyy-MM-dd'), pago: false
        }));
        await supabase.from('parcelas').insert(parcelas);
      } else {
        const { data, error } = await supabase.from('despesas').insert({ descricao, valor_total: valorNumerico, data_compra: dataCompra, categoria, metodo_pagamento: cardId }).select('id').single();
        if (error) { alert('Erro ao criar despesa: ' + error.message); setIsSubmitting(false); return; }

        const parcelasCount = isParcelado ? numeroParcelas : 1;
        const valorParcela = parseFloat((valorNumerico / parcelasCount).toFixed(2));
        const dataInicialCobranca = new Date(dataCobranca + 'T00:00:00');
        const parcelas = Array.from({ length: parcelasCount }, (_, i) => ({
          despesa_id: data.id, numero_parcela: i + 1, valor_parcela: valorParcela, data_vencimento: format(addMonths(dataInicialCobranca, i), 'yyyy-MM-dd'), pago: false
        }));
        await supabase.from('parcelas').insert(parcelas);
      }
    }

    onSave();    // Avisa a página para recarregar os dados
    onClose();   // Fecha o modal
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-8 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isEditMode ? 'Editar Despesa' : 'Nova Despesa'} em <span className="capitalize text-cyan-400">{cardId}</span></h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-style" required />
              <input type="number" step="0.01" placeholder={isEditMode ? "Valor da Parcela" : "Valor Total"} value={valor} onChange={(e) => setValor(e.target.value)} className="input-style" required />
              <input type="text" placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input-style" />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs text-zinc-400">Data da Compra</label>
                  <input type="date" value={dataCompra} onChange={(e) => setDataCompra(e.target.value)} className="input-style color-scheme-dark" disabled={isEditMode && isDespesaFixa} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-400">{isEditMode ? "Data de Vencimento" : "Data da Cobrança"}</label>
                  <input type="date" value={dataCobranca} onChange={(e) => setDataCobranca(e.target.value)} className="input-style color-scheme-dark" required />
                </div>
              </div>
              
              {!isEditMode && (
                <div className="border-t border-zinc-800 pt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="fixa" checked={isDespesaFixa} onChange={(e) => setIsDespesaFixa(e.target.checked)} className="h-4 w-4" />
                    <label htmlFor="fixa" className="text-zinc-300">É uma despesa fixa?</label>
                  </div>

                  {isDespesaFixa && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-6">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="recorrente" checked={isRecorrente} onChange={(e) => setIsRecorrente(e.target.checked)} className="h-4 w-4" />
                        <label htmlFor="recorrente" className="text-zinc-300">Recorrente? (gera 12 meses)</label>
                      </div>
                    </motion.div>
                  )}
                  
                  {!isDespesaFixa && (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="parcelado" checked={isParcelado} onChange={(e) => setIsParcelado(e.target.checked)} className="h-4 w-4" />
                      <label htmlFor="parcelado" className="text-zinc-300">Parcelar esta despesa?</label>
                    </div>
                  )}

                  {isParcelado && !isDespesaFixa && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="text-xs text-zinc-400">Nº de Parcelas</label>
                      <input type="number" value={numeroParcelas} onChange={(e) => setNumeroParcelas(Number(e.target.value))} className="input-style w-28 text-center" min="2" />
                    </motion.div>
                  )}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-md disabled:opacity-50">
                {isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Despesa' : 'Salvar Despesa')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}