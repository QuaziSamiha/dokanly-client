'use client';

import NetworkError from '@/components/feedback/errors/NetworkError';
import LoadingPage from '@/components/feedback/loading/LoadingPage';
import { Suspense } from 'react';

export default function page() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <NetworkError />
    </Suspense>
  );
}