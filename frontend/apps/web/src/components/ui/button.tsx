import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'rl-button rl-button-primary',
  outline: 'rl-button rl-button-outline',
  ghost: 'rl-button rl-button-ghost',
  link: 'rl-button-link',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: '',
  sm: 'rl-button-sm',
  lg: 'rl-button-lg',
  icon: 'rl-button-icon',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
