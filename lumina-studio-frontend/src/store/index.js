import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import homeReducer from './homeSlice';
import productReducer from './productSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    products: productReducer,
    cart: cartReducer,
  },
});
