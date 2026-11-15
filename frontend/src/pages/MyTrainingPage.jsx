import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getMyAssignments, updateAssignmentStatus } from '../api/client.js';

export default function MyTrainingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAssignments();
      setAssignments(data);
    } catch (err) {
      if (err.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await updateAssignmentStatus(assignmentId, newStatus);
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a))
      );
      showToast('Status updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="page-container">
      <div className="my-training-header">
        <div>
          <h1>My Training</h1>
          <p className="my-training-user">
            Signed in: <strong>{user?.displayName}</strong>
            {user?.cohort && <> · Cohort: {user.cohort}</>}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading your training..." />}
      {error && <ErrorMessage message={error} onRetry={fetchAssignments} />}

      {!loading && !error && assignments.length === 0 && (
        <EmptyState
          message="No training assigned yet. Contact your coordinator."
          icon="📋"
        />
      )}

      {!loading && !error && assignments.length > 0 && (
        <div>
          {assignments.map((assignment) => (
            <div className="training-card" key={assignment.id}>
              <div className="training-card-info">
                <h3>{assignment.activityTitle || assignment.title}</h3>
                <div className="training-card-meta">
                  <span>📖 {assignment.activityTopic || assignment.topic}</span>
                  <span>⏱ {assignment.plannedHours} hours</span>
                </div>
              </div>
              <div className="training-card-status">
                <label htmlFor={`status-${assignment.id}`} className="sr-only" style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  border: 0,
                }}>
                  Status for {assignment.activityTitle || assignment.title}
                </label>
                <select
                  id={`status-${assignment.id}`}
                  value={assignment.status}
                  onChange={(e) => handleStatusChange(assignment.id, e.target.value)}
                  aria-label={`Status for ${assignment.activityTitle || assignment.title}`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        </div>
      )}
    </main>
  );
}
