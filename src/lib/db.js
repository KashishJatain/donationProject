import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {console.log('Mongoose: creating connection promise to', MONGODB_URI);
    // use recommended options
    cached.promise = mongoose
      .connect(MONGODB_URI, {})
      .then((mongooseInstance) => {
        console.log('Mongoose: connected');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('Mongoose connection error:', err);
        cached.promise = null;
        throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;