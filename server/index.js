// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const loanRoutes = require('./routes/loanRoutes.js');
const compareRoutes = require('./routes/compareRoutes.js');
const savedRoutes = require('./routes/savedRoutes.js');
const explainRoutes = require('./routes/explainRoutes.js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/loans', loanRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/explain', explainRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler for unhandled API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

// Start standalone server when executed directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
