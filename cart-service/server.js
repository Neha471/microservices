const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');
const cors = require('cors');

//service discovery registration
const Consul = require('consul');
//const consul = new Consul();
const consul = new Consul({ host: process.env.CONSUL_HOST || 'consul', port: process.env.CONSUL_PORT || 8500 });

const serviceName = 'cart-service';
const serviceId = serviceName + '-' + process.pid;
const servicePort = process.env.PORT || 5002;
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
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);
app.get('/health', (req, res) => res.send('OK'));
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
