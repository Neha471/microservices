const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const cors = require('cors');
const Consul = require('consul');
// const consul = new Consul();
const consul = new Consul({ host: process.env.CONSUL_HOST || 'consul', port: process.env.CONSUL_PORT || 8500 });

//service discovery registration
const serviceName = 'auth-service';
const serviceId = serviceName + '-' + process.pid;
const servicePort = process.env.PORT || 5000;
const serviceHost = process.env.HOST || 'localhost';

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


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => console.error(err));


app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => res.send('OK'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.listen(process.env.PORT, () => {
  console.log(`Auth Service running on port http://localhost:${process.env.PORT}`);
});