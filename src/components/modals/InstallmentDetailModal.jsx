// src/components/modals/InstallmentDetailModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Hash, Package, TrendingUp } from 'lucide-react';
import { addMonths, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InstallmentDetailModal({ isOpen, onClose, transactionData }) {
  // Se não estiver aberto ou não tiver dados, não renderiza nada
  if (!isOpen || !transactionData) {
    return null;
  }

  // --- CÁLCULOS DAS INFORMAÇÕES ---
  const parentExpense = transactionData.despesas || transactionData.despesas_fixas;
  const totalParcelas = parentExpense.parcelas[0].count;
  const parcelaAtual = transactionData.numero_parcela;
  const valorParcela = transactionData.valor_parcela;

  // Calcula o valor total. Usa o valor_total se existir, senão multiplica.
  const valorTotal = parentExpense.valor_total || (valorParcela * totalParcelas);
  const parcelasRestantes = totalParcelas - parcelaAtual;
  const progressoPercentual = (parcelaAtual / totalParcelas) * 100;

  // Calcula a data de término
  // 1. Pega a data da parcela atual
  const dataVencimentoAtual = new Date(transactionData.data_vencimento + 'T00:00:00');
  // 2. Subtrai os meses para descobrir a data da primeira parcela
  const dataInicioCobranca = subMonths(dataVencimentoAtual, parcelaAtual - 1);
  // 3. Adiciona o total de meses (menos 1) à data de início para achar a data final
  const dataTermino = addMonths(dataInicioCobranca, totalParcelas - 1);
  // 4. Formata a data para exibição
  const dataTerminoFormatada = format(dataTermino, "MMMM 'de' yyyy", { locale: ptBR });

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-zinc-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">Detalhes da Despesa</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-zinc-100 text-center mb-2">{parentExpense.descricao}</h3>

                <div className="bg-zinc-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-zinc-400">Valor Total da Compra</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(valorTotal)}</p>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-1 text-sm text-zinc-300">
                        <span>Progresso</span>
                        <span>Parcela {parcelaAtual} de {totalParcelas}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2.5">
                        <div 
                            className="bg-cyan-500 h-2.5 rounded-full" 
                            style={{ width: `${progressoPercentual}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div className="bg-zinc-800 p-3 rounded-lg">
                        <p className="text-sm text-zinc-400">Parcelas Restantes</p>
                        <p className="text-xl font-bold text-white">{parcelasRestantes}</p>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-lg">
                        <p className="text-sm text-zinc-400">Término Esperado</p>
                        <p className="text-xl font-bold text-white capitalize">{dataTerminoFormatada}</p>
                    </div>
                </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}