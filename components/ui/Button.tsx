
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-light-accent dark:bg-dark-accent text-white hover:bg-opacity-90 dark:hover:bg-opacity-90 focus:ring-light-accent dark:focus:ring-dark-accent',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400',
    danger: 'bg-light-red dark:bg-dark-red text-white hover:bg-opacity-90 dark:hover:bg-opacity-90 focus:ring-light-red dark:focus:ring-dark-red',
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
