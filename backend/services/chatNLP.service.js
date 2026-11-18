const Course = require('../models/Course');
const Community = require('../models/Community');
const Enrollment = require('../models/Enrollment');
require('../models/User');

// Canonical categories and aliases recognized across the platform
const CATEGORY_MAP = {
  programming: 'Programming',
  coding: 'Programming',
  development: 'Programming',
  developer: 'Programming',
  software: 'Programming',
  'web dev': 'Programming',
  'web development': 'Programming',
  frontend: 'Programming',
  backend: 'Programming',
  fullstack: 'Programming',
  javascript: 'Programming',
  js: 'Programming',
  typescript: 'Programming',
  ts: 'Programming',
  react: 'Programming',
  node: 'Programming',
  'data science': 'Data Science',
  data: 'Data Science',
  ai: 'Data Science',
  'machine learning': 'Data Science',
  ml: 'Data Science',
  'deep learning': 'Data Science',
  python: 'Data Science',
  blockchain: 'Data Science',
  design: 'Design',
  ui: 'Design',
  ux: 'Design',
  'ui/ux': 'Design',
  figma: 'Design',
  graphic: 'Design',
  business: 'Business',
  startup: 'Business',
  finance: 'Business',
  management: 'Business',
  marketing: 'Marketing',
  seo: 'Marketing',
  'social media': 'Marketing',
  photography: 'Photography',
  photo: 'Photography',
  video: 'Photography',
  music: 'Music',
  audio: 'Music',
  language: 'Language',
  english: 'Language',
  spanish: 'Language',
  cooking: 'Cooking',
  cook: 'Cooking',
  baking: 'Cooking',
  food: 'Cooking',
  fitness: 'Health & Fitness',
  health: 'Health & Fitness',
  gym: 'Health & Fitness',
  workout: 'Health & Fitness',
  discipline: 'Health & Fitness',
};

// Conversational and functional stopwords to strip from text keyword searches
const STOPWORDS = new Set([
  'a',
  'about',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'can',
  'could',
  'do',
  'does',
  'find',
  'for',
  'from',
  'get',
  'give',
  'have',
  'hello',
  'help',
  'hey',
  'hi',
  'how',
  'i',
  'in',
  'is',
  'it',
  'know',
  'like',
  'look',
  'looking',
  'me',
  'need',
  'of',
  'on',
  'or',
  'please',
  'search',
  'show',
  'some',
  'suggest',
  'tell',
  'the',
  'there',
  'to',
  'want',
  'what',
  'which',
  'who',
  'with',
  'would',
  'you',
  'course',
  'courses',
  'community',
  'communities',
  'class',
  'classes',
  'tutorial',
  'tutorials',
  'group',
  'groups',
  'under',
  'below',
  'above',
  'over',
  'free',
  'paid',
  'dollar',
  'dollars',
  'bucks',
  'price',
  'cost',
  'beginner',
  'beginners',
  'intermediate',
  'advanced',
  'starter',
  'novice',
  'expert',
]);

/**
 * Stage 1: Deterministic NLP Processing & Role Guard Verification
 * Rule-based, fast, and 100% deterministic (0 LLM overhead).
 */
const parseNLP = (text, user = null) => {
  if (!text || typeof text !== 'string') {
    return {
      intent: 'platform_qa',
      entities: {},
      rawQuery: '',
      accessDenied: false,
    };
  }

  const normalized = text.toLowerCase().trim();

  // Role-guarded intent triggers
  const isCreatorQuery =
    /\b(students who haven|student submissions|my students|who enrolled in my|my revenue|my earnings|my draft courses|courses i created|manage my courses)\b/i.test(
      normalized,
    );

  const isStudentEnrolledQuery =
    /\b(my enrolled courses|courses i am taking|courses i enrolled in|what courses am i taking|my course progress)\b/i.test(
      normalized,
    );

  // Platform onboarding questions
  const isPlatformQuestion =
    /\b(what is gurukul|how does gurukul work|become a creator|start as a creator|how to create|how to upload|how can i upload|who are you|what can you do|platform features|terms|rules|guidelines)\b/i.test(
      normalized,
    );

  const courseKeywords = [
    'course',
    'courses',
    'learn',
    'study',
    'class',
    'classes',
    'tutorial',
    'tutorials',
    'lesson',
    'lessons',
    'teach',
  ];
  const communityKeywords = [
    'community',
    'communities',
    'group',
    'groups',
    'club',
    'clubs',
    'forum',
    'forums',
    'discuss',
    'network',
  ];

  const hasCourseIntent = courseKeywords.some((w) =>
    new RegExp(`\\b${w}\\b`, 'i').test(normalized),
  );
  const hasCommunityIntent = communityKeywords.some((w) =>
    new RegExp(`\\b${w}\\b`, 'i').test(normalized),
  );

  let intent = 'platform_qa';
  let accessDenied = false;
  let denyReason = null;
  let requiredRole = null;

  if (isCreatorQuery) {
    intent = 'creator_management_query';
    if (!user) {
      accessDenied = true;
      denyReason = 'AUTH_REQUIRED';
      requiredRole = 'creator';
    } else if (user.role !== 'creator' && user.role !== 'admin') {
      accessDenied = true;
      denyReason = 'ROLE_UNAUTHORIZED';
      requiredRole = 'creator';
    }
  } else if (isStudentEnrolledQuery) {
    intent = 'student_enrollments_query';
    if (!user) {
      accessDenied = true;
      denyReason = 'AUTH_REQUIRED';
      requiredRole = 'student';
    }
  } else if (isPlatformQuestion) {
    intent = 'platform_qa';
  } else if (hasCourseIntent && hasCommunityIntent) {
    intent = 'search_both';
  } else if (hasCourseIntent) {
    intent = 'search_courses';
  } else if (hasCommunityIntent) {
    intent = 'search_communities';
  }

  // Entities container
  const entities = {
    keywords: [],
    category: null,
    level: null,
    isFree: null,
    maxPrice: null,
    minPrice: null,
  };

  // 1. Level extraction (beginner, intermediate, advanced)
  if (/\b(beginner|beginners|introductory|starter|novice|basic|basics)\b/i.test(normalized)) {
    entities.level = 'beginner';
    if (intent === 'platform_qa') intent = 'search_courses';
  } else if (/\b(intermediate|medium)\b/i.test(normalized)) {
    entities.level = 'intermediate';
    if (intent === 'platform_qa') intent = 'search_courses';
  } else if (/\b(advanced|expert|mastery|pro)\b/i.test(normalized)) {
    entities.level = 'advanced';
    if (intent === 'platform_qa') intent = 'search_courses';
  }

  // 2. Price extraction
  if (/\b(free|no cost|zero cost|without paying|gratis)\b/i.test(normalized)) {
    entities.isFree = true;
    entities.maxPrice = 0;
    if (intent === 'platform_qa') intent = 'search_courses';
  } else if (/\b(paid|premium)\b/i.test(normalized)) {
    entities.isFree = false;
    if (intent === 'platform_qa') intent = 'search_courses';
  }

  // Max price regex
  const maxPriceMatch = normalized.match(
    /(?:under|below|less than|max|up to|<|<=)\s*\$?(\d+(?:\.\d{1,2})?)/i,
  );
  if (maxPriceMatch && maxPriceMatch[1]) {
    const val = parseFloat(maxPriceMatch[1]);
    if (!isNaN(val) && val >= 0) {
      entities.maxPrice = val;
      if (intent === 'platform_qa') intent = 'search_courses';
    }
  }

  // Min price regex
  const minPriceMatch = normalized.match(
    /(?:above|more than|at least|over|>|>=)\s*\$?(\d+(?:\.\d{1,2})?)/i,
  );
  if (minPriceMatch && minPriceMatch[1]) {
    const val = parseFloat(minPriceMatch[1]);
    if (!isNaN(val) && val >= 0) {
      entities.minPrice = val;
      if (intent === 'platform_qa') intent = 'search_courses';
    }
  }

  // 3. Category extraction
  for (const [key, canonicalCategory] of Object.entries(CATEGORY_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(normalized)) {
      entities.category = canonicalCategory;
      if (intent === 'platform_qa') intent = 'search_courses';
      break;
    }
  }

  // 4. Salient keyword extraction
  const tokens = normalized
    .replace(/[^\w\s$]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 1);

  const keywords = tokens.filter((token) => {
    if (STOPWORDS.has(token)) return false;
    if (/^\$?\d+$/.test(token)) return false;
    return true;
  });

  entities.keywords = Array.from(new Set(keywords));

  if (
    !isPlatformQuestion &&
    !isCreatorQuery &&
    !isStudentEnrolledQuery &&
    intent === 'platform_qa' &&
    (entities.keywords.length > 0 || entities.category)
  ) {
    intent = 'search_courses';
  }

  return {
    intent,
    entities,
    rawQuery: text,
    accessDenied,
    denyReason,
    requiredRole,
    userId: user?._id || null,
    userRole: user?.role || 'guest',
  };
};

/**
 * Stage 2: Query Builder (Maps NLP representation to safe, sanitized MongoDB query objects)
 */
const buildMongoQuery = (plan, user = null) => {
  const { intent, entities, accessDenied } = plan;
  const queries = {
    courseQuery: null,
    communityQuery: null,
    enrollmentQuery: null,
  };

  // If access was denied by role guard, produce zero queries
  if (accessDenied) {
    return queries;
  }

  // Creator management: scope strictly to courses created by this user
  if (intent === 'creator_management_query' && user) {
    queries.courseQuery = { creator: user._id };
    return queries;
  }

  // Student enrollments: scope strictly to user's enrollments
  if (intent === 'student_enrollments_query' && user) {
    queries.enrollmentQuery = { user: user._id };
    return queries;
  }

  // Public course query
  if (intent === 'search_courses' || intent === 'search_both') {
    const courseQuery = { isPublished: true };

    if (entities.level) {
      courseQuery.level = entities.level;
    }

    if (entities.isFree === true) {
      courseQuery.isFree = true;
    } else if (entities.isFree === false) {
      courseQuery.isFree = false;
    }

    if (entities.maxPrice !== null) {
      if (entities.maxPrice === 0) {
        courseQuery.isFree = true;
      } else {
        courseQuery.$or = [{ isFree: true }, { price: { $lte: entities.maxPrice } }];
      }
    }

    if (entities.minPrice !== null) {
      courseQuery.price = { ...(courseQuery.price || {}), $gte: entities.minPrice };
    }

    // Keyword & category matching
    const orConditions = [];

    if (entities.keywords && entities.keywords.length > 0) {
      entities.keywords.forEach((kw) => {
        orConditions.push({ title: { $regex: kw, $options: 'i' } });
        orConditions.push({ subtitle: { $regex: kw, $options: 'i' } });
        orConditions.push({ description: { $regex: kw, $options: 'i' } });
        orConditions.push({ tags: { $regex: kw, $options: 'i' } });
        orConditions.push({ category: { $regex: kw, $options: 'i' } });
      });
    }

    if (entities.category && (!entities.keywords || entities.keywords.length === 0)) {
      courseQuery.category = new RegExp(entities.category, 'i');
    }

    if (orConditions.length > 0) {
      if (courseQuery.$or) {
        courseQuery.$and = [{ $or: courseQuery.$or }, { $or: orConditions }];
        delete courseQuery.$or;
      } else {
        courseQuery.$or = orConditions;
      }
    }

    queries.courseQuery = courseQuery;
  }

  // Public community query
  if (intent === 'search_communities' || intent === 'search_both') {
    const communityQuery = { isActive: true, type: 'public' };

    const orConditions = [];

    if (entities.keywords && entities.keywords.length > 0) {
      entities.keywords.forEach((kw) => {
        orConditions.push({ name: { $regex: kw, $options: 'i' } });
        orConditions.push({ description: { $regex: kw, $options: 'i' } });
        orConditions.push({ tags: { $regex: kw, $options: 'i' } });
        orConditions.push({ category: { $regex: kw, $options: 'i' } });
      });
    }

    if (entities.category && (!entities.keywords || entities.keywords.length === 0)) {
      communityQuery.category = new RegExp(entities.category, 'i');
    }

    if (orConditions.length > 0) {
      communityQuery.$or = orConditions;
    }

    queries.communityQuery = communityQuery;
  }

  return queries;
};

/**
 * Stage 3: Database Execution (Executes predefined queries safely with role guard isolation)
 */
const executeSearchPlan = async (plan, user = null) => {
  if (plan.accessDenied) {
    return {
      courses: [],
      communities: [],
      plan,
      accessDenied: true,
      denyReason: plan.denyReason,
      requiredRole: plan.requiredRole,
    };
  }

  const { courseQuery, communityQuery, enrollmentQuery } = buildMongoQuery(plan, user);
  const results = {
    courses: [],
    communities: [],
    enrollments: [],
    plan,
    accessDenied: false,
  };

  try {
    if (enrollmentQuery) {
      const enrollments = await Enrollment.find(enrollmentQuery)
        .populate('course', 'title price level category thumbnail')
        .sort({ enrolledAt: -1 })
        .limit(5)
        .lean();

      results.enrollments = enrollments.filter((e) => e.course);
      results.courses = results.enrollments.map((e) => ({
        ...e.course,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
      }));
    } else if (courseQuery) {
      results.courses = await Course.find(courseQuery)
        .select(
          'title subtitle description price isFree level category rating enrollmentCount thumbnail creator isPublished',
        )
        .populate('creator', 'firstName lastName')
        .sort({ enrollmentCount: -1, 'rating.average': -1, createdAt: -1 })
        .limit(4)
        .lean();

      // If public search was specific and returned 0, try relaxing to title match
      if (
        results.courses.length === 0 &&
        plan.intent !== 'creator_management_query' &&
        (plan.entities.keywords?.length > 0 || plan.entities.category)
      ) {
        const relaxedKeywords = plan.entities.keywords || [];
        if (relaxedKeywords.length > 0) {
          results.courses = await Course.find({
            isPublished: true,
            $or: relaxedKeywords.map((kw) => ({ title: { $regex: kw, $options: 'i' } })),
          })
            .select(
              'title subtitle description price isFree level category rating enrollmentCount thumbnail creator',
            )
            .populate('creator', 'firstName lastName')
            .limit(3)
            .lean();
        }
      }
    }

    if (communityQuery) {
      results.communities = await Community.find(communityQuery)
        .select('name description type memberCount category avatar creator')
        .populate('creator', 'firstName lastName')
        .sort({ memberCount: -1, createdAt: -1 })
        .limit(3)
        .lean();
    }
  } catch (err) {
    console.error('Error executing chat search plan:', err);
  }

  return results;
};

module.exports = {
  CATEGORY_MAP,
  STOPWORDS,
  parseNLP,
  buildMongoQuery,
  executeSearchPlan,
};
