const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || '';
  const isCloudUri = uri.includes('mongodb.net') || uri.includes('+srv');

  try {
    console.log(`Attempting to connect to ${isCloudUri ? 'Cloud MongoDB (Atlas)' : 'MongoDB'}...`);
    
    // For Cloud MongoDB, use 10000ms timeout so network DNS lookup succeeds
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isCloudUri ? 10000 : 4000,
    });
    
    console.log(`✅ MongoDB Successfully Connected to Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
  } catch (error) {
    if (isCloudUri) {
      console.error(`\n❌ Cloud MongoDB Atlas Connection Failed: ${error.message}`);
      console.error(`-------------------------------------------------------------------`);
      console.error(`Common reasons why MongoDB Cloud (Atlas) connections fail:`);
      console.error(`1. IP Whitelist: Go to MongoDB Atlas -> Network Access -> Add IP Address -> 'Allow Access From Anywhere' (0.0.0.0/0).`);
      console.error(`2. Username/Password: Check if your database username and password in backend/.env are correct.`);
      console.error(`3. Special Characters: If your password contains '@', '#', '$', encode them (e.g. @ -> %40).`);
      console.error(`-------------------------------------------------------------------\n`);
    } else {
      console.warn(`Standard MongoDB connection failed (${error.message}). Starting MongoDB Memory Server fallback...`);
    }

    // Only fallback to Memory Server if explicitly allowed or local connection
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`⚠️  MongoDB Memory Server Fallback Connected: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`MongoDB Memory Server fallback failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
