import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminAuthState {
  token: string | null;
  admin: { _id: string; name: string; email: string; role: string } | null;
}

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    token: typeof window !== 'undefined' ? localStorage.getItem('nc_admin_token') : null,
    admin: null,
  } as AdminAuthState,
  reducers: {
    setAdminAuth(state, action: PayloadAction<{ token: string; admin: any }>) {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nc_admin_token', action.payload.token);
      }
    },
    adminLogout(state) {
      state.token = null;
      state.admin = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nc_admin_token');
      }
    },
  },
});

export const { setAdminAuth, adminLogout } = adminAuthSlice.actions;

export const adminStore = configureStore({
  reducer: { adminAuth: adminAuthSlice.reducer },
});

export type AdminRootState = ReturnType<typeof adminStore.getState>;
export type AdminDispatch = typeof adminStore.dispatch;

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAdminDispatch = () => useDispatch<AdminDispatch>();
export const useAdminSelector: TypedUseSelectorHook<AdminRootState> = useSelector;
