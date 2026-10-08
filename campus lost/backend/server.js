require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const missingRoutes = require('./routes/missingRoutes');
const searchRoutes = require('./routes/searchRoutes');
const claimRoutes = require('./routes/claimRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LostLink API',
    university: 'Anurag University',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/missing', missingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/conversations', chatRoutes); // Handles /api/conversations & messages
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} not found.` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 LostLink Backend running on http://localhost:${PORT}`);
  console.log(`🎓 Anurag University Lost & Found Portal`);
  console.log(`=================================================`);
});
