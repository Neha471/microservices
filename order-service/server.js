const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');
const verifyToken = require('./middleware/verifyToken');
//service discovery registration
const Consul = require('consul');
//const consul = new Consul();
const consul = new Consul({ host: process.env.CONSUL_HOST || 'consul', port: process.env.CONSUL_PORT || 8500 });

const serviceName = 'order-service';
const serviceId = serviceName + '-' + process.pid;
const servicePort = process.env.PORT || 5003;
const serviceHost = process.env.HOST || serviceName;

consul.agent.service.register({
  name: serviceName,
  id: serviceId,
  address: serviceHost,
  port: parseInt(servicePort, 10),
  check: {
    http: `http://${serviceHost}:${servicePort}/health`,
    interval: '10s'
  }
}, (err) => {
  if (err) throw err;
  console.log(`${serviceName} registered with Consul`);
});

process.on('SIGINT', () => {
  consul.agent.service.deregister(serviceId, () => {
    console.log(`${serviceName} deregistered from Consul`);
    process.exit();
  });
});
//service discovery registration


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Order Service MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

app.use(verifyToken)
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => res.send('OK'));
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
