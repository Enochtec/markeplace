import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Contact form:', data);
    toast.success('Message sent! We\'ll get back to you soon.');
    setSent(true);
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800">Contact Us</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          Have a question? We're here to help. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email Us', lines: ['support@markethub.com', 'business@markethub.com'] },
            { icon: Phone, title: 'Call Us', lines: ['+1 (800) 123-4567', '+1 (800) 765-4321'] },
            { icon: MapPin, title: 'Visit Us', lines: ['123 Commerce Street', 'Market City, MC 10001'] },
            { icon: Clock, title: 'Working Hours', lines: ['Mon–Fri: 9AM – 6PM', 'Sat: 10AM – 4PM'] },
          ].map(({ icon: Icon, title, lines }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
                {lines.map((line) => <p key={line} className="text-sm text-gray-500">{line}</p>)}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-10">
              <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Message Sent!</h3>
              <p className="text-gray-500 mt-2">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-semibold">
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                    <input {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm"
                      placeholder="John Doe" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" {...register('email', { required: 'Email is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm"
                      placeholder="you@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm"
                    placeholder="How can we help?" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm resize-none"
                    placeholder="Describe your issue or question..." />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
                  <Send size={16} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
