import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Measure {
  id: string;
  name: string;
  score: number;
  target: number;
}

interface RequestBody {
  organization_name: string;
  reporting_period: string;
  measures: Measure[];
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { organization_name, reporting_period, measures } = req.body as RequestBody;

  // Validate required fields
  if (!organization_name || !reporting_period || !Array.isArray(measures)) {
    return res.status(400).json({ 
      error: "Missing required fields: organization_name, reporting_period, and measures are required" 
    });
  }

  // Validate each measure has required fields
  for (const measure of measures) {
    if (!measure.id || !measure.name || typeof measure.score !== 'number' || typeof measure.target !== 'number') {
      return res.status(400).json({ 
        error: "Each measure must have id, name, score, and target fields" 
      });
    }
  }

  const rows = (measures || [])
    .map(m => {
      const gapValue = m.score - m.target;
      const status =
        m.score >= m.target ? "MEETS" :
        Math.abs(gapValue) <= 2 ? "NEAR" :
        "BELOW";
      const gap = gapValue.toFixed(1);

      return `
        <tr>
          <td>${escapeHtml(m.id)}</td>
          <td>${escapeHtml(m.name)}</td>
          <td>${m.score}%</td>
          <td>${m.target}%</td>
          <td>${gap}%</td>
          <td>${status}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
  <html class="dark">
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <title>PerformanceIQ Report</title>
    </head>
    <body class="bg-slate-900 text-white p-8">
      <h1 class="text-3xl font-bold mb-2">${escapeHtml(organization_name)}</h1>
      <p class="text-slate-400 mb-6">${escapeHtml(reporting_period)}</p>

      <table class="w-full border border-slate-700">
        <thead class="bg-slate-800">
          <tr>
            <th>ID</th>
            <th>Measure</th>
            <th>Score</th>
            <th>Target</th>
            <th>Gap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
