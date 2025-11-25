import React from 'react';
import { Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label, variant = 'contained', ...props }) => {
  return (
    <MuiButton variant={variant} {...props}>
      {label}
    </MuiButton>
  );
};

export default Button;
