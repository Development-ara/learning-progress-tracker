import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { signup } from '../api/client.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupRequest = new URLSearchParams(location.search).get('mode') === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cohort, setCohort] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isSignupRequest) {
      if (!name.trim() || !cohort.trim()) { setError('Enter your full name and cohort.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      setLoading(true);
      try { await signup({ name: name.trim(), email: email.trim().toLowerCase(), cohort: cohort.trim(), password }); setSuccess('Your candidate account has been created. You can now sign in from the sign-in page.'); setPassword(''); setName(''); setCohort(''); }
      catch (err) { setError(err.message || 'Unable to create account.'); }
      finally { setLoading(false); }
      return;
    }
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
            <p>{isSignupRequest ? 'Create your learner account with your name, programme, email and password. Your progress will be linked to this account.' : 'Enter your account details to open your learning workspace.'}</p>
          </div>

          {isSignupRequest && (
            <div className="auth-info" role="status">
              <strong>Create your learner account</strong>
              <span>Use your real name so your coordinator can identify your progress and training records.</span>
            </div>
          )}

          {error && <div className="auth-error" role="alert"><span>!</span>{error}</div>}
          {success && <div className="auth-info" role="status">{success}</div>}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isSignupRequest && <><div className="auth-field"><label htmlFor="candidate-name">Full name</label><input id="candidate-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoComplete="name" disabled={loading} required /></div><div className="auth-field"><label htmlFor="candidate-cohort">Cohort / programme</label><input id="candidate-cohort" value={cohort} onChange={e => setCohort(e.target.value)} placeholder="e.g. Full Stack Development" disabled={loading} required /></div></>}
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
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? (isSignupRequest ? 'Creating account…' : 'Signing you in…') : (isSignupRequest ? 'Create candidate account' : 'Sign in to your workspace')} <span>→</span></button>
          </form>
          <div className="auth-bottom-note">{isSignupRequest ? <>Already registered? <Link to="/login">Sign in</Link></> : <>Need an account? <Link to="/login?mode=signup">Sign up as a candidate</Link></>}</div>
          <div className="auth-secure-note"><span>⌑</span> Your account and learning data stay protected.</div>
        </div>
      </section>
    </main>
  );
}
