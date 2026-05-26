import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '../api/cart.api';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      if (response.success) {
        return response.data; // Array of cart items
      }
      return rejectWithValue(response.message || 'Failed to fetch cart.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred fetching cart.');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity, selectedSize, customImage, customColor }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart({ productId, quantity, selectedSize, customImage, customColor });
      if (response.success) {
        dispatch(fetchCart()); // Sync state from backend
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to add item.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred adding item to cart.');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity, selectedSize }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartItem({ productId, quantity, selectedSize });
      if (response.success) {
        dispatch(fetchCart()); // Sync state from backend
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update item quantity.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred updating quantity.');
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteItem',
  async ({ productId, selectedSize }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId, selectedSize);
      if (response.success) {
        dispatch(fetchCart()); // Sync state from backend
        return { productId, selectedSize };
      }
      return rejectWithValue(response.message || 'Failed to remove item.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred removing item.');
    }
  }
);

export const clearCartItems = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.clearCart();
      if (response.success) {
        return [];
      }
      return rejectWithValue(response.message || 'Failed to clear cart.');
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred clearing cart.');
    }
  }
);

const initialState = {
  items: [], // Array of { cart_item_id, quantity, product_id, title, price, category, description, image }
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Item
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Item
      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.error = null;
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
