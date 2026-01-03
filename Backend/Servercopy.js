const app = require('./app');
const { connectToMongoDB } = require('./config/db');
require('dotenv').config({ path: './auth.env' });

const PORT = process.env.PORT || 5500;

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
});
