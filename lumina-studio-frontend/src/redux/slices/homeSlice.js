/**
 * @file homeSlice.js
 * @description Redux slice for the home page data.
 * State is shared across Homepage and LoginView → store-level.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHomeData as fetchHomeApi } from '../../api/home.api';

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchHomeData = createAsyncThunk(
    'home/fetchData',
    async (_, { rejectWithValue }) => {
        const result = await fetchHomeApi();
        if (!result.success) return rejectWithValue(result.message);
        return result.data; // { hero, services, gallery, testimonial, siteContent }
    }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const homeSlice = createSlice({
    name: 'home',
    initialState: {
        data: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomeData.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchHomeData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchHomeData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default homeSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
/** @param {import('../store').RootState} state */
export const selectHomeData = (state) => state.home.data;
export const selectHomeStatus = (state) => state.home.status;
export const selectHomeError = (state) => state.home.error;
