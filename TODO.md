# TODO: Fix Admin Communities Logic

## Steps to Complete
- [ ] Edit `backend/routes/communities.js` to change the query in `getAdminCommunities` from filtering by creator to filtering by `isActive: true`, and update the console.log message.
- [ ] Test the `/api/communities/me` endpoint as an admin user to verify it returns all active communities.
