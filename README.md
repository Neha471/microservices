# Microservices Architecture Project

A distributed system built using microservices architecture, featuring multiple independent services that communicate with each other through well-defined APIs.

## Project Structure

The project consists of the following microservices:

- `api-gateway`: Entry point for all client requests (runs on port 4000)
- `auth-service`: Handles user authentication and authorization
- `cart-service`: Manages shopping cart functionality
- `inventory-service`: Manages product inventory
- `notification-service`: Handles user notifications
- `order-service`: Processes and manages orders
- `payment-service`: Handles payment processing
- `product-service`: Manages product catalog

## Accessing the Application

The application is accessible through the API Gateway at:

```
http://localhost:4001
```

## Prerequisites

- Docker and Docker Compose
- Consul for service discovery
- Java (for Spring Boot services)
- Maven (for building services)

## Getting Started

1. Clone the repository
2. Navigate to the project directory

### First Time Setup

To build and run all services for the first time:

```bash
docker-compose -f docker-compose.consul.yml up --build
```

The `--build` flag ensures all Docker images are built from scratch.

### Running Existing Services

If you've already built the services before, you can simply run:

```bash
docker-compose -f docker-compose.consul.yml up
```

### Stopping Services

To stop all running services:

```bash
docker-compose -f docker-compose.consul.yml down
```

### Restarting Services

To restart all services:

```bash
docker-compose -f docker-compose.consul.yml down && docker-compose -f docker-compose.consul.yml up
```

### Running in Background

To run services in the background:

```bash
docker-compose -f docker-compose.consul.yml up -d
```

### Viewing Logs

To view logs of all services:

```bash
docker-compose -f docker-compose.consul.yml logs -f
```

To view logs of a specific service (e.g., auth-service):

```bash
docker-compose -f docker-compose.consul.yml logs -f auth-service
```

## Service Communication

All services communicate through:

- RESTful APIs
- Service discovery using Consul
- API Gateway for request routing

## Development

Each service is independently deployable and can be developed separately. The services communicate through well-defined APIs and are loosely coupled.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
