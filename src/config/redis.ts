import * as redis from 'redis';

const redisClient = redis.createClient({
  url: 'redis://localhost:7070',
});

export default redisClient;
