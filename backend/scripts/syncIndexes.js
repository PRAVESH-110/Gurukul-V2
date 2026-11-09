const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Community = require('../models/Community');
const Video = require('../models/Video');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const RefreshToken = require('../models/RefreshToken');

async function syncAllIndexes() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');

    const models = [
      { name: 'User', model: User },
      { name: 'Course', model: Course },
      { name: 'Community', model: Community },
      { name: 'Video', model: Video },
      { name: 'Post', model: Post },
      { name: 'Notification', model: Notification },
      { name: 'Event', model: Event },
      { name: 'RefreshToken', model: RefreshToken },
    ];

    for (const { name, model } of models) {
      console.log(`Syncing indexes for ${name}...`);
      await model.syncIndexes();
      const indexes = await model.collection.getIndexes();
      console.log(`  ✓ ${name} indexes:`, Object.keys(indexes).join(', '));
    }

    console.log('🎉 All indexes synchronized successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error syncing indexes:', err);
    process.exit(1);
  }
}

syncAllIndexes();
