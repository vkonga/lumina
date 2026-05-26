import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signIn, signUp } from '../api/auth.api';

// Helper to decode JWT payload safely on client side
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await signIn(credentials);
      // Response normalized as { success, data: { token, user }, ... }
      if (response.success && response.data && response.data.token) {
        localStorage.setItem('lumina_auth_token', response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred during sign in.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (details, { rejectWithValue }) => {
    try {
      const response = await signUp(details);
      if (response.success && response.data && response.data.token) {
        localStorage.setItem('lumina_auth_token', response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message || 'Registration failed.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred during registration.');
    }
  }
);

// Check for active token on startup
const storedToken = localStorage.getItem('lumina_auth_token');
const decodedUser = storedToken ? decodeToken(storedToken) : null;

// If token has expired (JWT exp is in seconds)
const isTokenExpired = decodedUser && decodedUser.exp * 1000 < Date.now();
if (isTokenExpired) {
  localStorage.removeItem('lumina_auth_token');
}

const initialState = {
  user: isTokenExpired ? null : (decodedUser ? { id: decodedUser.id, username: decodedUser.username, email: decodedUser.email } : null),
  isAuthenticated: storedToken && !isTokenExpired ? true : false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = localStorage.getItem('lumina_auth_token');
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        state.user = { id: decoded.id, username: decoded.username, email: decoded.email };
        state.isAuthenticated = true;
        state.error = null;
      } else {
        localStorage.removeItem('lumina_auth_token');
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    logout: (state) => {
      localStorage.removeItem('lumina_auth_token');
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { initializeAuth, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
