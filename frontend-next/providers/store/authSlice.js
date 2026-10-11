import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  csrfToken: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user ?? state.user;
      state.accessToken = action.payload.accessToken;
      state.csrfToken = action.payload.csrfToken || null;
    },
    setAuthTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.csrfToken = action.payload.csrfToken || null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
    },
    setInitialized(state, action) {
      state.initialized = action.payload;
    },
  },
});

export const { setCredentials, setAuthTokens, setUser, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
