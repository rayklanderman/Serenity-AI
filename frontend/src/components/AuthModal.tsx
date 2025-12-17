import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signIn, signUp, isConfigured } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isConfigured) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="auth-modal fade-in" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>🔐 Authentication</h2>
          <div className="auth-notice">
            <p>Supabase is not configured. Data will be stored locally only.</p>
            <p className="hint">To enable cloud sync, add Supabase credentials to your .env file.</p>
          </div>
          <button className="primary-btn" onClick={onClose}>Continue as Guest</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password, displayName);
        setSuccess('Check your email to confirm your account!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{isLogin ? '🔐 Welcome Back' : '✨ Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to sync your data' : 'Join SerenityAI for cloud sync'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
