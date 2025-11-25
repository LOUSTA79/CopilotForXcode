import EventEmitter from 'node:events';

export default class Metrics extends EventEmitter {
  constructor() {
    super();
    this.counters = new Map();
    this.gauges = new Map();
    this.timings = [];
  }

  increment(name, value = 1) {
    const newValue = (this.counters.get(name) ?? 0) + value;
    this.counters.set(name, newValue);
    this.emit('update', this.snapshot());
    return newValue;
  }

  setGauge(name, value) {
    this.gauges.set(name, value);
    this.emit('update', this.snapshot());
  }

  timing(name, value) {
    this.timings.push({ name, value, at: new Date().toISOString() });
    if (this.timings.length > 50) {
      this.timings.shift();
    }
    this.emit('update', this.snapshot());
  }

  snapshot() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      timings: [...this.timings],
      timestamp: new Date().toISOString(),
    };
  }
}
