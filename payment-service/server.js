const express = require('express');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
