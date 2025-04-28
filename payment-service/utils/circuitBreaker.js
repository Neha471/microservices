class CircuitBreaker {
  constructor(action, failureThreshold = 3, cooldownPeriod = 5000) {
    this.action = action;
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriod) {
        this.state = 'HALF';
      } else {
        throw new Error('Circuit is open. Please try again later.');
      }
    }
    try {
      const result = await this.action(...args);
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
      }
      throw error;
    }
  }
}

module.exports = CircuitBreaker;
