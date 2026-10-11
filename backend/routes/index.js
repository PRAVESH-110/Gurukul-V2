const express = require('express');

const router = express.Router();

const routeModules = [
  ['/auth', require('./auth')],
  ['/users', require('./users')],
  ['/courses', require('./courses')],
  ['/courses', require('./userCourses')],
  ['/videos', require('./videos')],
  ['/communities', require('./communities')],
  ['/communities', require('./userCommunities')],
  ['/events', require('./events')],
  ['/dashboard', require('./dashboard')],
  ['/upload', require('./upload')],
  ['/search', require('./search')],
  ['/notifications', require('./notifications')],
  ['/posts', require('./posts')],
  // Community post endpoints share the posts router and must be mounted last.
  ['/', require('./posts')],
  ['/communities/:communityId/events', require('./events')],
  ['/chat', require('./chat')]
];

for (const [path, route] of routeModules) {
  router.use(path, route);
}

module.exports = router;
