import { Worker, Policy, Claim } from '../types';

interface CertificateData {
  worker: Worker;
  policy: Policy;
  recentClaims: Claim[];
}

export function generatePolicyCertificate(data: CertificateData): string {
  const { worker, policy, recentClaims } = data;
  
  const issueDate = new Date(policy.createdAt).toLocaleDateString('en-IN');
  const expiryDate = new Date(policy.endDate).toLocaleDateString('en-IN');
  const certificateId = `GS-CERT-${policy.policyNumber.replace('GS-', '')}`;

  // Generate QR code URL (using free QR API for demo)
  const qrData = `GigShield Certificate\nID: ${certificateId}\nWorker: ${worker.name}\nPolicy: ${policy.policyNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GigShield Policy Certificate</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0b1326;
      color: #ffffff;
      padding: 40px;
    }
    .certificate {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a2744 0%, #0b1326 100%);
      border: 2px solid #6366f1;
      border-radius: 16px;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #6366f1;
      margin-bottom: 8px;
    }
    .title {
      font-size: 14px;
      color: #8b5cf6;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .certificate-id {
      text-align: right;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12px;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      background: rgba(255,255,255,0.03);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .info-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
    }
    .coverage-box {
      background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .coverage-amount {
      font-size: 36px;
      font-weight: 800;
      color: #6366f1;
    }
    .coverage-label {
      font-size: 12px;
      color: #8b5cf6;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .triggers {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .trigger-tag {
      background: rgba(99,102,241,0.15);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      color: #8b5cf6;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    .qr-section {
      text-align: center;
    }
    .qr-code {
      width: 100px;
      height: 100px;
      border-radius: 8px;
    }
    .qr-label {
      font-size: 9px;
      color: #64748b;
      margin-top: 5px;
    }
    .status-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🛡️ GigShield</div>
      <div class="title">Policy Certificate of Insurance</div>
    </div>
    
    <div class="certificate-id">
      Certificate ID: ${certificateId}
    </div>

    <div class="section">
      <div class="section-title">Worker Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Full Name</div>
          <div class="info-value">${worker.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone Number</div>
          <div class="info-value">${worker.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Delivery Platform</div>
          <div class="info-value" style="text-transform: capitalize;">${worker.platform}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Location</div>
          <div class="info-value">${worker.location.city}, ${worker.location.state}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Policy Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Policy Number</div>
          <div class="info-value">${policy.policyNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Policy Status</div>
          <div class="info-value"><span class="status-badge">${policy.status.toUpperCase()}</span></div>
        </div>
        <div class="info-item">
          <div class="info-label">Issue Date</div>
          <div class="info-value">${issueDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Expiry Date</div>
          <div class="info-value">${expiryDate}</div>
        </div>
      </div>
    </div>

    <div class="coverage-box">
      <div class="coverage-amount">₹${policy.maxCoverage.toLocaleString('en-IN')}</div>
      <div class="coverage-label">Maximum Weekly Coverage</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Weekly Premium</div>
        <div class="info-value">₹${policy.weeklyPremium}/week</div>
      </div>
      <div class="info-item">
        <div class="info-label">Hourly Rate</div>
        <div class="info-value">₹${policy.hourlyRate}/hour</div>
      </div>
    </div>

    <div class="section" style="margin-top: 20px;">
      <div class="section-title">Coverage Triggers</div>
      <div class="triggers">
        ${policy.triggers.map(t => `<span class="trigger-tag">${t.replace('_', ' ').toUpperCase()}</span>`).join('')}
      </div>
    </div>

    <div class="section" style="margin-top: 20px;">
      <div class="section-title">Auto-Renewal</div>
      <div class="info-value" style="font-size: 14px;">
        ${policy.autoRenew ? '✓ Enabled - Policy will automatically renew' : '✗ Disabled'}
      </div>
    </div>

    <div class="footer">
      <div>
        <div>This is a computer-generated certificate. No signature required.</div>
        <div>Valid for GigShield Parametric Insurance Platform</div>
      </div>
      <div class="qr-section">
        <img src="${qrUrl}" alt="QR Code" class="qr-code" />
        <div class="qr-label">Scan to verify</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

export function downloadCertificate(data: CertificateData): void {
  const html = generatePolicyCertificate(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GigShield-Certificate-${data.policy.policyNumber}.html`;
  link.click();
  URL.revokeObjectURL(url);
}