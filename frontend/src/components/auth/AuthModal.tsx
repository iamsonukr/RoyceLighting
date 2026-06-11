'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeAuthModal, openAuthModal, addToast } from '../../store/slices/uiSlice';
import { loginThunk, registerThunk } from '../../store/slices/authSlice';

export function AuthModal() {
  const dispatch = useAppDispatch();
  const { authModalOpen, authMode } = useAppSelector((s) => s.ui);
  const { loading } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authModalOpen) {
      setName(''); setEmail(''); setPassword(''); setError('');
    }
  }, [authModalOpen, authMode]);

  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const isLogin = authMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let result;
      if (isLogin) {
        result = await dispatch(loginThunk({ email, password }));
      } else {
        result = await dispatch(registerThunk({ name, email, password }));
      }
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: isLogin ? 'Welcome back!' : 'Account created!', type: 'success' }));
        dispatch(closeAuthModal());
      } else {
        setError((result as any).payload || 'Authentication failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      {/* Overlay */}
      <div
        onClick={() => dispatch(closeAuthModal())}
        style={{ position: 'absolute', inset: 0, background: 'rgba(3,32,22,0.82)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.25s ease forwards' }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: '460px',
          background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-2) 62%, var(--coffee))',
          border: '1px solid rgba(0,96,57,0.3)',
          boxShadow: '0 60px 120px rgba(8,6,4,0.7)',
          animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Accent top line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--rolex-green), var(--gold-light), transparent)' }} />

        <div style={{ padding: '2.5rem 2.5rem 3rem' }}>
          {/* Close */}
          <button
            onClick={() => dispatch(closeAuthModal())}
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(250,247,240,0.3)', transition: 'color 0.2s ease', display: 'flex' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ivory)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.3)')}
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Logo mark */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.65rem', fontWeight: 400, letterSpacing: '0.35em', color: 'rgba(250,247,240,0.5)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--gold-light)', marginRight: '0.4rem' }}>✦</span>
              Royace Lighting
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.85rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)', marginBottom: '0.5rem' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.68rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.06em' }}>
              {isLogin ? 'Sign in to your account' : 'Join the Royace circle'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1.5rem', animation: 'fadeIn 0.2s ease forwards' }}>
              <p style={{ fontSize: '0.68rem', color: '#fca5a5', letterSpacing: '0.04em' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="input-luxury"
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-luxury"
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-luxury"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(250,247,240,0.3)', display: 'flex', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.7)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.3)')}
                >
                  {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem', justifyContent: 'center', opacity: loading ? 0.7 : 1, fontSize: '0.62rem' }}
            >
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.65rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.06em' }}>
            {isLogin ? "New to Royace? " : "Already have an account? "}
            <button
              onClick={() => dispatch(openAuthModal(isLogin ? 'register' : 'login'))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-light)', fontSize: '0.65rem', letterSpacing: '0.06em', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans',sans-serif",
  fontSize: '0.58rem',
  fontWeight: 400,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(250,247,240,0.4)',
  marginBottom: '0.5rem',
};
