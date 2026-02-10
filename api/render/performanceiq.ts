export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { organization_name, reporting_period, measures } = req.body;

  const rows = (measures || [])
    .map(m => {
      const gapValue = m.score - m.target;
      const gap = gapValue.toFixed(1);
      const status =
        m.score >= m.target ? "MEETS" :
        Math.abs(gapValue) <= 2 ? "NEAR" :
        "BELOW";

      return `
        <tr>
          <td>${m.id}</td>
          <td>${m.name}</td>
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
      <h1 class="text-3xl font-bold mb-2">${organization_name}</h1>
      <p class="text-slate-400 mb-6">${reporting_period}</p>

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
