const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Order Service MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
