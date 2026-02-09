const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('');
      console.log('══════════════════════════════════════');
      console.log(`  Sondos AI Backend v2.0`);
      console.log(`  http://localhost:${PORT}`);
      console.log(`  ${process.env.NODE_ENV || 'development'}`);
      console.log('══════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
