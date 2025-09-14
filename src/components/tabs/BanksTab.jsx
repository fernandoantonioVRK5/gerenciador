// src/components/tabs/BanksTab.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from '../dashboard/CreditCard';
import { QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext'; // Para pegar a data selecionada
import { supabase } from '../../lib/supabaseClient';  // Para conectar ao backend

// ... (as variantes de animação continuam as mesmas)
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

export function BanksTab() {
  // 1. Estados para armazenar os saldos e o estado de carregamento
  const [balances, setBalances] = useState({ nubank: 0, inter: 0, pix: 0 });
  const [loading, setLoading] = useState(true);
  
  // Pega a data selecionada do nosso contexto global
  const { selectedDate } = useData();

  // 2. Efeito para buscar os dados sempre que a data selecionada mudar
  useEffect(() => {
    const fetchBalances = async () => {
      setLoading(true);

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
      const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

      // 3. Consulta ao Supabase para buscar as parcelas do mês
      const { data: parcels, error } = await supabase
        .from('parcelas')
        .select('valor_parcela, despesas(metodo_pagamento)') // Pega o valor e o método de pagamento da despesa relacionada
        .gte('data_vencimento', firstDay)
        .lte('data_vencimento', lastDay);

      if (error) {
        console.error("Erro ao buscar balanços dos cartões:", error);
        setLoading(false);
        return;
      }
      
      // 4. Agrega os dados para calcular o total de cada método de pagamento
      const totals = { nubank: 0, inter: 0, pix: 0 };
      if (parcels) {
        for (const parcel of parcels) {
          const method = parcel.despesas.metodo_pagamento;
          if (totals.hasOwnProperty(method)) {
            totals[method] += parcel.valor_parcela;
          }
        }
      }
      
      setBalances(totals);
      setLoading(false);
    };

    fetchBalances();
  }, [selectedDate]); // Dependência: Roda de novo se a data mudar

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Exibe uma mensagem enquanto os dados são carregados
  if (loading) {
    return <p className="text-zinc-400 text-center">Calculando faturas...</p>
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Link to="/card/nubank">
          <CreditCard 
            bank="nubank"
            cardHolder="Fernando Antonio"
            lastFourDigits="2682"
            balance={balances.nubank} // 5. Usa o valor do estado
          />
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link to="/card/inter">
          <CreditCard 
            bank="inter"
            cardHolder="Fernando Antonio"
            lastFourDigits="3338"
            balance={balances.inter} // 5. Usa o valor do estado
          />
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link to="/card/pix">
          <div className="flex flex-col justify-between w-full h-56 p-6 rounded-xl shadow-lg bg-gray-800 border border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">PIX</h3>
              <QrCode className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-400">Despesas no PIX</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(balances.pix)}</p> {/* 5. Usa o valor do estado */}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}