'use client';

import Unauthorized from '@/components/feedback/errors/Unauthorized';
import LoadingPage from '@/components/feedback/loading/LoadingPage';
import { Suspense } from 'react';

export default function page() {
    return (
        <Suspense fallback={<LoadingPage />}>
            <Unauthorized />
        </Suspense>
    );
}