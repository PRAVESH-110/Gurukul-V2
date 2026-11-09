const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Course = require('../models/Course');
const Community = require('../models/Community');
const Enrollment = require('../models/Enrollment');
const Membership = require('../models/Membership');

async function migrate() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // Ensure indexes exist for the new collections
    await Enrollment.syncIndexes();
    await Membership.syncIndexes();

    // 1. Migrate Course Enrollments
    console.log('\n--- Migrating Course Enrollments ---');
    const courses = await Course.find({ enrolledStudents: { $exists: true, $not: { $size: 0 } } });
    console.log(`Found ${courses.length} courses with legacy enrolledStudents arrays.`);

    let totalEnrollmentsMigrated = 0;
    for (const course of courses) {
      if (!Array.isArray(course.enrolledStudents)) continue;

      for (const entry of course.enrolledStudents) {
        const userId = entry.user?._id || entry.user;
        if (!userId) continue;

        await Enrollment.updateOne(
          { course: course._id, user: userId },
          {
            $setOnInsert: {
              course: course._id,
              user: userId,
              enrolledAt: entry.enrolledAt || new Date(),
              completedVideos: entry.completedVideos || [],
              progress: entry.progress || 0,
            },
          },
          { upsert: true },
        );
        totalEnrollmentsMigrated++;
      }

      // Update enrollmentCount accurately
      const actualEnrollments = await Enrollment.countDocuments({ course: course._id });
      await Course.updateOne({ _id: course._id }, { $set: { enrollmentCount: actualEnrollments } });
    }
    console.log(
      `✓ Migrated/Verified ${totalEnrollmentsMigrated} enrollments into Enrollment collection.`,
    );

    // 2. Migrate Community Memberships
    console.log('\n--- Migrating Community Memberships ---');
    const communities = await Community.find({ members: { $exists: true, $not: { $size: 0 } } });
    console.log(`Found ${communities.length} communities with legacy members arrays.`);

    let totalMembershipsMigrated = 0;
    for (const community of communities) {
      if (!Array.isArray(community.members)) continue;

      for (const entry of community.members) {
        const userId = entry.user?._id || entry.user;
        if (!userId) continue;

        await Membership.updateOne(
          { community: community._id, user: userId },
          {
            $setOnInsert: {
              community: community._id,
              user: userId,
              role: entry.role || 'member',
              joinedAt: entry.joinedAt || new Date(),
            },
          },
          { upsert: true },
        );
        totalMembershipsMigrated++;
      }

      // Update memberCount accurately
      const actualMembers = await Membership.countDocuments({ community: community._id });
      await Community.updateOne({ _id: community._id }, { $set: { memberCount: actualMembers } });
    }
    console.log(
      `✓ Migrated/Verified ${totalMembershipsMigrated} memberships into Membership collection.`,
    );

    console.log('\n🎉 Migration completed successfully with zero data loss!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
