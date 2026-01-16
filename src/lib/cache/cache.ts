class Cache {
  constructor() {}

  set(key: string, value: any, ttl: number) {
    const expiration = Date.now() + ttl;
    localStorage.setItem(key, JSON.stringify({ value, expiration }));
  }

  get(key: string): any {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { value, expiration } = JSON.parse(item);
    if (Date.now() > expiration) {
      this.remove(key);
      return null;
    }

    return value;
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}

export const cache = new Cache();
