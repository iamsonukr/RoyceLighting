import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nc_token');
    }
    return Promise.reject(err);
  },
);

export async function placeOrderAPI(token: string, orderData: any) {
  const res = await api.post('/orders/place', orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function createRazorpayOrderAPI(token: string, amount: number, orderData?: any) {
  const res = await api.post('/orders/create-razorpay-order', { amount, ...orderData }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function fetchOrdersAPI(token: string) {
  const res = await api.get('/orders/my-orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}
