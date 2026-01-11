'use client';

export function Features() {
  const features = [
    { title: 'No Hidden Fees', desc: 'Transparent pricing with no surprises', icon: '💰' },
    { title: 'Expert Support', desc: '24/7 assistance from loan specialists', icon: '👥' },
    { title: 'Fast Approval', desc: 'Get pre-approved in minutes', icon: '⚡' },
    { title: 'Best Rates', desc: 'Compare rates from 50+ lenders', icon: '🏆' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose RateHunter?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
