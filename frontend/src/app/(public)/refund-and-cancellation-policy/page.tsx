import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/PolicyPage';
import { refundPolicy } from '@/lib/legalPolicies';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Royace Lighting',
  description:
    'Refund and Cancellation Policy for Royace Lighting covering ready-stock, made-to-order, custom lighting, damaged products, returns, warranty limitations, and refund timelines.',
};

export default function RefundAndCancellationPolicyPage() {
  return <PolicyPage policy={refundPolicy} />;
}
