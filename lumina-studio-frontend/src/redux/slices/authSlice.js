/**
 * @file authSlice.js
 * @description Redux slice for authentication state.
 *
 * REDUX scope: auth token, user session, loading/error states.
 * LOCAL scope: form input values (stay in LoginView component state).
 *
 * Selectors are co-located for easy memoization with reselect if needed.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signIn, signUp } from '../../api/auth.api';

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/** Sign in existing user. Stores token in localStorage on success. */
export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        const result = await signIn(credentials);
        if (!result.success) return rejectWithValue(result.message);
        localStorage.setItem('lumina_auth_token', result.data.token);
        return result.data; // { token, user }
    }
);

/** Register new user. */
export const signUpThunk = createAsyncThunk(
    'auth/signUp',
    async (payload, { rejectWithValue }) => {
        const result = await signUp(payload);
        if (!result.success) return rejectWithValue(result.message);
        localStorage.setItem('lumina_auth_token', result.data.token);
        return result.data;
    }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('lumina_auth_token') || null,
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('lumina_auth_token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state) => { state.loading = true; state.error = null; };
        const handleFulfilled = (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        };
        const handleRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload;
        };

        builder
            .addCase(loginThunk.pending, handlePending)
            .addCase(loginThunk.fulfilled, handleFulfilled)
            .addCase(loginThunk.rejected, handleRejected)
            .addCase(signUpThunk.pending, handlePending)
            .addCase(signUpThunk.fulfilled, handleFulfilled)
            .addCase(signUpThunk.rejected, handleRejected);
    },
});

export const { logout, clearAuthError } = authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
/** @param {import('../store').RootState} state */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
