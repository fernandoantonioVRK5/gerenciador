import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ExpenseModal from '../components/modals/ExpenseModal';
import InstallmentDetailModal from '../components/modals/InstallmentDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { format, parseISO } from 'date-fns'; // 1. IMPORTAÇÕES ADICIONAIS DE 'date-fns'

const ITEMS_PER_PAGE = 8;

export default function CardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  // 2. PEGAR O 'setSelectedDate' DO CONTEXTO PARA PODER ATUALIZAR A DATA
  const { selectedDate, setSelectedDate } = useData();

  // Estados principais
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados dos modais
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [detailModalData, setDetailModalData] = useState(null);

  // Estados para os controles de filtro e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 3. LÓGICA PARA CONTROLAR O INPUT DE DATA (COPIADA DO Header.jsx)
  const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  function handleDateChange(event) {
    const dateString = event.target.value;
    if (dateString) {
      const newDate = parseISO(dateString);
      setSelectedDate(newDate);
    }
  }

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
    const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data, error: rpcError } = await supabase
      .rpc('get_transactions_by_card', {
        card_name: cardId,
        start_date: firstDay,
        end_date: lastDay
      });
    if (rpcError) {
      console.error('Erro ao buscar transações via RPC:', rpcError);
      setError('Não foi possível carregar as transações.');
      setTransactions([]);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [cardId, selectedDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (sortOrder !== 'custom-date') {
      setStartDate('');
      setEndDate('');
    }
  }, [sortOrder]);

  const handleDelete = async (e, parcela) => {
    e.stopPropagation();
    if (!window.confirm("Você tem certeza?")) return;
    const parentExpense = parcela.despesas || parcela.despesas_fixas;
    const totalParcelas = parentExpense.parcelas[0].count;
    let deleteError;
    if (totalParcelas === 1) {
      const fromTable = parcela.despesas ? 'despesas' : 'despesas_fixas';
      const { error } = await supabase.from(fromTable).delete().eq('id', parentExpense.id);
      deleteError = error;
    } else {
      const { error } = await supabase.from('parcelas').delete().eq('id', parcela.id);
      deleteError = error;
    }
    if (deleteError) {
      alert(`Erro ao deletar: ${deleteError.message}`);
    } else {
      setTransactions(prev => prev.filter(tx => tx.id !== parcela.id));
    }
  };
  
  const handleEdit = (e, transaction) => {
    e.stopPropagation();
    setEditingTransaction(transaction);
    setExpenseModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setExpenseModalOpen(true);
  };
  
  const handleOpenDetailModal = (transaction) => {
    const parentExpense = transaction.despesas || transaction.despesas_fixas;
    if (parentExpense.parcelas[0].count > 1) {
      setDetailModalData(transaction);
    }
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    if (startDate) result = result.filter(tx => new Date(tx.data_vencimento + 'T00:00:00') >= new Date(startDate + 'T00:00:00'));
    if (endDate) result = result.filter(tx => new Date(tx.data_vencimento + 'T00:00:00') <= new Date(endDate + 'T00:00:00'));
    if (searchTerm) {
      result = result.filter(tx => {
        const parent = tx.despesas || tx.despesas_fixas;
        if (!parent) return false;
        return parent.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tx.valor_parcela.toString().includes(searchTerm);
      });
    }
    result.sort((a, b) => {
      const parentA = a.despesas || a.despesas_fixas;
      const parentB = b.despesas || b.despesas_fixas;
      if (!parentA || !parentB) return 0;
      switch (sortOrder) {
        case 'date-asc': return new Date(a.data_vencimento) - new Date(b.data_vencimento);
        case 'alpha-asc': return parentA.descricao.localeCompare(parentB.descricao);
        case 'alpha-desc': return parentB.descricao.localeCompare(parentA.descricao);
        default: return new Date(b.data_vencimento) - new Date(a.data_vencimento);
      }
    });
    return result;
  }, [transactions, searchTerm, sortOrder, startDate, endDate]);

  const pageCount = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const currentTransactions = filteredAndSortedTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalVisibleValue = useMemo(() => currentTransactions.reduce((acc, tx) => acc + tx.valor_parcela, 0), [currentTransactions]);
  const cardName = cardId.charAt(0).toUpperCase() + cardId.slice(1);
  const formatCurrency = (value) => value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

  return (
    <>
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => { setExpenseModalOpen(false); setEditingTransaction(null); }}
        cardId={cardId}
        onSave={fetchTransactions}
        initialData={editingTransaction}
      />
      
      <InstallmentDetailModal 
        isOpen={Boolean(detailModalData)}
        onClose={() => setDetailModalData(null)}
        transactionData={detailModalData}
      />

      <motion.div 
        className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          
          {/* 4. ADICIONA O SELETOR DE DATA AO LADO DO BOTÃO DE VOLTAR */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <input
              type="date"
              value={dateValue}
              onChange={handleDateChange}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 color-scheme-dark"
            />
          </div>
          
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Detalhes: <span className="text-cyan-400">{cardName}</span>
            </h1>
            <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              <PlusCircle className="w-5 h-5" />
              Nova Despesa
            </button>
          </div>
          
          {/* O resto do componente continua igual... */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" /><input type="text" placeholder={`Buscar em ${cardName}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-style w-full pl-10"/></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-style sm:max-w-xs"><option value="date-desc">Mais Recentes</option><option value="date-asc">Mais Antigas</option><option value="alpha-asc">Descrição (A-Z)</option><option value="alpha-desc">Descrição (Z-A)</option><option value="custom-date">Período Customizado...</option></select>
              <AnimatePresence>
                {sortOrder === 'custom-date' && (<motion.div className="flex flex-1 gap-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-style color-scheme-dark w-full" title="Data de início" /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-style color-scheme-dark w-full" title="Data de fim" /></motion.div>)}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-baseline"><h2 className="text-xl font-semibold mb-4">Histórico de Transações</h2><div className="text-right mb-4"><p className="text-sm text-zinc-400">Total na Página</p><p className="font-bold text-lg text-cyan-400">{formatCurrency(totalVisibleValue)}</p></div></div>
              {loading && <p className="text-center text-zinc-400 py-8">Carregando transações...</p>}
              {error && (<div className="flex flex-col items-center text-center text-rose-400 py-8"><AlertCircle className="w-10 h-10 mb-2"/><p className="font-semibold">Ocorreu um erro</p><p className="text-sm text-zinc-500">{error}</p></div>)}
              {!loading && !error && currentTransactions.length > 0 && (
                <>
                  <ul className="divide-y divide-zinc-800">
                    {currentTransactions.map(tx => {
                      const parentExpense = tx.despesas || tx.despesas_fixas;
                      if (!parentExpense) return null;
                      const totalParcelas = parentExpense.parcelas[0].count;
                      const isInstallment = totalParcelas > 1;
                      return (
                        <li key={tx.id} onClick={() => handleOpenDetailModal(tx)} className={`py-4 flex flex-col sm:flex-row justify-between items-start gap-4 ${isInstallment ? 'cursor-pointer hover:bg-zinc-800/50 -mx-4 px-4 rounded-md' : ''} transition-colors duration-200`}>
                          <div className="flex-1">
                            <p className="font-medium text-zinc-200">{parentExpense.descricao} {isInstallment && `(${tx.numero_parcela}/${totalParcelas})`}</p>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                              {parentExpense.data_compra && <span>Compra: {new Date(parentExpense.data_compra + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                              <span>Vencimento: {new Date(tx.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                            <span className="font-semibold text-rose-400 text-lg">{formatCurrency(tx.valor_parcela)}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => handleEdit(e, tx)} className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-md transition-colors"><Pencil className="w-4 h-4" /></button>
                                <button onClick={(e) => handleDelete(e, tx)} className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex justify-between items-center mt-6 text-sm"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button><span className="text-zinc-400">Página {currentPage} de {pageCount}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))} disabled={currentPage === pageCount} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Próxima</button></div>
                </>
              )}
              {!loading && !error && filteredAndSortedTransactions.length === 0 && (<p className="text-center text-zinc-500 py-8">Nenhuma despesa encontrada para este mês.</p>)}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
