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
          <h2>👤 Guest Mode Active</h2>
          <div className="auth-notice">
            <p><strong>You're using SerenityAI as a guest!</strong></p>
            <p>All features work, but your data is stored locally only.</p>
            <p className="hint">Cloud sync requires Supabase configuration.</p>
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
        setSuccess('✅ Check your email to verify your account! You\'ll be redirected back to the app.');
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
          {isLogin ? 'Sign in to sync your data across devices' : 'Unlock cloud sync & personalized experience'}
        </p>

        {/* Benefits for signing up */}
        {!isLogin && (
          <div className="auth-benefits">
            <div className="benefit-item">✅ Cloud sync across devices</div>
            <div className="benefit-item">✅ Persistent mood history</div>
            <div className="benefit-item">✅ Saved journal entries</div>
            <div className="benefit-item">✅ Personalized AI insights</div>
          </div>
        )}

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

        <div className="auth-guest-note">
          <p>🔓 No account needed to try the app - all features work as a guest!</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
