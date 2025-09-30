// src/contexts/DataContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
      const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

      // A busca de rendas continua igual (assumindo que 'renda' não foi alterada)
      const { data: incomeData, error: incomeError } = await supabase
        .from('renda')
        .select('valor')
        .gte('data', firstDay)
        .lte('data', lastDay);
      
      // -> CORREÇÃO AQUI <-
      // Busca despesas na tabela 'parcelas' e filtra pela data de vencimento
      const { data: expensesData, error: expensesError } = await supabase
        .from('parcelas')
        .select('valor_parcela') // Pega o valor da parcela
        .gte('data_vencimento', firstDay) // Filtra pelo vencimento
        .lte('data_vencimento', lastDay);

      if (incomeError) console.error('Erro ao buscar renda:', incomeError);
      if (expensesError) console.error('Erro ao buscar despesas:', expensesError);
      
      const totalIncome = incomeData ? incomeData.reduce((acc, item) => acc + item.valor, 0) : 0;
      // Soma usando o campo correto 'valor_parcela'
      const totalExpenses = expensesData ? expensesData.reduce((acc, item) => acc + item.valor_parcela, 0) : 0;

      setMonthlyIncome(totalIncome);
      setMonthlyExpenses(totalExpenses);
      setLoading(false);
    };

    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate]);

  const value = {
    selectedDate,
    setSelectedDate,
    monthlyIncome,
    monthlyExpenses,
    loading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);

}
