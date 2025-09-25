// FIX: Implemented missing Header component to resolve import errors.
import React from 'react';
import MonthNavigator from './MonthNavigator';
import ThemeToggle from './ThemeToggle';
import { Theme } from '../types';

interface HeaderProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    theme: Theme;
    setTheme: (theme: Theme | ((prevTheme: Theme) => Theme)) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMonth, setCurrentMonth, theme, setTheme }) => {
    return (
        <header className="bg-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 border-b border-slate-700">
            <div className="flex items-center gap-4">
                 <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <h1 className="text-2xl font-bold text-slate-100">Zenith</h1>
            </div>
            <MonthNavigator currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>
    );
};

export default Header;
