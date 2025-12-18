import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signIn, signUp, resetPassword, updatePassword, isConfigured, session } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Check if user came from password reset email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true' && session) {
      setView('reset');
    }
  }, [session]);

  if (!isConfigured) {
    return createPortal(
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          className="auth-modal" 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>Guest Mode Active</h2>
          <div className="auth-notice">
            <p><strong>You're using SerenityAI as a guest!</strong></p>
            <p>All features work, but your data is stored locally only.</p>
            <p className="hint">Cloud sync requires Supabase configuration.</p>
          </div>
          <button className="primary-btn" onClick={onClose} style={{ width: '100%' }}>Continue as Guest</button>
        </motion.div>
      </div>,
      document.body
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (view === 'login') {
        await signIn(email, password);
        onClose();
      } else if (view === 'signup') {
        await signUp(email, password, displayName);
        setSuccess('Check your email to verify your account!');
      } else if (view === 'forgot') {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
      } else if (view === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await updatePassword(password);
        setSuccess('Password updated successfully!');
        // Clear the reset param from URL
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Sign in to sync your data across devices';
      case 'signup': return 'Unlock cloud sync & personalized experience';
      case 'forgot': return 'Enter your email to receive a reset link';
      case 'reset': return 'Choose a new password for your account';
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        className="auth-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{getTitle()}</h2>
        <p className="auth-subtitle">{getSubtitle()}</p>

        {/* Benefits for signing up */}
        {view === 'signup' && (
          <div className="auth-benefits">
            <div className="benefit-item">✓ Cloud sync across devices</div>
            <div className="benefit-item">✓ Persistent mood history</div>
            <div className="benefit-item">✓ Saved journal entries</div>
            <div className="benefit-item">✓ Personalized AI insights</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {view === 'signup' && (
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          {(view === 'login' || view === 'signup' || view === 'forgot') && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          )}

          {(view === 'login' || view === 'signup' || view === 'reset') && (
            <div className="form-group">
              <label>{view === 'reset' ? 'New Password' : 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {view === 'reset' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Loading...' : 
              view === 'login' ? 'Sign In' : 
              view === 'signup' ? 'Create Account' : 
              view === 'forgot' ? 'Send Reset Link' :
              'Update Password'}
          </button>
        </form>

        {/* Forgot password link */}
        {view === 'login' && (
          <div className="auth-forgot">
            <button onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}>
              Forgot password?
            </button>
          </div>
        )}

        {/* Switch between login/signup */}
        {(view === 'login' || view === 'signup') && (
          <div className="auth-switch">
            {view === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setView('signup'); setError(''); setSuccess(''); }}>Sign up</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => { setView('login'); setError(''); setSuccess(''); }}>Sign in</button>
              </>
            )}
          </div>
        )}

        {/* Back to login from forgot password */}
        {view === 'forgot' && (
          <div className="auth-switch">
            <button onClick={() => { setView('login'); setError(''); setSuccess(''); }}>
              ← Back to Sign In
            </button>
          </div>
        )}

        {(view === 'login' || view === 'signup') && (
          <div className="auth-guest-note">
            <p>No account needed to try the app - all features work as a guest!</p>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};

export default AuthModal;

