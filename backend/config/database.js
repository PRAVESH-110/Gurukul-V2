const mongoose = require('mongoose');
const Grid = require('gridfs-stream'); //for storage etc  (instead of just json format)

let gfs;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS
    gfs = Grid(conn.connection.db, mongoose.mongo);
    gfs.collection('videos');

    return { connection: conn.connection, gfs };
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const getGFS = () => gfs;

module.exports = { connectDB, getGFS };
