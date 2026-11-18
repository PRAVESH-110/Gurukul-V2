const { ChatOpenAI } = require('@langchain/openai');
const { parseNLP, executeSearchPlan } = require('./chatNLP.service');

const createChatClient = () =>
  new ChatOpenAI({
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    apiKey: process.env.GEMINI_API_KEY,
    configuration: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
  });

const formatRetrievedContext = (plan, searchResults, user = null) => {
  if (searchResults.accessDenied) {
    if (searchResults.denyReason === 'AUTH_REQUIRED') {
      return `ACCESS DENIED: Authentication required. The user attempted to access restricted data that requires logging in as a ${searchResults.requiredRole}.
INSTRUCTION: Politely inform the user that they must log in to their Gurukul account to access this information.`;
    }
    return `ACCESS DENIED: Role Unauthorized. The user is currently logged in as '${user?.role || 'student'}' but this request requires '${searchResults.requiredRole}' role privileges.
INSTRUCTION: Politely inform the user that only creators/administrators have permission to view student submissions, course revenue, or creator analytics.`;
  }

  const parts = [];

  if (searchResults.courses && searchResults.courses.length > 0) {
    if (plan.intent === 'student_enrollments_query') {
      parts.push("### User's Enrolled Courses from Gurukul Database:");
      searchResults.courses.forEach((c, idx) => {
        parts.push(
          `${idx + 1}. [${c.title}](/courses/${c._id})` +
            `\n   - Progress: ${c.progress || 0}% complete` +
            `\n   - Level: ${c.level || 'all levels'} | Category: ${c.category || 'General'}`,
        );
      });
    } else if (plan.intent === 'creator_management_query') {
      parts.push("### Creator's Authored Courses & Overview from Gurukul Database:");
      searchResults.courses.forEach((c, idx) => {
        const statusStr = c.isPublished ? 'Published' : 'Draft / Unpublished';
        parts.push(
          `${idx + 1}. [${c.title}](/manage-courses)` +
            `\n   - Status: ${statusStr} | Enrolled Students: ${c.enrollmentCount || 0}` +
            `\n   - Price: $${c.price || 0} | Level: ${c.level || 'all levels'}`,
        );
      });
    } else {
      parts.push('### Retrieved Courses from Gurukul Database:');
      searchResults.courses.forEach((c, idx) => {
        const creatorName = c.creator
          ? `${c.creator.firstName || ''} ${c.creator.lastName || ''}`.trim()
          : 'Instructor';
        const priceStr = c.isFree || c.price === 0 ? 'Free' : `$${c.price}`;
        parts.push(
          `${idx + 1}. [${c.title}](/courses/${c._id})` +
            `\n   - Price: ${priceStr} | Level: ${c.level || 'all levels'} | Category: ${c.category || 'General'}` +
            `\n   - Instructor: ${creatorName}` +
            (c.subtitle ? `\n   - Subtitle: ${c.subtitle}` : '') +
            (c.description ? `\n   - Description: ${c.description.slice(0, 160)}...` : ''),
        );
      });
    }
  } else if (plan.intent === 'search_courses' || plan.intent === 'search_both') {
    parts.push('### Database Query Result: No courses found matching the search criteria.');
  } else if (plan.intent === 'student_enrollments_query') {
    parts.push('### Database Query Result: The user is not currently enrolled in any courses.');
  }

  if (searchResults.communities && searchResults.communities.length > 0) {
    parts.push('\n### Retrieved Communities from Gurukul Database:');
    searchResults.communities.forEach((cm, idx) => {
      parts.push(
        `${idx + 1}. [${cm.name}](/communities/${cm._id})` +
          `\n   - Members: ${cm.memberCount || 0} | Type: ${cm.type || 'public'}` +
          (cm.description ? `\n   - Description: ${cm.description.slice(0, 160)}...` : ''),
      );
    });
  } else if (plan.intent === 'search_communities' || plan.intent === 'search_both') {
    parts.push('### Database Query Result: No communities found matching the search criteria.');
  }

  return parts.join('\n');
};

const getAssistantReply = async (messages, user = null) => {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUserMsg ? lastUserMsg.content : '';

  // Stage 1 & 2 & 3: Deterministic NLP parsing + Role Guard + MongoDB Execution
  const plan = parseNLP(userText, user);
  let searchResults = { courses: [], communities: [] };

  if (plan.accessDenied) {
    searchResults = {
      courses: [],
      communities: [],
      plan,
      accessDenied: true,
      denyReason: plan.denyReason,
      requiredRole: plan.requiredRole,
    };
  } else if (plan.intent !== 'platform_qa') {
    searchResults = await executeSearchPlan(plan, user);
  }

  const retrievedContext = formatRetrievedContext(plan, searchResults, user);

  const systemPromptContent = `You are the official AI Assistant for Gurukul, an online learning and community platform.
Current User Status: ${user ? `Logged in as '${user.firstName || 'User'}' (Role: ${user.role})` : 'Guest / Visitor (Unauthenticated)'}

CONTEXT FROM GURUKUL DATABASE:
${retrievedContext || 'No database search was needed for this general query.'}

INSTRUCTIONS:
1. Always ground your answers about courses and communities strictly in the retrieved database records above.
2. If ACCESS DENIED is indicated in the context, follow its instruction directly and explain politely what role or login is needed. Never fabricate private data.
3. Whenever you recommend a course or community, format it with a Markdown link:
   - Courses: [Course Title](/courses/<id>)
   - Communities: [Community Name](/communities/<id>)
4. Include relevant course details like price, level, and instructor when recommending them.
5. If no courses or communities were found matching the user's specific request, be honest. Say that no courses/communities currently match those criteria, and invite the user to browse all courses at [Course Catalog](/courses) or suggest alternative keywords.
6. For general questions about Gurukul, explain clearly:
   - What Gurukul is: An interactive education and community platform where learners take courses and join peer communities, and creators build and monetize content.
   - For creators: They can create courses, upload video modules, build private or public communities, and host events.
   - For learners: They can browse courses, track progress, join community discussion forums, and attend live events.
7. Keep replies concise, helpful, and formatted with clean Markdown bullet points. Avoid robotic repetition.`;

  const systemPrompt = {
    role: 'system',
    content: systemPromptContent,
  };

  let replyText;
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      '[ChatService] GEMINI_API_KEY is not configured in environment variables. Falling back to deterministic context.',
    );
    if (retrievedContext && retrievedContext.trim()) {
      replyText = `Here is what I found in Gurukul:\n\n${retrievedContext}`;
    } else {
      replyText =
        'Welcome to Gurukul! You can explore courses in our [Course Catalog](/courses), join groups in [Communities](/communities), or start creating your own content as an instructor.\n\nHow can I help you today?';
    }
  } else {
    try {
      const response = await createChatClient().invoke([systemPrompt, ...messages]);
      replyText = response.content;
    } catch (aiError) {
      console.error('[ChatService] Gemini invoke failed:', aiError.message);
      if (retrievedContext && retrievedContext.trim()) {
        replyText = `Here is what I found in our database:\n\n${retrievedContext}`;
      } else {
        replyText =
          'Welcome to Gurukul! You can browse our courses at [Course Catalog](/courses) or connect with other learners in [Communities](/communities). What would you like to explore today?';
      }
    }
  }

  return {
    reply: replyText,
    plan,
    sources: {
      courses: (searchResults.courses || []).map((c) => ({
        id: c._id,
        title: c.title,
        price: c.isFree || c.price === 0 ? 'Free' : `$${c.price}`,
        level: c.level,
        category: c.category,
      })),
      communities: (searchResults.communities || []).map((cm) => ({
        id: cm._id,
        name: cm.name,
        memberCount: cm.memberCount,
      })),
    },
  };
};

module.exports = { getAssistantReply };
