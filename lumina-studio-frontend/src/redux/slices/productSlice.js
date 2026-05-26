/**
 * @file productSlice.js
 * @description Redux slice for product / store page data.
 * Shared across StoreView and ProductCard → store-level.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts as fetchProductsApi } from '../../api/product.api';

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchProducts = createAsyncThunk(
    'products/fetchData',
    async (category = '', { rejectWithValue }) => {
        const result = await fetchProductsApi(category);
        if (!result.success) return rejectWithValue(result.message);
        return result.data; // { products, siteContent }
    }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        siteContent: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.products;
                state.siteContent = action.payload.siteContent;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
/** @param {import('../store').RootState} state */
export const selectProducts = (state) => state.products.items;
export const selectProductContent = (state) => state.products.siteContent;
export const selectProductStatus = (state) => state.products.status;
export const selectProductError = (state) => state.products.error;
