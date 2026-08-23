const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { initBookingSocket } = require('./sockets/bookingSocket');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

initBookingSocket(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SevaSetu Backend API', time: new Date() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/societies', require('./routes/societyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [SevaSetu Error] Port ${PORT} is already in use by another Node process.`);
    console.error(`To free up port ${PORT} on Windows PowerShell, run:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    console.error(`Or specify a different PORT in backend/.env (e.g. PORT=5001)\n`);
    process.exit(1);
  } else {
    console.error(`Server error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SevaSetu Backend Server running on port ${PORT}`);
  console.log(`  Real-time Socket.io active`);
  console.log(`=======================================================`);
});
