const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

const REFRESH_COOKIE = 'refreshToken';
const CSRF_COOKIE = 'XSRF-TOKEN';
const REFRESH_TTL_DAYS = Number.parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 10) || 30;

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

const createCsrfToken = (refreshToken, nonce) => {
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(`${refreshToken}.${nonce}`)
    .digest('base64url');
  return `${nonce}.${signature}`;
};

const createSession = async (user, familyId = crypto.randomUUID()) => {
  const refreshToken = crypto.randomBytes(64).toString('base64url');
  const csrfNonce = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: user._id,
    familyId,
    tokenHash: hash(refreshToken),
    csrfNonce,
    expiresAt
  });

  const accessToken = jwt.sign({ id: user._id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '1h'
  });

  return {
    accessToken,
    refreshToken,
    csrfToken: createCsrfToken(refreshToken, csrfNonce),
    expiresAt
  };
};

const rotateSession = async (refreshToken) => {
  if (!refreshToken) return null;

  const session = await RefreshToken.findOneAndUpdate({
    tokenHash: hash(refreshToken),
    expiresAt: { $gt: new Date() },
    consumedAt: null
  }, { $set: { consumedAt: new Date() } }, { new: false });
  if (!session) {
    const replayedSession = await RefreshToken.findOne({ tokenHash: hash(refreshToken), consumedAt: { $ne: null } });
    if (replayedSession) await RefreshToken.deleteMany({ familyId: replayedSession.familyId });
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user || !user.isActive || (user.passwordChangedAt && session.createdAt <= user.passwordChangedAt)) {
    await RefreshToken.deleteMany({ familyId: session.familyId });
    return null;
  }

  return { user, ...(await createSession(user, session.familyId)) };
};

const revokeSession = async (refreshToken) => {
  if (!refreshToken) return;
  const session = await RefreshToken.findOne({ tokenHash: hash(refreshToken) }).select('familyId');
  if (session) await RefreshToken.deleteMany({ familyId: session.familyId });
};

const getCsrfForSession = async (refreshToken) => {
  if (!refreshToken) return null;
  const session = await RefreshToken.findOne({
    tokenHash: hash(refreshToken),
    expiresAt: { $gt: new Date() },
    consumedAt: null
  }).select('csrfNonce expiresAt');
  if (!session) return null;
  return {
    csrfToken: createCsrfToken(refreshToken, session.csrfNonce),
    expiresAt: session.expiresAt
  };
};

const cookieSettings = () => ({
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});

const setSessionCookies = (res, session) => {
  const settings = cookieSettings();
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.clearCookie('token', { ...settings, httpOnly: true, path: '/' });
  res.cookie(REFRESH_COOKIE, session.refreshToken, {
    ...settings,
    httpOnly: true,
    path: '/api/auth',
    expires: session.expiresAt
  });
  res.cookie(CSRF_COOKIE, session.csrfToken, {
    ...settings,
    httpOnly: false,
    path: '/',
    expires: session.expiresAt
  });
};

const setCsrfCookie = (res, csrfToken, expiresAt) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...cookieSettings(),
    httpOnly: false,
    path: '/',
    expires: expiresAt
  });
};

const clearSessionCookies = (res) => {
  const settings = cookieSettings();
  res.clearCookie(REFRESH_COOKIE, { ...settings, httpOnly: true, path: '/api/auth' });
  res.clearCookie(CSRF_COOKIE, { ...settings, httpOnly: false, path: '/' });
  // Remove the former access-token cookie when upgrading existing sessions.
  res.clearCookie('token', { ...settings, httpOnly: true, path: '/' });
};

const serializeUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  lastLoginAt: user.lastLoginAt
});

module.exports = {
  REFRESH_COOKIE,
  CSRF_COOKIE,
  hash,
  createCsrfToken,
  createSession,
  rotateSession,
  revokeSession,
  getCsrfForSession,
  setSessionCookies,
  setCsrfCookie,
  clearSessionCookies,
  serializeUser
};
