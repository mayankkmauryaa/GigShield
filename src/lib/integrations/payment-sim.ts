import { PaymentTransaction, Claim } from '../types';
import { createPayment, updateClaim, getClaim } from '../store';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  transactionRef?: string;
  message: string;
  amount?: number;
  method?: 'upi' | 'bank_transfer' | 'wallet';
}

export interface UPIAddress {
  upiId: string;
  bank?: string;
}

const MOCK_UPI_ADDRESSES: UPIAddress[] = [
  { upiId: 'worker@ybl', bank: 'Yes Bank' },
  { upiId: 'worker@okicici', bank: 'ICICI Bank' },
  { upiId: 'worker@okhdfcbank', bank: 'HDFC Bank' },
  { upiId: 'worker@paytm', bank: 'Paytm' },
  { upiId: 'worker@phonepe', bank: 'PhonePe' },
];

export async function processPayment(
  claimId: string,
  method: 'upi' | 'bank_transfer' | 'wallet' = 'upi'
): Promise<PaymentResult> {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  const claim = getClaim(claimId);
  if (!claim) {
    return {
      success: false,
      message: 'Claim not found',
    };
  }

  if (claim.status !== 'approved') {
    return {
      success: false,
      message: `Claim must be approved before payment. Current status: ${claim.status}`,
    };
  }

  let payoutAmount = claim.payoutAmount;
  let deductionReason: string | undefined;

  if (claim.fraudCheck.level === 'low') {
    payoutAmount = Math.round(payoutAmount * 0.9);
    deductionReason = '10% fraud review hold (released after 30 days if no issues)';
  } else if (claim.fraudCheck.level === 'medium') {
    payoutAmount = Math.round(payoutAmount * 0.8);
    deductionReason = '20% fraud review hold pending manual verification';
  }

  const successRate = 0.95;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const payment = createPayment({
      claimId,
      amount: payoutAmount,
      method,
      status: 'success',
    });

    updateClaim(claimId, {
      status: 'paid',
      payoutAmount,
      deductionReason,
      paidAt: new Date().toISOString(),
    });

    return {
      success: true,
      transactionId: payment.id,
      transactionRef: payment.transactionRef,
      message: 'Payment processed successfully',
      amount: payoutAmount,
      method,
    };
  }

  const payment = createPayment({
    claimId,
    amount: 0,
    method,
    status: 'failed',
  });

  return {
    success: false,
    transactionId: payment.id,
    transactionRef: payment.transactionRef,
    message: 'Payment failed. Will retry automatically within 24 hours.',
  };
}

export async function processBulkPayments(
  claimIds: string[],
  method: 'upi' | 'bank_transfer' | 'wallet' = 'upi'
): Promise<{
  successful: PaymentResult[];
  failed: PaymentResult[];
  totalAmount: number;
}> {
  const results = await Promise.all(
    claimIds.map(claimId => processPayment(claimId, method))
  );

  const successful = results.filter(r => r.success) as PaymentResult[];
  const failed = results.filter(r => !r.success);
  const totalAmount = successful.reduce((sum, r) => sum + (r.amount || 0), 0);

  return {
    successful,
    failed,
    totalAmount,
  };
}

export async function getUPIAddress(workerId: string): Promise<UPIAddress | null> {
  const index = workerId.charCodeAt(0) % MOCK_UPI_ADDRESSES.length;
  return MOCK_UPI_ADDRESSES[index];
}

export async function validateUPIAddress(upiId: string): Promise<{
  valid: boolean;
  message: string;
}> {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
  
  if (!upiRegex.test(upiId)) {
    return {
      valid: false,
      message: 'Invalid UPI format. Expected: username@bankname',
    };
  }

  const delay = 300 + Math.random() * 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  return {
    valid: true,
    message: 'UPI address validated successfully',
  };
}

export async function getPaymentStatus(transactionId: string): Promise<{
  status: 'pending' | 'success' | 'failed';
  message: string;
  timestamp: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const statuses: Array<'pending' | 'success' | 'failed'> = ['pending', 'success', 'success', 'success'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  const messages: { [key: string]: string } = {
    pending: 'Payment is being processed',
    success: 'Payment credited to your account',
    failed: 'Payment failed. Please contact support.',
  };

  return {
    status: randomStatus,
    message: messages[randomStatus],
    timestamp: new Date().toISOString(),
  };
}

export async function initiatePayoutSimulation(
  claimId: string,
  upiId: string
): Promise<{
  success: boolean;
  otpRequired: boolean;
  message: string;
  referenceId: string;
}> {
  const validation = await validateUPIAddress(upiId);
  if (!validation.valid) {
    return {
      success: false,
      otpRequired: false,
      message: validation.message,
      referenceId: '',
    };
  }

  await new Promise(resolve => setTimeout(resolve, 800));

  const referenceId = `PAY${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    success: true,
    otpRequired: true,
    message: `Payment of ₹${getClaim(claimId)?.payoutAmount || 0} initiated to ${upiId}`,
    referenceId,
  };
}

export async function confirmPayoutWithOTP(
  referenceId: string,
  otp: string
): Promise<{
  success: boolean;
  message: string;
  transactionRef?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 600));

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    return {
      success: false,
      message: 'Invalid OTP. Please enter a 6-digit code.',
    };
  }

  if (otp === '000000') {
    return {
      success: false,
      message: 'OTP verification failed. Please try again.',
    };
  }

  const transactionRef = `TXN${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    success: true,
    message: 'Payment confirmed! Amount will be credited within 30 seconds.',
    transactionRef,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateProcessingFee(amount: number): number {
  return Math.round(amount * 0.0025);
}

export function getPaymentMethodIcon(method: 'upi' | 'bank_transfer' | 'wallet'): string {
  const icons: { [key: string]: string } = {
    upi: '💳',
    bank_transfer: '🏦',
    wallet: '👛',
  };
  return icons[method];
}
