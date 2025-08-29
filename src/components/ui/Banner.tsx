import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface BannerProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function Banner({ variant, message, onDismiss, className = '' }: BannerProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-800',
      icon: AlertTriangle,
      iconColor: 'text-warning-600'
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-800',
      icon: AlertTriangle,
      iconColor: 'text-error-600'
    },
    success: {
      bg: 'bg-success-50',
      text: 'text-success-800',
      icon: CheckCircle,
      iconColor: 'text-success-600'
    }
  };
  
  const config = variants[variant];
  const Icon = config.icon;
  
  return (
    <div className={`${config.bg} ${config.text} p-4 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}