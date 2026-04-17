import { getClaim, updateClaim, createPayment, getWorker } from '../store';
import { processPayment as processSimulatedPayment } from './payment-sim';
import { processRazorpayPayout, isTestMode, RazorpayPaymentResult } from './razorpay';
import { Claim } from '../types';

export type PaymentGateway = 'razorpay' | 'simulation';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  transactionRef?: string;
  message: string;
  amount?: number;
  method?: 'upi' | 'bank_transfer' | 'wallet';
  gateway: PaymentGateway;
  utr?: string;
}

export async function processPayment(
  claimId: string,
  method: 'upi' | 'bank_transfer' | 'wallet' = 'upi',
  forceGateway?: PaymentGateway
): Promise<PaymentResult> {
  const claim = getClaim(claimId);
  if (!claim) {
    return {
      success: false,
      message: 'Claim not found',
      gateway: 'simulation',
    };
  }

  if (claim.status !== 'approved') {
    return {
      success: false,
      message: `Claim must be approved before payment. Current status: ${claim.status}`,
      gateway: 'simulation',
    };
  }

  const worker = getWorker(claim.workerId);
  const workerName = worker?.name || 'Worker';
  const workerUpiId = worker?.phone ? `${worker.phone}@upi` : 'worker@upi';

  const useRazorpay = forceGateway === 'razorpay' || (forceGateway !== 'simulation' && isTestMode());

  if (useRazorpay) {
    try {
      const razorpayResult: RazorpayPaymentResult = await processRazorpayPayout(
        claim,
        workerUpiId,
        workerName
      );

      if (razorpayResult.success) {
        createPayment({
          claimId,
          amount: razorpayResult.amount || claim.payoutAmount,
          method,
          status: 'success',
        });

        updateClaim(claimId, {
          status: 'paid',
          paidAt: new Date().toISOString(),
        });

        return {
          success: true,
          transactionId: razorpayResult.paymentId,
          transactionRef: razorpayResult.utr,
          message: razorpayResult.message,
          amount: razorpayResult.amount,
          method,
          gateway: 'razorpay',
          utr: razorpayResult.utr,
        };
      } else {
        return {
          success: false,
          message: razorpayResult.message,
          gateway: 'razorpay',
        };
      }
    } catch (error) {
      console.error('Razorpay failed, falling back to simulation:', error);
    }
  }

  const simResult = await processSimulatedPayment(claimId, method);
  return {
    success: simResult.success,
    transactionId: simResult.transactionId,
    transactionRef: simResult.transactionRef,
    message: simResult.message,
    amount: simResult.amount,
    method: simResult.method,
    gateway: 'simulation',
  };
}

export function getActiveGateway(): PaymentGateway {
  return isTestMode() ? 'razorpay' : 'simulation';
}

export function isRazorpayAvailable(): boolean {
  return isTestMode();
}

export function formatPaymentGateway(gateway: PaymentGateway): string {
  const names: Record<PaymentGateway, string> = {
    razorpay: 'Razorpay (UPI)',
    simulation: 'Simulated Payment',
  };
  return names[gateway];
}