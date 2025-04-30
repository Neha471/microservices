const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notificationRoutes');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected for Notification Service'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
