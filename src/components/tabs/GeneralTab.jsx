// src/components/tabs/GeneralTab.jsx

import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { motion } from 'framer-motion'; // 1. Importa a 'motion'

// 2. Define as "variantes" da animação para o container e para os itens
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Atraso de 0.2s entre cada item filho
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Começa 20px para baixo e invisível
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }, // Anima para a posição original e visível
};

export function GeneralTab() {
  const { monthlyIncome, monthlyExpenses, loading } = useData();

  const balance = monthlyIncome - monthlyExpenses;

  const formatCurrency = (value) => (
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );

  if (loading) {
    return <p className="text-center text-zinc-400">Carregando dados...</p>;
  }

  return (
    // 3. Usa 'motion.div' e aplica as variantes do container
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 4. Envolve cada card com um 'motion.div' que usa as variantes de item */}
      <motion.div variants={itemVariants}>
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
  );
}