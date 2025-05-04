const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cors = require('cors');

//service discovery registration
const Consul = require('consul');
//const consul = new Consul();
const consul = new Consul({ host: process.env.CONSUL_HOST || 'consul', port: process.env.CONSUL_PORT || 8500 });

const serviceName = 'inventory-service';
const serviceId = serviceName + '-' + process.pid;
const servicePort = process.env.PORT || 5004;
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
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Inventory Service MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/inventory', inventoryRoutes);
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
