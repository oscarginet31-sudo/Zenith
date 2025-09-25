
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  // FIX: Added optional title prop to support tooltips, resolving an error in Transactions.tsx.
  title?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '', title }) => {
  return <i className={`fa-solid ${name} ${className}`} title={title}></i>;
};

export default Icon;
