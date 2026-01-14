'use client';

export function RateTable() {
  const rates = [
    { type: 'Conventional 30-Year', rate: '6.875%', apr: '7.000%' },
    { type: 'Conventional 15-Year', rate: '6.125%', apr: '6.250%' },
    { type: 'FHA 30-Year', rate: '6.625%', apr: '6.750%' },
    { type: 'VA 30-Year', rate: '6.375%', apr: '6.500%' },
    { type: 'Jumbo 30-Year', rate: '7.125%', apr: '7.250%' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Today's Rates</h2>
        <p className="text-center text-gray-600 mb-12">Updated daily based on market conditions</p>
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Loan Type</th>
                <th className="px-6 py-4 text-center">Interest Rate</th>
                <th className="px-6 py-4 text-center">APR</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.type}</td>
                  <td className="px-6 py-4 text-center text-primary-600 font-bold">{r.rate}</td>
                  <td className="px-6 py-4 text-center">{r.apr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
