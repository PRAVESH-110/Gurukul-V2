/**
 * Production Database Seeder for Gurukul Platform
 * Populates MongoDB Atlas with realistic, high-quality mock data:
 * - Production-ready courses across major categories with valid Unsplash CDN thumbnails
 * - Active communities with banners, avatars, and member counts
 * - Interactive community posts & discussion threads
 * - Upcoming live events (shows on Dashboard)
 * - Student course enrollments with realistic progress percentages
 *
 * Usage:
 *   node backend/scripts/seed.js
 *   node backend/scripts/seed.js --clean (removes old test courses & communities first, keeps user accounts)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Community = require('../models/Community');
const Enrollment = require('../models/Enrollment');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const Post = require('../models/Post');

const COURSES_DATA = [
  {
    title: 'Full-Stack Next.js 15 & Node.js Production Architecture',
    subtitle: 'Master React Server Components, Server Actions, MongoDB, and Tailwind CSS',
    description:
      'Become a full-stack engineering powerhouse. This course walks you through building production-grade web applications with Next.js 15 App Router, React 19 features, resilient API designs in Node.js, and MongoDB aggregation pipelines.\n\n### What You Will Build\n- Enterprise multi-tenant SaaS architectures\n- Authenticated microservices with JWT & refresh token rotation\n- High-performance UI interfaces using Tailwind CSS and Radix UI primitives',
    category: 'Programming',
    subcategory: 'Web Development',
    level: 'intermediate',
    price: 49,
    isFree: false,
    duration: 720,
    thumbnail:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Fullstack', 'JavaScript'],
    rating: { average: 4.9, count: 128 },
    enrollmentCount: 412,
    requirements: [
      'Basic knowledge of JavaScript (ES6+)',
      'Familiarity with React fundamentals',
      'Computer with Node.js 18+ installed',
    ],
    learningOutcomes: [
      'Architect large-scale Next.js 15 applications with the App Router',
      'Implement secure authentication, CSRF defense, and rate limiting',
      'Design clean Mongoose schemas and high-speed aggregation queries',
      'Deploy full-stack apps to cloud platforms with CI/CD',
    ],
    sections: [
      {
        title: 'Module 1: Foundations of Next.js 15 & Modern React',
        description: 'Server vs. Client Components, streaming SSR, and suspense architecture.',
        order: 1,
      },
      {
        title: 'Module 2: Resilient Backend APIs & MongoDB Modeling',
        description: 'Mongoose schemas, indexing strategies, and database connection pooling.',
        order: 2,
      },
      {
        title: 'Module 3: Authentication, Authorization & Production Deployment',
        description: 'JWT rotation, role-based guards, and cloud hosting.',
        order: 3,
      },
    ],
  },
  {
    title: 'Complete Python 2026 Bootcamp: From Zero to Hero',
    subtitle: 'Learn Python like a professional. Start from basics and build 15 real projects.',
    description:
      'The most comprehensive and beginner-friendly Python course on Gurukul. Master object-oriented programming, data structures, automation scripts, web scraping, and API development with FastAPI.\n\nIncludes 100+ coding exercises, real-world case studies, and lifetime project source code.',
    category: 'Programming',
    subcategory: 'Python',
    level: 'beginner',
    price: 0,
    isFree: true,
    duration: 900,
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
    tags: ['Python', 'Beginner', 'FastAPI', 'Automation', 'Coding'],
    rating: { average: 4.8, count: 340 },
    enrollmentCount: 1240,
    requirements: [
      'No prior programming experience required',
      'Any Mac, Windows, or Linux computer',
    ],
    learningOutcomes: [
      'Write clean, readable, idiomatic Python 3 code',
      'Build desktop automation scripts and web scrapers',
      'Develop modular applications with Object-Oriented Programming (OOP)',
      'Create high-speed REST APIs using FastAPI and Pydantic',
    ],
    sections: [
      {
        title: 'Module 1: Python Core Fundamentals',
        description: 'Variables, loops, functions, lists, and dictionaries.',
        order: 1,
      },
      {
        title: 'Module 2: Object-Oriented Python & Error Handling',
        description: 'Classes, inheritance, exceptions, and unit testing.',
        order: 2,
      },
      {
        title: 'Module 3: Automation & Web API Development',
        description: 'FastAPI, requests, BeautifulSoup, and data export.',
        order: 3,
      },
    ],
  },
  {
    title: 'Applied Machine Learning & AI with PyTorch',
    subtitle: 'Build, train, and deploy neural networks, transformers, and LLM assistants',
    description:
      'Dive deep into modern machine learning and generative artificial intelligence. Learn tensor computation, convolutional neural networks, transformer architectures, and fine-tuning open-weights models for custom tasks.',
    category: 'Data Science',
    subcategory: 'Artificial Intelligence',
    level: 'advanced',
    price: 79,
    isFree: false,
    duration: 840,
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    tags: ['Machine Learning', 'AI', 'PyTorch', 'Data Science', 'Deep Learning'],
    rating: { average: 4.95, count: 96 },
    enrollmentCount: 285,
    requirements: [
      'Intermediate Python proficiency',
      'Basic linear algebra and calculus understanding',
    ],
    learningOutcomes: [
      'Train deep neural networks using PyTorch GPU acceleration',
      'Implement attention mechanisms and transformer models',
      'Fine-tune open-weights models for custom domain tasks',
      'Deploy inference APIs with low latency and quantization',
    ],
    sections: [
      {
        title: 'Module 1: Tensors, Autograd & Deep Learning Core',
        description: 'Math foundations, PyTorch tensor mechanics, and backpropagation.',
        order: 1,
      },
      {
        title: 'Module 2: Computer Vision & Convolutional Networks',
        description: 'ResNets, image classification, and transfer learning.',
        order: 2,
      },
      {
        title: 'Module 3: Transformers, Attention & LLM Pipelines',
        description: 'Self-attention, tokenization, and model serving.',
        order: 3,
      },
    ],
  },
  {
    title: 'Data Analysis & Visualization Bootcamp: Pandas, SQL & Tableau',
    subtitle: 'Extract actionable business insights from raw data using modern toolsets',
    description:
      'Transform complex tabular data into crystal-clear dashboards. Master SQL data wrangling, advanced Pandas transformations, exploratory statistical analysis, and interactive visual reporting.',
    category: 'Data Science',
    subcategory: 'Data Analysis',
    level: 'beginner',
    price: 29,
    isFree: false,
    duration: 540,
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tags: ['Data Analysis', 'SQL', 'Pandas', 'Tableau', 'Business Intelligence'],
    rating: { average: 4.75, count: 180 },
    enrollmentCount: 650,
    requirements: [
      'Curiosity about numbers and business problems',
      'Computer with spreadsheet software or Python',
    ],
    learningOutcomes: [
      'Query complex relational databases using PostgreSQL and joins',
      'Clean messy datasets using Pandas and NumPy',
      'Design executive-ready charts and automated analytical pipelines',
    ],
    sections: [
      { title: 'Module 1: SQL Fundamentals & Complex Queries', order: 1 },
      { title: 'Module 2: Python for Data Analysis (Pandas & Seaborn)', order: 2 },
      { title: 'Module 3: Storytelling with Data Dashboards', order: 3 },
    ],
  },
  {
    title: 'UI/UX Design Masterclass: Figma to Production Systems',
    subtitle:
      'Design stunning user interfaces, interactive prototypes, and scalable design systems',
    description:
      'Learn how top product designers build digital products from wireframe to developer handoff. Master auto-layout, component variants, responsive tokens, typography hierarchies, and user research methodologies.',
    category: 'Design',
    subcategory: 'UI/UX Design',
    level: 'beginner',
    price: 39,
    isFree: false,
    duration: 600,
    thumbnail:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Product Design'],
    rating: { average: 4.9, count: 215 },
    enrollmentCount: 890,
    requirements: ['Free Figma account', 'No prior design experience needed'],
    learningOutcomes: [
      'Master Figma Auto Layout, Variables, and Component Sets',
      'Conduct user interviews, journey mapping, and usability testing',
      'Build comprehensive design systems with dark mode support',
      'Hand off clean design specs to front-end developers',
    ],
    sections: [
      { title: 'Module 1: UX Foundations & Information Architecture', order: 1 },
      { title: 'Module 2: Visual Hierarchy, Typography & Figma Power Tools', order: 2 },
      { title: 'Module 3: Micro-Interactions & Production Design Systems', order: 3 },
    ],
  },
  {
    title: 'Modern TypeScript & Clean Code Architecture',
    subtitle: 'Write robust, maintainable, self-documenting code with advanced type patterns',
    description:
      'Take your JavaScript engineering to the next level. Master generics, conditional types, template literal types, domain-driven design, and SOLID principles in real-world codebases.',
    category: 'Programming',
    subcategory: 'TypeScript',
    level: 'advanced',
    price: 35,
    isFree: false,
    duration: 480,
    thumbnail:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    tags: ['TypeScript', 'Clean Code', 'Architecture', 'Software Engineering'],
    rating: { average: 4.88, count: 140 },
    enrollmentCount: 520,
    requirements: ['Strong JavaScript background', 'Experience building web applications'],
    learningOutcomes: [
      'Construct complex types using generics, infer, and mapped types',
      'Refactor brittle codebases into clean, type-safe architectures',
      'Enforce domain invariants with brand types and runtime schemas',
    ],
    sections: [
      { title: 'Module 1: Advanced Type System Mechanics', order: 1 },
      { title: 'Module 2: Design Patterns in Modern TypeScript', order: 2 },
      { title: 'Module 3: Clean Architecture & Error Handling', order: 3 },
    ],
  },
  {
    title: 'Indie Startup Blueprint: From Idea to First $10K MRR',
    subtitle:
      'Actionable playbook for building, launching, and scaling digital SaaS and content businesses',
    description:
      'Learn how to validate ideas without writing code, find early adopters, build scalable pricing tiers, and generate recurring revenue as an indie founder.',
    category: 'Business',
    subcategory: 'Entrepreneurship',
    level: 'beginner',
    price: 45,
    isFree: false,
    duration: 420,
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Business', 'Startup', 'SaaS', 'Marketing', 'Entrepreneurship'],
    rating: { average: 4.85, count: 110 },
    enrollmentCount: 380,
    requirements: ['An entrepreneurial mindset and willingness to take action'],
    learningOutcomes: [
      'Validate customer willingness to pay before writing a line of code',
      'Design sticky customer onboarding and viral loops',
      'Set up Stripe subscription billing and conversion metrics',
    ],
    sections: [
      { title: 'Module 1: Idea Validation & Customer Interviews', order: 1 },
      { title: 'Module 2: Building the MVP & Early Distribution', order: 2 },
      { title: 'Module 3: Monetization, Pricing & Retention', order: 3 },
    ],
  },
  {
    title: 'Cinematic Digital Video Production & Storytelling',
    subtitle: 'Lighting, camera composition, audio capture, and color grading in DaVinci Resolve',
    description:
      'Create breathtaking video content that captivates audiences. Master camera angles, three-point studio lighting, crystal-clear microphone audio, and Hollywood-style color grading.',
    category: 'Photography',
    subcategory: 'Video Production',
    level: 'intermediate',
    price: 39,
    isFree: false,
    duration: 510,
    thumbnail:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    tags: ['Video', 'Cinematography', 'Photography', 'Editing', 'YouTube'],
    rating: { average: 4.92, count: 85 },
    enrollmentCount: 310,
    requirements: ['Any camera or modern smartphone', 'DaVinci Resolve (free software)'],
    learningOutcomes: [
      'Master manual camera settings (ISO, Shutter Angle, Aperture)',
      'Design cinematic lighting setups on any budget',
      'Edit, color grade, and mix professional audio',
    ],
    sections: [
      { title: 'Module 1: Camera Optics & Composition Principles', order: 1 },
      { title: 'Module 2: Studio Lighting & Pro Audio Recording', order: 2 },
      { title: 'Module 3: Post-Production & Color Grading', order: 3 },
    ],
  },
];

const COMMUNITIES_DATA = [
  {
    name: 'Next.js & Full-Stack Developers',
    description:
      'The premier community for developers building fast, modern web applications with Next.js, React, Node.js, and TypeScript. Share your projects, discuss architecture, and get peer feedback.',
    category: 'Programming',
    type: 'public',
    avatar:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=400&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
    memberCount: 342,
  },
  {
    name: 'AI & Data Science Innovators',
    description:
      'Connect with researchers, ML engineers, and data analysts. Discuss LLMs, computer vision, data engineering pipelines, and real-world AI applications.',
    category: 'Data Science',
    type: 'public',
    avatar:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    memberCount: 289,
  },
  {
    name: 'UI/UX Designers & Creators Hub',
    description:
      'A creative space for digital product designers. Share your Figma designs, get constructive design critiques, and discuss design systems and user research.',
    category: 'Design',
    type: 'public',
    avatar:
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=80',
    memberCount: 195,
  },
  {
    name: 'Indie Founders & Solopreneurs',
    description:
      'A mastermind community for indie hackers, bootstrap founders, and creators. We share revenue milestones, discuss growth tactics, and support each other through building profitable products.',
    category: 'Business',
    type: 'public',
    avatar:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    memberCount: 210,
  },
  {
    name: 'Digital Creators & Videographers',
    description:
      'A community of filmmakers, YouTube creators, and digital storytellers. Discuss camera gear, editing workflows, storytelling strategies, and content monetization.',
    category: 'Photography',
    type: 'public',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
    memberCount: 168,
  },
];

async function seedDatabase() {
  const isClean = process.argv.includes('--clean');
  console.log(`Connecting to MongoDB (${process.env.MONGODB_URI ? 'Atlas Cloud' : 'Local'})...`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully.');

  // Helper to ensure a user exists with known password 'password123'
  const ensureUser = async ({ email, firstName, lastName, role }) => {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: 'password123',
        role,
        isActive: true,
        emailVerified: true,
      });
      console.log(`Created user: ${email} (${role})`);
    } else {
      user.password = 'password123';
      user.isActive = true;
      user.emailVerified = true;
      user.role = role;
      await user.save();
      console.log(`Updated user password to 'password123': ${email} (${role})`);
    }
    return user;
  };

  // 1. Create or update primary accounts with known password 'password123'
  console.log('\nSetting up User Accounts (password: password123)...');
  const demoStudent = await ensureUser({
    email: 'student@gurukul.com',
    firstName: 'Demo',
    lastName: 'Student',
    role: 'student',
  });

  const demoCreator = await ensureUser({
    email: 'creator@gurukul.com',
    firstName: 'Demo',
    lastName: 'Creator',
    role: 'creator',
  });

  const _demoAdmin = await ensureUser({
    email: 'admin@gurukul.com',
    firstName: 'Demo',
    lastName: 'Admin',
    role: 'admin',
  });

  // Also update your personal test accounts so they work with 'password123'
  const personalStudent = await ensureUser({
    email: 'pravdhakal110@gmail.com',
    firstName: 'Pravesh',
    lastName: 'Dhakal',
    role: 'student',
  });

  const personalCreator = await ensureUser({
    email: 'pravdhakaltest@gmail.com',
    firstName: 'Peaaal',
    lastName: 'Deal',
    role: 'creator',
  });

  const studentsList = [demoStudent, personalStudent];
  const creator = personalCreator || demoCreator;

  if (isClean) {
    console.log(
      'Cleaning existing courses, communities, events, and posts (--clean flag detected)...',
    );
    await Course.deleteMany({});
    await Community.deleteMany({});
    await Event.deleteMany({});
    await Post.deleteMany({});
    await Enrollment.deleteMany({});
    await Membership.deleteMany({});
    console.log('Previous test records removed.');
  }

  // 1. Seed Communities
  console.log('\nSeeding Communities...');
  const createdCommunities = [];
  for (const cData of COMMUNITIES_DATA) {
    let community = await Community.findOne({ name: cData.name });
    if (!community) {
      community = await Community.create({
        ...cData,
        creator: creator._id,
        isActive: true,
        members: [
          { user: creator._id, role: 'creator', joinedAt: new Date() },
          ...studentsList.map((s) => ({ user: s._id, role: 'member', joinedAt: new Date() })),
        ],
      });
      console.log(`Created Community: ${community.name}`);
    } else {
      console.log(`Community exists: ${community.name}`);
    }

    // Ensure students are members in Membership collection
    for (const s of studentsList) {
      await Membership.findOneAndUpdate(
        { community: community._id, user: s._id },
        { community: community._id, user: s._id, role: 'member' },
        { upsert: true },
      );
    }

    createdCommunities.push(community);
  }

  // 2. Seed Courses
  console.log('\nSeeding Courses...');
  const createdCourses = [];
  for (let i = 0; i < COURSES_DATA.length; i++) {
    const courseData = COURSES_DATA[i];
    const linkedCommunity = createdCommunities[i % createdCommunities.length];

    let course = await Course.findOne({ title: courseData.title });
    if (!course) {
      course = await Course.create({
        ...courseData,
        creator: creator._id,
        community: linkedCommunity?._id || null,
        isPublished: true,
        isApproved: true,
        status: 'published',
        visibility: 'public',
        enrolledStudents: studentsList.map((s) => ({
          user: s._id,
          enrolledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          progress: i === 0 ? 65 : i === 1 ? 30 : 0,
        })),
      });
      console.log(`Created Course: ${course.title} ($${course.price})`);
    } else {
      console.log(`Course exists: ${course.title}`);
    }
    createdCourses.push(course);
  }

  // 3. Seed Enrollments for Students (Powers "Continue Learning" & "My Courses")
  console.log('\nSeeding Student Enrollments...');
  const enrolledSubset = createdCourses.slice(0, 3);
  for (const s of studentsList) {
    for (let i = 0; i < enrolledSubset.length; i++) {
      const c = enrolledSubset[i];
      const progress = i === 0 ? 70 : i === 1 ? 35 : 10;
      await Enrollment.findOneAndUpdate(
        { course: c._id, user: s._id },
        {
          course: c._id,
          user: s._id,
          progress,
          enrolledAt: new Date(Date.now() - (i + 1) * 2 * 24 * 60 * 60 * 1000),
        },
        { upsert: true },
      );
    }
    console.log(`Enrolled ${s.firstName} (${s.email}) in ${enrolledSubset.length} courses.`);
  }

  // 4. Seed Upcoming Community Events (Powers "Upcoming Events" on Dashboard)
  console.log('\nSeeding Upcoming Events...');
  const sampleEvents = [
    {
      title: 'Next.js 15 Server Actions & Caching Workshop',
      description:
        'Live deep-dive on how to optimize server components, cache revalidation, and data mutations in production.',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      community: createdCommunities[0]._id,
      creator: creator._id,
      meetingLink: 'https://meet.google.com/gurukul-nextjs-workshop',
      attendees: studentsList.map((s) => ({ user: s._id, status: 'going' })),
    },
    {
      title: 'UI/UX Portfolio & Prototype Critique Session',
      description:
        'Bring your Figma links! We will review live user flows, micro-interactions, and visual design hierarchies.',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      community: createdCommunities[2]._id,
      creator: creator._id,
      meetingLink: 'https://meet.google.com/gurukul-design-review',
      attendees: studentsList.map((s) => ({ user: s._id, status: 'going' })),
    },
    {
      title: 'Open Source AI & PyTorch Community Hangout',
      description:
        'Informal meetup discussing fine-tuning open-source models, embeddings retrieval, and vector search strategies.',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // In 8 days
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      community: createdCommunities[1]._id,
      creator: creator._id,
      meetingLink: 'https://meet.google.com/gurukul-ai-hangout',
      attendees: studentsList.map((s) => ({ user: s._id, status: 'going' })),
    },
  ];

  for (const ev of sampleEvents) {
    const existing = await Event.findOne({ title: ev.title });
    if (!existing) {
      await Event.create(ev);
      console.log(`Created Event: ${ev.title}`);
    }
  }

  // 5. Seed Community Posts
  console.log('\nSeeding Community Discussion Posts...');
  const samplePosts = [
    {
      title: 'Welcome to the Next.js & Full-Stack Developers Community!',
      content:
        'Excited to kick off this community! Feel free to introduce yourself below: what are you currently building, and what tech stack are you most excited about in 2026?',
      community: createdCommunities[0]._id,
      author: creator._id,
      likes: studentsList.map((s) => s._id),
      comments: [
        {
          author: demoStudent._id,
          content:
            'Hey everyone! Excited to be here. Currently building a full-stack platform with Next.js 15.',
        },
      ],
    },
    {
      title: 'Best practices for organizing Figma design tokens in 2026',
      content:
        'When building a multi-brand design system, how do you handle light/dark mode variables and semantic tokens? Here is the structure we use at Gurukul: \n1. Primitive color tokens\n2. Semantic surface & content tokens\n3. Component-specific overrides.',
      community: createdCommunities[2]._id,
      author: creator._id,
      likes: studentsList.map((s) => s._id),
    },
  ];

  for (const post of samplePosts) {
    const existing = await Post.findOne({ title: post.title });
    if (!existing) {
      await Post.create(post);
      console.log(`Created Post: ${post.title}`);
    }
  }

  console.log('\n======================================================');
  console.log(' SEEDING COMPLETED SUCCESSFULLY ON MONGODB ATLAS!');
  console.log('======================================================');
  console.log(' You can immediately sign in with any of these credentials:');
  console.log('');
  console.log(' 🎓 STUDENT ACCOUNTS:');
  console.log('    Email:    student@gurukul.com');
  console.log('    Password: password123');
  console.log('    - OR -');
  console.log('    Email:    pravdhakal110@gmail.com');
  console.log('    Password: password123');
  console.log('');
  console.log(' 🎨 CREATOR ACCOUNTS:');
  console.log('    Email:    creator@gurukul.com');
  console.log('    Password: password123');
  console.log('    - OR -');
  console.log('    Email:    pravdhakaltest@gmail.com');
  console.log('    Password: password123');
  console.log('');
  console.log(' 👑 ADMIN ACCOUNT:');
  console.log('    Email:    admin@gurukul.com');
  console.log('    Password: password123');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
