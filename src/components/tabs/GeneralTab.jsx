// src/components/tabs/GeneralTab.jsx

import React, { useState } from 'react';
import { StatCard } from '../dashboard/StatCard';
import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { motion } from 'framer-motion';
import IncomeListModal from '../modals/IncomeListModal'; // 1. IMPORTAR O MODAL DA LISTA

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
};

export function GeneralTab() {
  const { monthlyIncome, monthlyExpenses, loading, selectedDate } = useData();
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false); // 2. ESTADO PARA CONTROLAR O MODAL

  const balance = monthlyIncome - monthlyExpenses;

  const formatCurrency = (value) => (
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );

  if (loading) {
    return <p className="text-center text-zinc-400">Carregando dados...</p>;
  }

  return (
    <>
      {/* 3. RENDERIZA O MODAL DA LISTA */}
      <IncomeListModal 
        isOpen={isIncomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        selectedDate={selectedDate}
      />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 4. ADICIONA ONCLICK E ESTILIZAÇÃO NO CARD DE RENDA */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setIncomeModalOpen(true)}
          className="cursor-pointer"
        >
          <StatCard
            title="Renda Mensal"
            value={formatCurrency(monthlyIncome)}
            Icon={ArrowUpCircle}
            variant="green"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Despesas Mensais"
            value={formatCurrency(monthlyExpenses)}
            Icon={ArrowDownCircle}
            variant="red"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            title="Saldo"
            value={formatCurrency(balance)}
            Icon={Scale}
            variant="blue"
          />
        </motion.div>
      </motion.div>
    </>
  );
} 
