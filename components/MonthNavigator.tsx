import React from 'react';
import Icon from './Icon';

interface MonthNavigatorProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, setCurrentMonth }) => {
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setDate(1); // Set to the 1st to avoid month skipping bugs
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setDate(1); // Set to the 1st to avoid month skipping bugs
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const formattedMonth = currentMonth.toLocaleString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={handlePreviousMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
        <Icon name="fa-chevron-left" className="text-slate-300" />
      </button>
      <h2 className="text-lg font-bold text-slate-100 w-40 text-center capitalize">{formattedMonth}</h2>
      <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
        <Icon name="fa-chevron-right" className="text-slate-300" />
      </button>
    </div>
  );
};

export default MonthNavigator;