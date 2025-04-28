const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cors = require('cors');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Inventory Service MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
