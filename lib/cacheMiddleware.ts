import { Raito } from '@raito-cache/client';
import { RaitoConnectionException } from './RaitoConnectionException';
import { Context, Next } from 'hono';

export const cacheResponse = (customTtl?: number) => {
  const raito = Raito.instance;
  if (!raito) {
    throw new RaitoConnectionException(`Failed to connect with Raito server`);
  }

  return async function (c: Context, next: Next) {
    const key = `${c.req.method}:${c.req.path}`;
    const foundCache = await raito.get(key);

    if (foundCache) {
      return c.json(JSON.parse(foundCache.data));
    } else {
      const body = JSON.stringify(await c.req.json());
      await raito.set(key, body, customTtl);
      await next();
    }
  };
};
