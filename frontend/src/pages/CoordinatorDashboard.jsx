import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getCohortSummary, getActivities } from '../api/client.js';

export default function CoordinatorDashboard() {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [learnerFilter, setLearnerFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (filters = {}) => {
    setLoading(true); setError(null);
    try {
      const [summaryData, activityData] = await Promise.all([getCohortSummary(filters), getActivities()]);
      setSummary(summaryData); setActivities(activityData);
    } catch (err) { setError(err.message || 'Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const applyFilters = (e) => { e.preventDefault(); fetchData({ learnerId: learnerFilter, activityId: activityFilter }); };
  const clearFilters = () => { setLearnerFilter(''); setActivityFilter(''); fetchData(); };

  return <>
    <Navbar />
    <main className="page-container">
      <div className="dashboard-welcome"><div><span className="dashboard-kicker">COORDINATOR WORKSPACE</span><h1>Your learning overview</h1><p>Monitor training activity, learner progress and programme completion.</p></div><span className="dashboard-welcome-mark">✦</span></div>
      {loading && <LoadingSpinner message="Loading dashboard..." />}
      {error && <ErrorMessage message={error} onRetry={() => fetchData({ learnerId: learnerFilter, activityId: activityFilter })} />}
      {!loading && !error && summary && <>
        <div className="dashboard-stats">
          <div className="dashboard-stat"><span className="stat-caption">TOTAL LEARNERS</span><strong>{summary.learnerCount}</strong><small>Registered candidates</small></div>
          <div className="dashboard-stat"><span className="stat-caption">LEARNING ACTIVITIES</span><strong>{summary.activityCount}</strong><small>Available activities</small></div>
          <div className="dashboard-stat"><span className="stat-caption">COMPLETED ACTIVITIES</span><strong>{summary.completedCount}</strong><small>Completed assignments</small></div>
          <div className="dashboard-stat"><span className="stat-caption">PENDING ACTIVITIES</span><strong>{summary.pendingCount}</strong><small>Not yet completed</small></div>
          <div className="dashboard-stat dashboard-stat-progress"><span className="stat-caption">OVERALL COMPLETION</span><strong>{summary.overallCompletion}%</strong><div className="progress-track"><span style={{ width: `${summary.overallCompletion}%` }} /></div><small>{summary.completedCount} of {summary.assignmentCount} assigned activities</small></div>
        </div>

        <section className="report-section">
          <div className="dashboard-section-heading"><div><span className="dashboard-kicker">REPORTING</span><h2 className="section-title">Individual learner progress</h2></div><Link to="/candidates" className="btn btn-secondary">Manage candidates</Link></div>
          <form className="report-filters" onSubmit={applyFilters}>
            <div className="form-group"><label htmlFor="report-learner">Filter by learner</label><select id="report-learner" className="form-input" value={learnerFilter} onChange={e => setLearnerFilter(e.target.value)}><option value="">All learners</option>{(summary.learnerOptions || summary.learners).map(l => <option key={l.id} value={l.id}>{l.displayName}</option>)}</select></div>
            <div className="form-group"><label htmlFor="report-activity">Filter by activity</label><select id="report-activity" className="form-input" value={activityFilter} onChange={e => setActivityFilter(e.target.value)}><option value="">All activities</option>{activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
            <div className="report-filter-actions"><button className="btn btn-primary" type="submit">Apply filters</button><button className="btn btn-secondary" type="button" onClick={clearFilters}>Clear</button></div>
          </form>
          {summary.learners.length === 0 ? <EmptyState message="No learners match these filters." icon="📊" /> : <div className="table-container"><table className="table"><thead><tr><th>Learner</th><th>Cohort</th><th>Assigned</th><th>Completed</th><th>Pending</th><th>Progress</th><th>Report</th></tr></thead><tbody>{summary.learners.map(learner => <tr key={learner.id}><td><strong>{learner.displayName || 'Unnamed learner'}</strong><br /><small>{learner.email}</small></td><td>{learner.cohort}</td><td>{learner.totalActivities || 0}</td><td>{learner.completedActivities || 0}</td><td>{learner.pendingActivities || 0}</td><td><div className="report-progress"><span>{learner.completionPercentage || 0}%</span><div className="progress-track"><span style={{ width: `${learner.completionPercentage || 0}%` }} /></div></div></td><td><Link className="btn-link" to={`/learners/${learner.id}`}>View details</Link></td></tr>)}</tbody></table></div>}
        </section>
        <section><div className="dashboard-section-heading"><div><span className="dashboard-kicker">WORKSPACE TOOLS</span><h2 className="section-title">Manage your programme</h2></div></div><div className="dashboard-action-grid"><Link to="/activities" className="dashboard-action-card"><span className="action-icon">▤</span><span><strong>Learning activities</strong><small>Create, update and organise learning content.</small></span><b>→</b></Link><Link to="/candidates" className="dashboard-action-card"><span className="action-icon">♙</span><span><strong>Candidates</strong><small>Manage learner accounts and track individuals.</small></span><b>→</b></Link></div></section>
      </>}
    </main>
  </>;
}
