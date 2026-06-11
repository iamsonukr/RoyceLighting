import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/PolicyPage';
import { termsPolicy } from '@/lib/legalPolicies';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Royace Lighting',
  description:
    'Terms and Conditions for Royace Lighting covering decorative lighting orders, payments, GST invoices, custom products, delivery, warranty, user obligations, and dispute resolution.',
};

export default function TermsAndConditionsPage() {
  return <PolicyPage policy={termsPolicy} />;
}
