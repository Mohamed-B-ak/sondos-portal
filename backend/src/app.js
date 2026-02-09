// =====================================================
// Sondos AI Backend — Express App (PRODUCTION READY)
// =====================================================
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { loginLimiter, registerLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const sondosRoutes = require('./routes/sondos.routes');

const app = express();

// ==================== CORS — Environment-aware ====================
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL].filter(Boolean)                    // ✅ Production: only real domain
  : ['http://localhost:5173', 'http://localhost:5174',             // ✅ Dev: localhost allowed
     process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin && !isProduction) return callback(null, true);
    if (!origin && isProduction) return callback(null, false);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('غير مسموح من هذا المصدر (CORS)'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== Body Parsing ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== Request Logging (dev only) ====================
if (!isProduction) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== Health Check ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sondos AI Backend API',
    version: '2.1.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ==================== Routes with Rate Limiting ====================

// ✅ Rate limiters are now APPLIED (not just imported)
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api', apiLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/user', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Sondos API Proxy (Frontend → Backend → Sondos)
app.use('/api/sondos', sondosRoutes);

// ⛔ Backward compatibility routes REMOVED
// Old frontend should be updated to use /api/user/* and /api/admin/*
// Keeping them doubles the attack surface and bypasses route-level security

// ==================== Error Handling ====================
app.use(notFound);
app.use(errorHandler);

module.exports = app;