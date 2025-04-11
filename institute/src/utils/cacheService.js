// const redis = require("redis");

// const client = redis.createClient({
//   socket: {
//     host: "localhost",
//     port: 6379,
//   },
// });

// // Connect to Redis
// client.connect().catch(console.error);

// client.on("error", (err) => {
//   console.error("❌ Redis Error:", err);
// });

// client.on("connect", () => {
//   console.log(" Connected to Redis");
// });

// /// Set cache with instituteId-wise key
// const setCache = async (instituteId, key, data, expiry = 3600) => {
//   try {
//     const cacheKey = `${instituteId}_${key}`;
//     await client.setEx(cacheKey, expiry, JSON.stringify(data));
//   } catch (err) {
//     console.error("❌ Redis Set Error:", err);
//   }
// };

// // Get cache with instituteId-wise key
// const getCache = async (instituteId, key) => {
//   try {
//     const cacheKey = `${instituteId}_${key}`;
//     const data = await client.get(cacheKey);
//     return data ? JSON.parse(data) : null;
//   } catch (err) {
//     console.error("❌ Redis Get Error:", err);
//     return null;
//   }
// };

// // Clear cache with instituteId-wise key
// const deleteCache = async (instituteId, key) => {
//   try {
//     const cacheKey = `${instituteId}_${key}`;
//     await client.del(cacheKey);
//   } catch (err) {
//     console.error("❌ Redis Delete Error:", err);
//   }
// };

// module.exports = { setCache, getCache, deleteCache };

const redis = require("redis");

// Create Redis Client
const client = redis.createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

// Connect to Redis
client.connect().catch(console.error);

client.on("error", (err) => console.error("❌ Redis Error:", err));
client.on("connect", () => console.log("✅ Connected to Redis"));

// Set Cache (with expiry time)
const setCache = async (key, data, expiry = 3600) => {
  try {
    await client.setEx(key, expiry, data);
  } catch (err) {
    console.error("❌ Redis Set Error:", err);
  }
};

// Get Cache
const getCache = async (key) => {
  try {
    return await client.get(key);
  } catch (err) {
    console.error("❌ Redis Get Error:", err);
    return null;
  }
};

// Delete Cache
const deleteCache = async (key) => {
  try {
    await client.del(key);
  } catch (err) {
    console.error("❌ Redis Delete Error:", err);
  }
};

module.exports = { setCache, getCache, deleteCache };
