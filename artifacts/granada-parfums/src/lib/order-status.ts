import type { PreorderStatus } from '@workspace/api-client-react';

export const statusCopy: Record<PreorderStatus, { label: string; detail: string; step: number }> = {
  pending: { label: 'Pending', detail: 'Votre demande est bien reçue.', step: 0 },
  out_for_delivery: { label: 'Out for delivery', detail: 'Votre fragrance est en route.', step: 1 },
  delivered: { label: 'Delivered', detail: 'Votre commande a été livrée.', step: 2 },
};

export function apiErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export function apiErrorStatus(error: unknown) {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') return error.status;
    if ('statusCode' in error && typeof error.statusCode === 'number') return error.statusCode;
  }
  return undefined;
}
