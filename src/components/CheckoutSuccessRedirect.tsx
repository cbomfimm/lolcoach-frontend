'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function CheckoutSuccessRedirect() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (params.get('checkout') === 'success') {
      router.replace('/checkout-success');
    }
  }, [params, router]);

  return null;
}
