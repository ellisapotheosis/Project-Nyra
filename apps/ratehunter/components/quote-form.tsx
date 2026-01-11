'use client';

export function QuoteForm() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Loan Amount</label>
            <input type="number" className="w-full px-4 py-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Property Value</label>
            <input type="number" className="w-full px-4 py-3 border rounded-lg" />
          </div>
        </div>
        <button type="submit" className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
          Get My Quote
        </button>
      </form>
    </div>
  );
}
