require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const { initDatabaseAsync, getDatabase } = require('./db/database');
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const learnersRoutes = require('./routes/learners');
const assignmentsRoutes = require('./routes/assignments');
const cohortSummaryRoutes = require('./routes/cohortSummary');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());

// CSRF protection via Content-Type check for state-changing methods
app.use((req, res, next) => {
  const stateMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (stateMethods.includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(403).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

// Session store (in-memory for simplicity since we can't use connect-sqlite3 with sql.js)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  },
}));

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/learners', learnersRoutes);
app.use('/api/v1/assignments', assignmentsRoutes);
app.use('/api/v1/me/assignments', (req, res, next) => {
  req.url = '/me';
  assignmentsRoutes(req, res, next);
});
app.use('/api/v1/cohort-summary', cohortSummaryRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only if this file is run directly
if (require.main === module) {
  initDatabaseAsync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

module.exports = { app, initDatabaseAsync };
