import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/PolicyPage';
import { privacyPolicy } from '@/lib/legalPolicies';

export const metadata: Metadata = {
  title: 'Privacy Policy | Royce Lighting',
  description:
    'Privacy Policy for Royce Lighting covering customer data, payment gateway processing, shipping support, custom orders, data rights, and India-focused e-commerce compliance.',
};

export default function PrivacyPolicyPage() {
  return <PolicyPage policy={privacyPolicy} />;
}
