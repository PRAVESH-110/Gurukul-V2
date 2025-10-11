/**
 * Script to fix image paths in the database
 * Changes /uploads/image-XXX.ext to /uploads/image/image-XXX.ext
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const Community = require('../models/Community');

async function fixImagePaths() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Fix Course thumbnails
    const courses = await Course.find({
      thumbnail: { $regex: /^\/uploads\/image-/ }
    });
    
    console.log(`📚 Found ${courses.length} courses with old thumbnail paths`);
    
    for (const course of courses) {
      const oldPath = course.thumbnail;
      // Extract filename and add subdirectory
      const filename = oldPath.replace('/uploads/', '');
      const newPath = `/uploads/image/${filename}`;
      
      course.thumbnail = newPath;
      await course.save();
      
      console.log(`  ✓ Updated course "${course.title}": ${oldPath} → ${newPath}`);
    }
    
    // Fix Community cover images
    const communities = await Community.find({
      coverImage: { $regex: /^\/uploads\/image-/ }
    });
    
    console.log(`\n🏘️  Found ${communities.length} communities with old cover image paths`);
    
    for (const community of communities) {
      const oldPath = community.coverImage;
      const filename = oldPath.replace('/uploads/', '');
      const newPath = `/uploads/image/${filename}`;
      
      community.coverImage = newPath;
      await community.save();
      
      console.log(`  ✓ Updated community "${community.name}": ${oldPath} → ${newPath}`);
    }
    
    console.log('\n✅ All image paths fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixImagePaths();
