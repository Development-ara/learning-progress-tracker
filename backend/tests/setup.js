const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const { hashPassword } = require('../src/utils/password');

let db;
let app;

async function setupTestApp() {
  // Create a fresh in-memory database
  db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'schema.sql'), 'utf-8');
  db.exec(schema);

  // Override getDatabase to return our test db
  const dbModule = require('../src/db/database');
  dbModule.getDatabase = () => db;

  // Seed test data
  const coordHash = await hashPassword('Coord!n@t0r1');
  db.prepare(
    'INSERT INTO accounts (email, password_hash, role, must_change_password, password_version) VALUES (?, ?, ?, 0, 1)'
  ).run('coordinator@tracker.local', coordHash, 'Coordinator');

  const candidates = [
    { name: 'Jordan Lee', email: 'jordan.lee@example.com', password: 'Candidate1!' },
    { name: 'Morgan Chen', email: 'morgan.chen@example.com', password: 'Candidate2!' },
    { name: 'Casey Rivera', email: 'casey.rivera@example.com', password: 'Candidate3!' },
  ];

  for (const c of candidates) {
    const hash = await hashPassword(c.password);
    const result = db.prepare(
      'INSERT INTO accounts (email, password_hash, role, must_change_password, password_version) VALUES (?, ?, ?, 0, 1)'
    ).run(c.email, hash, 'Candidate');
    db.prepare(
      'INSERT INTO learners (display_name, cohort, account_id) VALUES (?, ?, ?)'
    ).run(c.name, 'Frontend', result.lastInsertRowid);
  }

  // Create a candidate that must change password
  const mustChangeHash = await hashPassword('TempPass1!');
  const mustChangeResult = db.prepare(
    'INSERT INTO accounts (email, password_hash, role, must_change_password, temp_password_expiry, password_version) VALUES (?, ?, ?, 1, ?, 1)'
  ).run('newcandidate@example.com', mustChangeHash, 'Candidate', new Date(Date.now() + 86400000).toISOString());
  db.prepare(
    'INSERT INTO learners (display_name, cohort, account_id) VALUES (?, ?, ?)'
  ).run('New Candidate', 'Frontend', mustChangeResult.lastInsertRowid);

  // Activities
  db.prepare('INSERT INTO activities (title, topic, planned_hours) VALUES (?, ?, ?)').run('React Basics', 'Frontend', 6);
  db.prepare('INSERT INTO activities (title, topic, planned_hours) VALUES (?, ?, ?)').run('REST APIs', 'Backend', 8);
  db.prepare('INSERT INTO activities (title, topic, planned_hours) VALUES (?, ?, ?)').run('SQL Foundations', 'Data', 4);
  db.prepare('INSERT INTO activities (title, topic, planned_hours) VALUES (?, ?, ?)').run('Node.js Essentials', 'Backend', 10);

  // Assignments
  const jordanId = db.prepare("SELECT id FROM learners WHERE display_name = 'Jordan Lee'").get().id;
  const reactId = db.prepare("SELECT id FROM activities WHERE title = 'React Basics'").get().id;
  const restId = db.prepare("SELECT id FROM activities WHERE title = 'REST APIs'").get().id;
  const sqlId = db.prepare("SELECT id FROM activities WHERE title = 'SQL Foundations'").get().id;

  db.prepare('INSERT INTO assignments (learner_id, activity_id, status) VALUES (?, ?, ?)').run(jordanId, reactId, 'In Progress');
  db.prepare('INSERT INTO assignments (learner_id, activity_id, status) VALUES (?, ?, ?)').run(jordanId, restId, 'Not Started');
  db.prepare('INSERT INTO assignments (learner_id, activity_id, status) VALUES (?, ?, ?)').run(jordanId, sqlId, 'Completed');

  // Build Express app for testing
  app = express();
  app.use(express.json());

  // Simple in-memory session store for testing
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false },
  }));

  // Skip Content-Type CSRF check for tests since supertest sets it
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

  // Mount routes (re-require to pick up overridden getDatabase)
  // Clear module cache for routes so they use the overridden db
  const routeModules = [
    '../src/routes/auth',
    '../src/routes/activities',
    '../src/routes/learners',
    '../src/routes/assignments',
    '../src/routes/cohortSummary',
    '../src/middleware/auth',
  ];
  routeModules.forEach((mod) => {
    delete require.cache[require.resolve(mod)];
  });

  const authRoutes = require('../src/routes/auth');
  const activitiesRoutes = require('../src/routes/activities');
  const learnersRoutes = require('../src/routes/learners');
  const assignmentsRoutes = require('../src/routes/assignments');
  const cohortSummaryRoutes = require('../src/routes/cohortSummary');

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/activities', activitiesRoutes);
  app.use('/api/v1/learners', learnersRoutes);
  app.use('/api/v1/assignments', assignmentsRoutes);
  app.use('/api/v1/me/assignments', (req, res, next) => {
    req.url = '/me';
    assignmentsRoutes(req, res, next);
  });
  app.use('/api/v1/cohort-summary', cohortSummaryRoutes);

  return { app, db };
}

function getApp() {
  return app;
}

function getDb() {
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { setupTestApp, getApp, getDb, closeDb };
