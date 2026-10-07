import React, { type ReactNode } from 'react';
import { Icon, type IconName } from './Icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  iconSize?: number;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  iconSize = 16,
  className = '',
  ...props
}) => {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {icon && <Icon name={icon} size={iconSize} />}
      <span>{children}</span>
    </button>
  );
};
