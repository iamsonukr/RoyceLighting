import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  deliveryFee: number;
}

const initialState: CartState = {
  items: [],
  loading: false,
  deliveryFee: 0,
};

export const fetchCartThunk = createAsyncThunk(
  'cart/fetch',
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.items || [];
    } catch {
      return rejectWithValue('Failed to fetch cart');
    }
  },
);

export const addToCartThunk = createAsyncThunk(
  'cart/add',
  async (
    { token, ...body }: { token: string; productId: string; quantity: number; color?: string; size?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post('/cart/add', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.items || [];
    } catch {
      return rejectWithValue('Failed to add to cart');
    }
  },
);

export const removeFromCartThunk = createAsyncThunk(
  'cart/remove',
  async (
    { token, ...body }: { token: string; productId: string; color?: string; size?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.delete('/cart/remove', {
        headers: { Authorization: `Bearer ${token}` },
        data: body,
      });
      return res.data.data.items || [];
    } catch {
      return rejectWithValue('Failed to remove from cart');
    }
  },
);

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (token: string, { rejectWithValue }) => {
    try {
      await api.delete('/cart/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return [];
    } catch {
      return rejectWithValue('Failed to clear cart');
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setDeliveryFee(state, action: PayloadAction<number>) {
      state.deliveryFee = action.payload;
    },
    clearCartLocal(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(addToCartThunk.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(clearCartThunk.fulfilled, (state) => { state.items = []; });
  },
});

export const { setDeliveryFee, clearCartLocal } = cartSlice.actions;

// Selectors
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
