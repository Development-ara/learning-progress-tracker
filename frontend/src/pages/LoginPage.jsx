import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupRequest = new URLSearchParams(location.search).get('mode') === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(normalizedEmail, password);
      if (user.mustChangePassword) navigate('/change-password', { replace: true });
      else if (user.role === 'Coordinator') navigate('/dashboard', { replace: true });
      else navigate('/my-training', { replace: true });
    } catch (err) {
      setError(err.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <Link to="/" className="auth-brand"><span className="brand-mark">L</span> LearningTracker</Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">YOUR LEARNING, IN FOCUS</span>
          <h1>Make every<br /><em>step count.</em></h1>
          <p>One calm, clear workspace to organise activities, follow progress and celebrate every milestone.</p>
          <div className="auth-showcase-points">
            <span><b>✓</b> Personal learning workspace</span>
            <span><b>✓</b> Progress you can actually see</span>
            <span><b>✓</b> Coordinator and learner access</span>
          </div>
        </div>
        <div className="auth-showcase-foot">Learn steadily. Grow confidently.</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back-link">← Back to home</Link>
          <div className="auth-heading">
            <span className="auth-icon">✦</span>
            <p className="auth-kicker">{isSignupRequest ? 'GET STARTED' : 'WELCOME BACK'}</p>
            <h2>{isSignupRequest ? 'Request your account' : 'Sign in to continue'}</h2>
            <p>{isSignupRequest ? 'Learner accounts are created by your coordinator. Sign in if you already have your credentials, or contact your coordinator to request access.' : 'Enter your account details to open your learning workspace.'}</p>
          </div>

          {isSignupRequest && (
            <div className="auth-info" role="status">
              <strong>New to LearningTracker?</strong>
              <span>Your coordinator creates learner accounts and shares your temporary sign-in details. You can sign in here once you receive them.</span>
            </div>
          )}

          {error && <div className="auth-error" role="alert"><span>!</span>{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="you@example.com" disabled={loading} required />
            </div>
            <div className="auth-field">
              <div className="auth-label-row"><label htmlFor="password">Password</label></div>
              <div className="password-input-wrap">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" disabled={loading} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing you in…' : 'Sign in to your workspace'} <span>→</span></button>
          </form>
          <div className="auth-bottom-note">Need an account? <Link to="/login?mode=signup">Request access</Link></div>
          <div className="auth-secure-note"><span>⌑</span> Your account and learning data stay protected.</div>
        </div>
      </section>
    </main>
  );
}
