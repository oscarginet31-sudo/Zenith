import React from 'react';
import { Theme } from '../types';
import Icon from './Icon';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme | ((prevTheme: Theme) => Theme)) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    // Utiliser la forme fonctionnelle pour garantir que nous basculons à partir de l'état le plus récent.
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10"
      aria-label="Changer le thème"
      title={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
    >
      <Icon name={theme === 'dark' ? 'fa-sun' : 'fa-moon'} className="text-lg" />
    </button>
  );
};

export default ThemeToggle;
