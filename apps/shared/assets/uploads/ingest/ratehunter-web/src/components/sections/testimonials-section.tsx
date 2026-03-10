'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Austin, TX',
    rating: 5,
    text: 'RateHunter made finding the best mortgage rate incredibly easy. I saved over $300 per month compared to my original quote!',
    image: '/avatars/sarah.jpg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'The AI matching was spot on. I was connected with a lender who understood my unique financial situation and got me a great rate.',
    image: '/avatars/michael.jpg',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    text: 'As a first-time homebuyer, I was overwhelmed. RateHunter simplified everything and their team was incredibly supportive.',
    image: '/avatars/emily.jpg',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-20" id="testimonials">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <Star className="mr-2 h-4 w-4 fill-current" />
            Customer Stories
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of satisfied homeowners who found their perfect rate
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg bg-white p-8 shadow-sm"
            >
              <Quote className="mb-4 h-8 w-8 text-blue-600 opacity-50" />

              <div className="mb-4 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mb-6 text-gray-700">{testimonial.text}</p>

              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-blue-100" />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center rounded-lg bg-white p-8 shadow-sm">
            <div className="mb-2 flex items-center">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="ml-2 text-3xl font-bold">4.9</span>
              <span className="ml-2 text-gray-600">out of 5</span>
            </div>
            <p className="text-sm text-gray-600">Based on 2,847 reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
