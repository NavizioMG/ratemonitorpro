import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MessageCircle, Mail } from 'lucide-react';

export function HelpCenter() {
  const faqs = [
    {
      question: 'How often are mortgage rates updated?',
      answer: 'Mortgage rates are updated in real-time during business hours (9 AM - 5 PM EST) on business days.'
    },
    {
      question: 'How do I set up rate alerts?',
      answer: 'Navigate to the Rate Tracking page, select a client, and set their target rate. You\'ll be notified automatically when rates meet your criteria.'
    },
    {
      question: 'Can I export client data?',
      answer: 'Yes, you can export client data to CSV format from the Clients page using the export button.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/docs" className="flex items-center text-primary hover:text-primary-dark">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Documentation
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-4 text-lg text-gray-500">
            Find answers to common questions or get in touch with our support team
          </p>
          
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <MessageCircle className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
            <p className="mt-2 text-gray-500">
              Chat with our support team during business hours
            </p>
            <button className="mt-4 text-primary hover:text-primary-dark">
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Mail className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
            <p className="mt-2 text-gray-500">
              Get help via email within 24 hours
            </p>
            <a
              href="mailto:support@ratemonitorpro.com"
              className="mt-4 text-primary hover:text-primary-dark"
            >
              Send Email
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <MessageCircle className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
            <p className="mt-2 text-gray-500">
              Browse our detailed guides and tutorials
            </p>
            <Link to="/docs" className="mt-4 text-primary hover:text-primary-dark">
              View Articles
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}