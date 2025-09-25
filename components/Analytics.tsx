import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { getBehavioralAnalysis } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from './Icon';

interface AnalyticsProps {
  transactions: Transaction[];
}

const COLORS = ['#34d399', '#f87171', '#60a5fa', '#facc15', '#a78bfa', '#fb923c', '#4ade80', '#f472b6'];

const Analytics: React.FC<AnalyticsProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach(tx => {
      const currentAmount = categoryMap.get(tx.category) || 0;
      categoryMap.set(tx.category, currentAmount + tx.amount);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [expenseTransactions]);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    const result = await getBehavioralAnalysis(transactions);
    setAnalysis(result);
    setIsLoading(false);
  };
  
  const tooltipStyle = {
      backgroundColor: '#1e293b',
      border: `1px solid #334155`
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-100 mb-4">Répartition des dépenses</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <Icon name="fa-chart-pie" className="text-4xl text-slate-600 mb-3" />
              <p className="text-slate-500">Aucune donnée de dépense à afficher.</p>
            </div>
        )}
      </div>
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col border border-slate-700">
        <h3 className="text-xl font-semibold text-slate-100 mb-4">Analyse Comportementale</h3>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            {isLoading ? (
                 <Icon name="fa-spinner fa-spin" className="text-4xl text-emerald-500"/>
            ) : analysis ? (
                <div className="bg-slate-700/50 p-6 rounded-lg">
                     <p className="text-lg text-slate-200 leading-relaxed italic">"{analysis}"</p>
                </div>
            ) : (
                 <div className="text-center">
                    <Icon name="fa-lightbulb" className="text-4xl text-slate-600 mb-3" />
                    <p className="text-slate-500 mb-4">Découvrez des informations sur vos habitudes de dépenses.</p>
                 </div>
            )}
        </div>
        <button 
          onClick={handleGenerateAnalysis} 
          disabled={isLoading || expenseTransactions.length < 5}
          className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 px-4 rounded-md hover:bg-emerald-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyse en cours...' : 'Générer une analyse'}
        </button>
        {expenseTransactions.length < 5 && <p className="text-xs text-slate-500 text-center mt-2">Ajoutez encore au moins {5 - expenseTransactions.length} dépense(s) pour activer l'analyse.</p>}
      </div>
    </div>
  );
};

export default Analytics;