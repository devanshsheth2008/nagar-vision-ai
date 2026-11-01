import {
  stats,
  dailyIncidentTrend,
  weeklyGarbageDetection,
  monthlyCleanupPerformance,
  wasteDistribution,
} from '@/data/mockData';

interface ReportOptions {
  month: string;
  year: string;
  generatedBy: string;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const barColor = '#218838';
const secondaryColor = '#168C8C';
const accentColor = '#C83E3E';
const headerColor = '#FFFFFF';
const lightGray = '#e5e7eb';
const darkText = '#111827';
const mediumText = '#4b5563';

function buildIncidentTrendChart(): string {
  const maxVal = Math.max(...dailyIncidentTrend.map((d) => Math.max(d.incidents, d.resolved)));
  const chartW = 500;
  const chartH = 160;
  const barW = chartW / (dailyIncidentTrend.length * 2);
  const scale = (chartH - 20) / maxVal;

  const bars = dailyIncidentTrend
    .map((d, i) => {
      const x1 = i * barW * 2 + 10;
      const x2 = x1 + barW;
      const h1 = d.incidents * scale;
      const h2 = d.resolved * scale;
      return `
        <rect x="${x1}" y="${chartH - h1}" width="${barW - 2}" height="${h1}" fill="${accentColor}" rx="2"/>
        <rect x="${x2}" y="${chartH - h2}" width="${barW - 2}" height="${h2}" fill="${barColor}" rx="2"/>
        <text x="${x1 + barW / 2}" y="${chartH + 14}" font-family="Inter, sans-serif" font-size="9" fill="${mediumText}" text-anchor="middle">${d.day}</text>
      `;
    })
    .join('');

  return `
    <g transform="translate(20, 0)">
      ${bars}
      <line x1="0" y1="${chartH}" x2="${chartW}" y2="${chartH}" stroke="${lightGray}" stroke-width="1"/>
    </g>
  `;
}

function buildWasteDistributionTable(): string {
  const total = wasteDistribution.reduce((a, w) => a + w.value, 0);
  return wasteDistribution
    .map((w) => {
      const pct = ((w.value / total) * 100).toFixed(1);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;">
            <span style="display:inline-block;width:10px;height:10px;background:${w.color};border-radius:2px;margin-right:8px;"></span>
            ${escapeXml(w.name)}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${w.value}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${pct}%</td>
        </tr>
      `;
    })
    .join('');
}

function buildCleanupPerformanceTable(): string {
  return monthlyCleanupPerformance
    .map((m) => {
      const rate = ((m.completed / m.scheduled) * 100).toFixed(0);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;">${m.month}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${m.scheduled}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${m.completed}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;color:${barColor};">${rate}%</td>
        </tr>
      `;
    })
    .join('');
}

function buildWeeklyDetectionTable(): string {
  return weeklyGarbageDetection
    .map((w) => {
      const total = w.garbage + w.plastic + w.debris;
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;">${w.week}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${w.garbage}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${w.plastic}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;">${w.debris}</td>
          <td style="padding:8px 12px;border-bottom:1px solid ${lightGray};font-size:11px;text-align:right;font-family:monospace;font-weight:bold;">${total}</td>
        </tr>
      `;
    })
    .join('');
}

export function generateMonthlyReport(options: ReportOptions): void {
  const { month, year, generatedBy } = options;
  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const totalWaste = wasteDistribution.reduce((a, w) => a + w.value, 0);
  const totalScheduled = monthlyCleanupPerformance.reduce((a, m) => a + m.scheduled, 0);
  const totalCompleted = monthlyCleanupPerformance.reduce((a, m) => a + m.completed, 0);
  const completionRate = ((totalCompleted / totalScheduled) * 100).toFixed(1);
  const totalWeeklyDetections = weeklyGarbageDetection.reduce(
    (a, w) => a + w.garbage + w.plastic + w.debris,
    0,
  );

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200" style="background:#ffffff;">

  <!-- Header Bar -->
  <rect x="0" y="0" width="800" height="80" fill="${headerColor}"/>
  <rect x="0" y="78" width="800" height="2" fill="${barColor}"/>
  <text x="40" y="35" font-family="Inter, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">SWATCHNETRA</text>
  <text x="40" y="55" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af" letter-spacing="2">SMART CITY INTELLIGENCE SYSTEM</text>
  <text x="760" y="35" font-family="Inter, sans-serif" font-size="16" font-weight="bold" fill="${barColor}" text-anchor="end">Monthly Report</text>
  <text x="760" y="55" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af" text-anchor="end">${escapeXml(month)} ${escapeXml(year)}</text>

  <!-- Organization Info -->
  <text x="40" y="110" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="${darkText}">Gandhidham Municipal Corporation</text>
  <text x="40" y="128" font-family="Inter, sans-serif" font-size="10" fill="${mediumText}">Gandhidham, Gujarat, India</text>
  <text x="40" y="148" font-family="Inter, sans-serif" font-size="10" fill="${mediumText}">Generated: ${escapeXml(now)} | By: ${escapeXml(generatedBy)}</text>

  <line x1="40" y1="165" x2="760" y2="165" stroke="${lightGray}" stroke-width="1"/>

  <!-- Executive Summary -->
  <text x="40" y="195" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="${darkText}">Executive Summary</text>
  <rect x="40" y="205" width="60" height="3" fill="${barColor}" rx="1"/>

  <!-- KPI Cards -->
  <g transform="translate(40, 225)">
    ${[
      { label: 'Total Incidents', value: stats.totalIncidents.toLocaleString(), color: accentColor },
      { label: 'Active Hotspots', value: String(stats.activeHotspots), color: '#D99A19' },
      { label: 'Pending Cleanup', value: String(stats.pendingCleanup), color: '#2563A6' },
      { label: 'Resolved', value: stats.resolvedIncidents.toLocaleString(), color: secondaryColor },
      { label: 'Cameras', value: String(stats.registeredCameras), color: mediumText },
      { label: 'Accuracy', value: `${stats.detectionAccuracy}%`, color: barColor },
    ]
      .map((kpi, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = col * 240;
        const y = row * 80;
        return `
          <rect x="${x}" y="${y}" width="220" height="65" fill="#f9fafb" stroke="${lightGray}" stroke-width="1" rx="6"/>
          <text x="${x + 12}" y="${y + 22}" font-family="Inter, sans-serif" font-size="10" fill="${mediumText}">${escapeXml(kpi.label)}</text>
          <text x="${x + 12}" y="${y + 48}" font-family="monospace" font-size="22" font-weight="bold" fill="${kpi.color}">${escapeXml(kpi.value)}</text>
        `;
      })
      .join('')}
  </g>

  <!-- Incident Trend Chart -->
  <text x="40" y="430" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="${darkText}">Daily Incident Trends (7-Day)</text>
  <rect x="40" y="438" width="50" height="3" fill="${barColor}" rx="1"/>
  <g transform="translate(40, 450)">
    <rect x="0" y="0" width="720" height="190" fill="#f9fafb" stroke="${lightGray}" stroke-width="1" rx="6"/>
    <text x="15" y="20" font-family="Inter, sans-serif" font-size="10" fill="${accentColor}">■ Incidents</text>
    <text x="85" y="20" font-family="Inter, sans-serif" font-size="10" fill="${barColor}">■ Resolved</text>
    ${buildIncidentTrendChart()}
  </g>

  <!-- Waste Distribution Table -->
  <text x="40" y="680" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="${darkText}">Waste Category Distribution</text>
  <rect x="40" y="688" width="50" height="3" fill="${barColor}" rx="1"/>
  <g transform="translate(40, 700)">
    <rect x="0" y="0" width="350" height="${20 + wasteDistribution.length * 33 + 20}" fill="#f9fafb" stroke="${lightGray}" stroke-width="1" rx="6"/>
    <foreignObject x="10" y="10" width="330" height="${wasteDistribution.length * 33 + 30}">
      <table xmlns="http://www.w3.org/1999/xhtml" style="width:100%;border-collapse:collapse;font-family:Inter,sans-serif;">
        <tr style="background:${headerColor};">
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;">Category</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Count</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Share</td>
        </tr>
        ${buildWasteDistributionTable()}
        <tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;">Total</td>
          <td style="padding:8px 12px;font-size:11px;text-align:right;font-family:monospace;font-weight:bold;">${totalWaste}</td>
          <td style="padding:8px 12px;font-size:11px;text-align:right;font-family:monospace;font-weight:bold;">100%</td>
        </tr>
      </table>
    </foreignObject>
  </g>

  <!-- Weekly Detection Table -->
  <text x="420" y="680" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="${darkText}">Weekly Detection Summary</text>
  <rect x="420" y="688" width="50" height="3" fill="${barColor}" rx="1"/>
  <g transform="translate(420, 700)">
    <rect x="0" y="0" width="340" height="${20 + weeklyGarbageDetection.length * 33 + 20}" fill="#f9fafb" stroke="${lightGray}" stroke-width="1" rx="6"/>
    <foreignObject x="10" y="10" width="320" height="${weeklyGarbageDetection.length * 33 + 30}">
      <table xmlns="http://www.w3.org/1999/xhtml" style="width:100%;border-collapse:collapse;font-family:Inter,sans-serif;">
        <tr style="background:${headerColor};">
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;">Week</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Garbage</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Plastic</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Debris</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Total</td>
        </tr>
        ${buildWeeklyDetectionTable()}
        <tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;">Total</td>
          <td style="padding:8px 12px;font-size:11px;text-align:right;font-family:monospace;font-weight:bold;" colspan="4">${totalWeeklyDetections}</td>
        </tr>
      </table>
    </foreignObject>
  </g>

  <!-- Cleanup Performance -->
  <text x="40" y="920" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="${darkText}">Monthly Cleanup Performance</text>
  <rect x="40" y="928" width="50" height="3" fill="${barColor}" rx="1"/>
  <text x="760" y="920" font-family="Inter, sans-serif" font-size="11" fill="${mediumText}" text-anchor="end">Overall Completion Rate: <tspan font-weight="bold" fill="${barColor}">${completionRate}%</tspan></text>
  <g transform="translate(40, 940)">
    <rect x="0" y="0" width="720" height="${20 + monthlyCleanupPerformance.length * 33 + 20}" fill="#f9fafb" stroke="${lightGray}" stroke-width="1" rx="6"/>
    <foreignObject x="10" y="10" width="700" height="${monthlyCleanupPerformance.length * 33 + 30}">
      <table xmlns="http://www.w3.org/1999/xhtml" style="width:100%;border-collapse:collapse;font-family:Inter,sans-serif;">
        <tr style="background:${headerColor};">
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;">Month</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Scheduled</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Completed</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:bold;color:#fff;text-align:right;">Rate</td>
        </tr>
        ${buildCleanupPerformanceTable()}
      </table>
    </foreignObject>
  </g>

  <!-- Footer -->
  <rect x="0" y="1160" width="800" height="40" fill="${headerColor}"/>
  <text x="40" y="1180" font-family="Inter, sans-serif" font-size="9" fill="#6b7280">SWATCHNETRA | Gandhidham Municipal Corporation | Confidential</text>
  <text x="760" y="1180" font-family="Inter, sans-serif" font-size="9" fill="#6b7280" text-anchor="end">Page 1 of 1</text>
</svg>`;

  const svgData = new XMLSerializer().serializeToString(
    new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement,
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, 1600, 2400);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SwatchNetra_Report_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'application/pdf');
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}
