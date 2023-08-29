import type { Info } from "../types";

class Events {
  cache: Info[];
  constructor() {
    this.cache = [];
  }
  
  getCacheLength() {
    return this.cache.length;
  }
  addCache(data: Info) {
    this.cache.push(data);
  }
  clearCache() {
    this.cache.length = 0;
  }
}

export default new Events();
