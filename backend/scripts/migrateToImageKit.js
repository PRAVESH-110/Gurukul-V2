const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.join(__dirname, '.env') });
const { uploadToImageKit } = require('../utils/imagekit');

const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
const Community = mongoose.model('Community', new mongoose.Schema({}, { strict: false }));

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const backendDir = path.join(__dirname, '..');
  const courses = await Course.find({});
  for (const course of courses) {
    if (course.thumbnail && course.thumbnail.startsWith('/uploads/')) {
      const localFilePath = path.join(backendDir, course.thumbnail);
      console.log(`Checking course: "${course.title}" with thumbnail ${course.thumbnail}`);
      if (fs.existsSync(localFilePath)) {
        console.log(`Uploading ${localFilePath} to ImageKit...`);
        try {
          const res = await uploadToImageKit({
            file: localFilePath,
            fileName: path.basename(localFilePath),
            folder: 'gurukul/courses'
          });
          course.thumbnail = res.url;
          await course.save();
          console.log(`Updated course "${course.title}" thumbnail to: ${res.url}`);
        } catch (e) {
          console.error(`Failed to migrate course "${course.title}":`, e.message);
        }
      } else {
        console.warn(`Local file does not exist: ${localFilePath}`);
      }
    }
  }

  const communities = await Community.find({});
  for (const community of communities) {
    if (community.coverImage && community.coverImage.startsWith('/uploads/')) {
      const localFilePath = path.join(backendDir, community.coverImage);
      console.log(`Checking community: "${community.name}" with coverImage ${community.coverImage}`);
      if (fs.existsSync(localFilePath)) {
        console.log(`Uploading ${localFilePath} to ImageKit...`);
        try {
          const res = await uploadToImageKit({
            file: localFilePath,
            fileName: path.basename(localFilePath),
            folder: 'gurukul/communities'
          });
          community.coverImage = res.url;
          await community.save();
          console.log(`Updated community "${community.name}" coverImage to: ${res.url}`);
        } catch (e) {
          console.error(`Failed to migrate community "${community.name}":`, e.message);
        }
      } else {
        console.warn(`Local file does not exist: ${localFilePath}`);
      }
    }
  }

  console.log('Migration finished!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
