import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { getCohortSummary } from '../api/client.js';

export default function CoordinatorDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCohortSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-kicker">COORDINATOR WORKSPACE</span>
            <h1>Your learning overview</h1>
            <p>Keep activities organised and help every learner make progress.</p>
          </div>
          <span className="dashboard-welcome-mark">✦</span>
        </div>

        {loading && <LoadingSpinner message="Loading dashboard..." />}
        {error && <ErrorMessage message={error} onRetry={fetchSummary} />}

        {!loading && !error && summary && (
          <>
            <div className="dashboard-stats">
              <div className="dashboard-stat"><span className="stat-icon">♙</span><span className="stat-caption">LEARNERS</span><strong>{summary.learnerCount ?? 0}</strong><small>People in your programme</small></div>
              <div className="dashboard-stat"><span className="stat-icon">▤</span><span className="stat-caption">ASSIGNMENTS</span><strong>{summary.assignmentCount ?? 0}</strong><small>Learning tasks assigned</small></div>
              <div className="dashboard-stat"><span className="stat-icon">✓</span><span className="stat-caption">COMPLETED</span><strong>{summary.completedCount ?? 0}</strong><small>Milestones achieved</small></div>
            </div>

            <section>
              <div className="dashboard-section-heading"><div><span className="dashboard-kicker">WORKSPACE TOOLS</span><h2 className="section-title">Manage your programme</h2></div></div>
              <div className="dashboard-action-grid">
                <Link to="/activities" className="dashboard-action-card"><span className="action-icon">▤</span><span><strong>Learning activities</strong><small>Create, update and organise learning content.</small></span><b>→</b></Link>
                <Link to="/candidates" className="dashboard-action-card"><span className="action-icon">♙</span><span><strong>Candidates</strong><small>Manage learner accounts and track individuals.</small></span><b>→</b></Link>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
