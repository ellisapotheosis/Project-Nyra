export function Testimonials() {
  const testimonials = [
    { name: 'Sarah Johnson', text: 'RateHunter helped me save $40,000 over the life of my loan!', rating: 5 },
    { name: 'Michael Chen', text: 'The process was incredibly easy. Got my quote in under a minute.', rating: 5 },
    { name: 'Emma Rodriguez', text: 'Best rates I found anywhere. Highly recommend!', rating: 5 }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-soft">
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <span key={j} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">\"{t.text}\"</p>
              <p className="font-semibold text-gray-900">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
