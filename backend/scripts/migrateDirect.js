const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { uploadToImageKit } = require('../utils/imagekit');

async function directUpdate() {
  const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName: 'gurukul-app' });
  const db = conn.connection.db;

  const courses = await db.collection('courses').find({}).toArray();
  console.log('Total courses in gurukul-app:', courses.length);

  for (const course of courses) {
    if (course.thumbnail && course.thumbnail.startsWith('/uploads/')) {
      const localFilePath = path.join(__dirname, '..', course.thumbnail);
      if (fs.existsSync(localFilePath)) {
        console.log('Uploading local file for course: ' + course.title);
        try {
          const res = await uploadToImageKit({
            file: localFilePath,
            fileName: path.basename(localFilePath),
            folder: 'gurukul/courses',
          });
          const updateObj = { $set: { thumbnail: res.url } };
          await db.collection('courses').updateOne({ _id: course._id }, updateObj);
          console.log('Successfully updated in DB -> ' + res.url);
        } catch (err) {
          console.error('Error uploading:', err.message);
        }
      } else {
        console.log('Local file not found:', localFilePath);
      }
    }
  }

  const communities = await db.collection('communities').find({}).toArray();
  for (const community of communities) {
    if (community.coverImage && community.coverImage.startsWith('/uploads/')) {
      const localFilePath = path.join(__dirname, '..', community.coverImage);
      if (fs.existsSync(localFilePath)) {
        console.log('Uploading local file for community: ' + community.name);
        try {
          const res = await uploadToImageKit({
            file: localFilePath,
            fileName: path.basename(localFilePath),
            folder: 'gurukul/communities',
          });
          const updateObj = { $set: { coverImage: res.url } };
          await db.collection('communities').updateOne({ _id: community._id }, updateObj);
          console.log('Successfully updated in DB -> ' + res.url);
        } catch (err) {
          console.error('Error uploading:', err.message);
        }
      } else {
        console.log('Local file not found:', localFilePath);
      }
    }
  }

  console.log('Direct update complete!');
  process.exit(0);
}

directUpdate().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
