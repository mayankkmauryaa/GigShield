import { Claim, Worker } from '../types';
import { getWorker } from '../store';

export function exportClaimsToCSV(
  claims: Claim[],
  workers: Map<string, Worker>,
  filename: string = 'gigshield-claims-export.csv'
): void {
  const headers = [
    'Claim ID',
    'Worker Name',
    'Worker Phone',
    'Platform',
    'City',
    'Trigger Type',
    'Payout Amount (₹)',
    'Hours Affected',
    'Status',
    'Fraud Level',
    'Fraud Score',
    'Created Date',
    'Approved Date',
    'Paid Date'
  ];

  const rows = claims.map(claim => {
    const worker = workers.get(claim.workerId);
    const createdDate = new Date(claim.createdAt).toLocaleDateString('en-IN');
    const approvedDate = claim.approvedAt ? new Date(claim.approvedAt).toLocaleDateString('en-IN') : '-';
    const paidDate = claim.paidAt ? new Date(claim.paidAt).toLocaleDateString('en-IN') : '-';

    return [
      claim.id,
      worker?.name || 'Unknown',
      worker?.phone || '-',
      worker?.platform || '-',
      worker?.location.city || '-',
      claim.triggerType,
      claim.payoutAmount.toString(),
      claim.hoursAffected.toString(),
      claim.status,
      claim.fraudCheck.level,
      claim.fraudCheck.score.toString(),
      createdDate,
      approvedDate,
      paidDate
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportWorkersToCSV(
  workers: Worker[],
  filename: string = 'gigshield-workers-export.csv'
): void {
  const headers = [
    'Worker ID',
    'Name',
    'Phone',
    'Email',
    'Platform',
    'City',
    'State',
    'Risk Zone',
    'Behavior Score',
    'Avg Weekly Earnings (₹)',
    'Avg Weekly Hours',
    'Tenure (months)',
    'Status',
    'Registered Date'
  ];

  const rows = workers.map(worker => [
    worker.id,
    worker.name,
    worker.phone,
    worker.email,
    worker.platform,
    worker.location.city,
    worker.location.state,
    worker.riskZone,
    worker.behaviorScore.toString(),
    worker.avgWeeklyEarnings.toString(),
    worker.avgWeeklyHours.toString(),
    worker.tenure.toString(),
    worker.status,
    new Date(worker.registeredAt).toLocaleDateString('en-IN')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnalyticsToCSV(
  metrics: {
    totalWorkers: number;
    activePolicies: number;
    premiumsCollected: number;
    totalPayouts: number;
    lossRatio: number;
    fraudRate: number;
    pendingClaims: number;
    approvedClaims: number;
    paidClaims: number;
  },
  filename: string = 'gigshield-analytics-export.csv'
): void {
  const headers = ['Metric', 'Value'];
  
  const rows = [
    ['Total Workers', metrics.totalWorkers.toString()],
    ['Active Policies', metrics.activePolicies.toString()],
    ['Premiums Collected (₹)', metrics.premiumsCollected.toString()],
    ['Total Payouts (₹)', metrics.totalPayouts.toString()],
    ['Loss Ratio (%)', metrics.lossRatio.toFixed(2)],
    ['Fraud Rate (%)', metrics.fraudRate.toFixed(2)],
    ['Pending Claims', metrics.pendingClaims.toString()],
    ['Approved Claims', metrics.approvedClaims.toString()],
    ['Paid Claims', metrics.paidClaims.toString()],
    ['Export Date', new Date().toLocaleDateString('en-IN')]
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}