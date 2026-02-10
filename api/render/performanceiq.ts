const STATUS_CONFIG = {
  MEETS: "bg-green-900 text-green-200",
  NEAR: "bg-yellow-900 text-yellow-200",
  BELOW: "bg-red-900 text-red-200"
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { organization_name, reporting_period, measures } = req.body;

  const rows = (measures || [])
    .map(m => {
      const gap = (m.score - m.target).toFixed(1);
      const status =
        m.score >= m.target ? "MEETS" :
        Math.abs(gap) <= 2 ? "NEAR" :
        "BELOW";

      const statusColor = STATUS_CONFIG[status] || "bg-gray-900 text-gray-200";

      return `
        <tr>
          <td class="px-4 py-2">${m.id}</td>
          <td class="px-4 py-2">${m.name}</td>
          <td class="px-4 py-2">${m.score}%</td>
          <td class="px-4 py-2">${m.target}%</td>
          <td class="px-4 py-2">${gap}%</td>
          <td class="px-4 py-2"><span class="${statusColor} px-2 py-1 rounded font-semibold inline-block">${status}</span></td>
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
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Measure</th>
            <th class="px-4 py-2">Score</th>
            <th class="px-4 py-2">Target</th>
            <th class="px-4 py-2">Gap</th>
            <th class="px-4 py-2">Status</th>
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
