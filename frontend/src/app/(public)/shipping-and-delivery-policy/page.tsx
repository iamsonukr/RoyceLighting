import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/PolicyPage';
import { shippingPolicy } from '@/lib/legalPolicies';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Royace Lighting',
  description:
    'Shipping and Delivery Policy for Royace Lighting covering dispatch timelines, delivery estimates, fragile freight, inspection, failed delivery, and damaged-in-transit support.',
};

export default function ShippingAndDeliveryPolicyPage() {
  return <PolicyPage policy={shippingPolicy} />;
}
