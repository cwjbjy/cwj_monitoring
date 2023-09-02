import type { Info } from '../types/index';

class Events {
  cache: Info[];
  constructor() {
    this.cache = [];
  }

  getLength() {
    return this.cache.length;
  }
  add(data: Info) {
    this.cache.push(data);
  }
  clear() {
    this.cache.length = 0;
  }
}

export default new Events();
