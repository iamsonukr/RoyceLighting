import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  authModalOpen: boolean;
  authMode: 'login' | 'register';
  mobileMenuOpen: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

const initialState: UIState = {
  authModalOpen: false,
  authMode: 'login',
  mobileMenuOpen: false,
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
    addToast(state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) {
      state.toasts.push({ id: Date.now().toString(), ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { openAuthModal, closeAuthModal, toggleMobileMenu, addToast, removeToast } =
  uiSlice.actions;
export default uiSlice.reducer;
