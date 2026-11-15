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
        <div className="page-header">
          <h1>Dashboard{summary?.cohortName ? ` — ${summary.cohortName}` : ''}</h1>
        </div>

        {loading && <LoadingSpinner message="Loading dashboard..." />}
        {error && <ErrorMessage message={error} onRetry={fetchSummary} />}

        {!loading && !error && summary && (
          <>
            <div className="card-grid">
              <div className="summary-card">
                <div className="summary-value">{summary.learnerCount ?? 0}</div>
                <div className="summary-label">Learners</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">{summary.assignmentCount ?? 0}</div>
                <div className="summary-label">Total Assignments</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">{summary.completedCount ?? 0}</div>
                <div className="summary-label">Completed</div>
              </div>
            </div>

            <section>
              <h2 className="section-title">Quick Links</h2>
              <div className="quick-links">
                <Link to="/activities" className="quick-link">
                  📚 View Activities
                </Link>
                <Link to="/candidates" className="quick-link">
                  👥 View Candidates
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
