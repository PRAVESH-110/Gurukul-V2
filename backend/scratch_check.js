const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://praveshgurukul_new:IGCBRkejBEw9nSvl@cluster0.uhswgwy.mongodb.net/gurukul-app';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
  
  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses total:`);
  
  for (const c of courses) {
    const id = c._id.toString();
    const isPublished = c.get('isPublished');
    const title = c.get('title');
    
    // Let's test the endpoint for this course
    try {
      const res = await fetch(`http://localhost:5001/api/courses/${id}`);
      const resVideos = await fetch(`http://localhost:5001/api/courses/${id}/videos`);
      console.log(`Course ${id} ("${title}"): isPublished=${isPublished}, status=${res.status}, videosStatus=${resVideos.status}`);
      if (res.status !== 200 || resVideos.status !== 200) {
        const text = await res.text();
        const textV = await resVideos.text();
        console.log(`  Course Error Body: ${text}`);
        console.log(`  Videos Error Body: ${textV}`);
      }
    } catch (err) {
      console.log(`Failed to fetch for ${id}:`, err.message);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
