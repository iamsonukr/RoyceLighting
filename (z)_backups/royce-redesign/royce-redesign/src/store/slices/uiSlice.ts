import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  authModalOpen: boolean;
  authMode: 'login' | 'register';
  mobileMenuOpen: boolean;
  cartDrawerOpen: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

const initialState: UIState = {
  authModalOpen: false,
  authMode: 'login',
  mobileMenuOpen: false,
  cartDrawerOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal(state, action: PayloadAction<'login' | 'register'>) {
      state.authModalOpen = true;
      state.authMode = action.payload;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    openCartDrawer(state) {
      state.cartDrawerOpen = true;
    },
    closeCartDrawer(state) {
      state.cartDrawerOpen = false;
    },
    addToast(state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) {
      state.toasts.push({ id: Date.now().toString(), ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  toggleMobileMenu,
  openCartDrawer,
  closeCartDrawer,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;
