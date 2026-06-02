'use client';

import { useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeToast } from '../../store/slices/uiSlice';

export function Toaster() {
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector((s) => s.ui);

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => dispatch(removeToast(t.id)), 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        zIndex: 600,
        maxWidth: '360px',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const Icon = isSuccess ? Check : isError ? AlertCircle : Info;
        const iconColor = isSuccess ? '#86efac' : isError ? '#fca5a5' : 'var(--gold)';
        const borderColor = isSuccess ? 'rgba(34,197,94,0.25)' : isError ? 'rgba(239,68,68,0.25)' : 'rgba(0,96,57,0.25)';
        const bgColor = isSuccess ? 'rgba(34,197,94,0.06)' : isError ? 'rgba(239,68,68,0.06)' : 'rgba(0,96,57,0.06)';

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              background: `var(--charcoal-2)`,
              border: `1px solid ${borderColor}`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px rgba(8,6,4,0.5)',
              animation: 'slideLeft 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <div
              style={{
                width: 28, height: 28, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bgColor,
              }}
            >
              <Icon size={14} strokeWidth={2} style={{ color: iconColor }} />
            </div>
            <p
              style={{
                flex: 1,
                fontFamily: "'DM Sans',sans-serif",
                fontSize: '0.72rem',
                color: 'rgba(250,247,240,0.8)',
                letterSpacing: '0.04em',
                lineHeight: 1.5,
                paddingTop: '0.25rem',
              }}
            >
              {toast.message}
            </p>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(250,247,240,0.25)', padding: '0.1rem', display: 'flex', transition: 'color 0.15s ease', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.25)')}
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
