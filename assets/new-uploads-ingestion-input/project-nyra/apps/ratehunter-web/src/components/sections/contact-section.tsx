'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { submitContactForm } from '@/lib/api/contact';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: 'Message sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-20" id="contact">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Have questions? We're here to help you find your perfect mortgage
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-6 text-2xl font-semibold">Contact Information</h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="mr-4 mt-1 h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">support@ratehunter.net</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="mr-4 mt-1 h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600">1-800-RATE-HUNT</p>
                  <p className="text-sm text-gray-500">Mon-Fri 8am-8pm EST</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mr-4 mt-1 h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-gray-600">
                    123 Finance Street
                    <br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-blue-50 p-6">
              <h4 className="mb-2 font-semibold text-blue-900">
                Why Choose RateHunter?
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Compare rates from 50+ lenders</li>
                <li>✓ AI-powered rate matching</li>
                <li>✓ No impact on credit score</li>
                <li>✓ Free consultation with experts</li>
                <li>✓ Close in as little as 21 days</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="5555551234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your mortgage needs..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
