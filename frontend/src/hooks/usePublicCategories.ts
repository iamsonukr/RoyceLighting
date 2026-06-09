'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicCategories } from '@/lib/publicCategories';

export function usePublicCategories() {
  return useQuery({
    queryKey: ['public-categories'],
    queryFn: () => fetchPublicCategories(),
    staleTime: 5 * 60 * 1000,
  });
}
