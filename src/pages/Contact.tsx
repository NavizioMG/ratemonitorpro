import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Send
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    type: 'sales'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        type: 'sales'
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Contact Us
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Get in touch with our team. We're here to help you succeed.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg">
              <Mail className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-2 text-base text-gray-500">
                support@ratemonitorpro.com
              </p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg">
              <Phone className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Phone</h3>
              <p className="mt-2 text-base text-gray-500">
                +1 (555) 123-4567
              </p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg">
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Office</h3>
              <p className="mt-2 text-base text-gray-500 text-center">
                123 Business Ave<br />
                Suite 100<br />
                San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Send us a message
            </h2>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex justify-center">
                  <Send className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-green-800">
                  Message sent successfully!
                </h3>
                <p className="mt-2 text-green-700">
                  We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    I want to discuss
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Send Message
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <dl className="mt-6 space-y-6 divide-y divide-gray-200">
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900">
                  How quickly do you respond to inquiries?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  We typically respond to all inquiries within 24 business hours. For urgent technical support, our response time is usually under 4 hours.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900">
                  Do you offer custom solutions?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, we offer custom solutions for enterprise clients. Contact our sales team to discuss your specific needs.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900">
                  What kind of support is included?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  All plans include email support. Professional and Enterprise plans include priority support with phone and video call options.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}