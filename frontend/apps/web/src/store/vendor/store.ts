import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

interface VendorAuthState {
  token: string | null;
  vendor: { _id: string; name: string; email: string; shopName?: string; role: string } | null;
}

const vendorAuthSlice = createSlice({
  name: 'vendorAuth',
  initialState: {
    token: typeof window !== 'undefined' ? localStorage.getItem('nc_vendor_token') : null,
    vendor: null,
  } as VendorAuthState,
  reducers: {
    setVendorAuth(state, action: PayloadAction<{ token: string; vendor: any }>) {
      state.token = action.payload.token;
      state.vendor = action.payload.vendor;
      if (typeof window !== 'undefined') localStorage.setItem('nc_vendor_token', action.payload.token);
    },
    vendorLogout(state) {
      state.token = null;
      state.vendor = null;
      if (typeof window !== 'undefined') localStorage.removeItem('nc_vendor_token');
    },
  },
});

export const { setVendorAuth, vendorLogout } = vendorAuthSlice.actions;
export const vendorStore = configureStore({ reducer: { vendorAuth: vendorAuthSlice.reducer } });
export type VendorRootState = ReturnType<typeof vendorStore.getState>;
export type VendorDispatch = typeof vendorStore.dispatch;
export const useVendorDispatch = () => useDispatch<VendorDispatch>();
export const useVendorSelector: TypedUseSelectorHook<VendorRootState> = useSelector;
