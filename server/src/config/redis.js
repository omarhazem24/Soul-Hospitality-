import { createClient } from 'redis';

let redisClient;
let redisSubscriber;

const attachRedisHandlers = (client, label) => {
  client.on('error', (error) => {
    console.error(`${label} error:`, error);
  });

  client.on('ready', () => {
    console.log(`${label} connected`);
  });
};

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    attachRedisHandlers(redisClient, 'Redis client');
  }

  return redisClient;
};

export const getRedisSubscriber = () => {
  if (!redisSubscriber) {
    redisSubscriber = getRedisClient().duplicate();
    attachRedisHandlers(redisSubscriber, 'Redis subscriber');
  }

  return redisSubscriber;
};

export const initializeRedisConnections = async () => {
  const client = getRedisClient();
  const subscriber = getRedisSubscriber();

  if (!client.isOpen) {
    await client.connect();
  }

  if (!subscriber.isOpen) {
    await subscriber.connect();
  }

  try {
    await client.configSet('notify-keyspace-events', 'Ex');
  } catch (error) {
    console.warn('Unable to enable Redis keyspace notifications:', error.message);
  }

  return { client, subscriber };
};
