'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Contact & Inquiries</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with CarePath Support
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Questions about your patient health vault, institutional inquiries, or technical support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6 md:col-span-1">
          <div className="flex items-start gap-3 text-xs text-slate-600">
            <Mail className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Support & Privacy</p>
              <p>support@carepath.example.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-600">
            <Phone className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Assistance</p>
              <p>+1 (800) 555-CARE</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-600">
            <MapPin className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Headquarters</p>
              <p>Seattle Healthcare Center, WA</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900">Inquiry Received</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you for contacting CarePath. A support specialist will respond to your email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message / Inquiry <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry..."
                  className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
