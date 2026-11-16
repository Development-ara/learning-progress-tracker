import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="landing-brand"><span className="brand-mark">L</span> LearningTracker</Link>
        <nav aria-label="Public navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="landing-nav-actions">
          <Link className="landing-nav-signup" to="/login?mode=signup">Sign up</Link>
          <Link className="btn btn-primary landing-signin" to="/login">Sign in</Link>
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR LEARNING, IN FOCUS</span>
            <h1>Make progress.<br /><em>One activity</em> at a time.</h1>
            <p>One clear place to manage learning activities, follow progress, and keep every learner moving forward.</p>
            <div className="landing-actions">
              <Link to="/login" className="btn btn-primary landing-cta">Get started <span aria-hidden="true">→</span></Link>
              <Link to="/login?mode=signup" className="landing-signup-link">Create an account</Link>
              <a href="#features" className="landing-text-link">Explore features <span aria-hidden="true">↓</span></a>
            </div>
            <div className="landing-proof"><div className="proof-avatars"><span> L </span><span> C </span><span> ✓ </span></div><span>For learners and coordinators</span></div>
          </div>
          <div className="landing-art" aria-label="Learning progress preview">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="preview-window">
              <div className="preview-top"><div className="preview-dots"><i /><i /><i /></div><span>LEARNING OVERVIEW</span><span className="preview-live">● LIVE</span></div>
              <div className="preview-heading"><div><small>YOUR WORKSPACE</small><h3>Keep growing.</h3></div><span className="preview-icon">✦</span></div>
              <div className="preview-stats"><div><small>Activities</small><strong>12</strong><span>Assigned to you</span></div><div><small>Progress</small><strong>68<small>%</small></strong><span>Keep it up</span></div></div>
              <div className="preview-progress"><div><span>Learning journey</span><b>68%</b></div><div className="progress-track"><i /></div></div>
              <div className="preview-task"><span className="task-check">✓</span><div><b>Build your foundation</b><small>Completed activity</small></div><span className="task-status">DONE</span></div>
              <div className="preview-task"><span className="task-pending">↗</span><div><b>Explore the next topic</b><small>Continue learning</small></div><span className="task-next">NEXT</span></div>
            </div>
            <div className="floating-note"><span>✦</span><div><b>Small steps add up</b><small>Stay consistent every day</small></div></div>
          </div>
        </section>
        <section className="landing-features" id="features"><div className="section-kicker">BUILT FOR BETTER LEARNING</div><h2>Everything in sync.<br /><em>Progress made visible.</em></h2><div className="feature-row"><article><span className="feature-icon">◎</span><h3>Clear activities</h3><p>Keep learning tasks and assignments organised in one place.</p></article><article><span className="feature-icon">↗</span><h3>Visible progress</h3><p>Understand what is complete and what deserves attention next.</p></article><article><span className="feature-icon">⌘</span><h3>Two roles, one goal</h3><p>Dedicated workspaces for coordinators and learners.</p></article></div></section>
        <section className="landing-how" id="how-it-works"><div><div className="section-kicker">SIMPLE BY DESIGN</div><h2>Sign in and pick up<br /><em>where you left off.</em></h2></div><p>Your account takes you to the right workspace. Coordinators manage activities and learners; learners see their own assigned training and update progress.</p><Link to="/login" className="btn btn-primary">Sign in to your workspace →</Link></section>
      </main>
      <footer className="landing-footer"><Link to="/" className="landing-brand"><span className="brand-mark">L</span> LearningTracker</Link><span>© {new Date().getFullYear()} Learning Progress Tracker</span></footer>
    </div>
  );
}
