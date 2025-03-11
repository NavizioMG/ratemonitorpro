import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Check, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { STANDARD_PLAN } from '../services/stripe';

const features = [
  {
    name: 'Unlimited Clients',
    description: 'Track and manage as many clients as you need with no restrictions.'
  },
  {
    name: 'Real-time Rate Monitoring',
    description: 'Get instant updates when rates change throughout the day.'
  },
  {
    name: 'Smart Notifications',
    description: 'Receive alerts when rates match your target criteria.'
  },
  {
    name: 'Client Management',
    description: 'Comprehensive tools to manage your client portfolio.'
  },
  {
    name: 'Rate Analytics',
    description: 'Advanced analytics and reporting tools.'
  },
  {
    name: 'Priority Support',
    description: '24/7 email support for all your needs.'
  },
  {
    name: 'Regular Updates',
    description: 'Continuous improvements and new features.'
  },
  {
    name: 'Data Security',
    description: 'Enterprise-grade security to protect your data.'
  }
];

export function Pricing() {
  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="h-full w-full object-cover opacity-10"
            />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                One plan, everything you need. No hidden fees or complicated tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Pricing Card */}
            <div className="max-w-lg mx-auto rounded-lg shadow-xl overflow-hidden lg:max-w-none lg:flex">
              <div className="flex-1 bg-white px-6 py-8 lg:p-10">
                <h3 className="text-2xl font-bold text-gray-900">{STANDARD_PLAN.name}</h3>
                <p className="mt-6 text-base text-gray-500">
                  Everything you need to grow your mortgage business. Simple and powerful.
                </p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <h4 className="flex-shrink-0 pr-4 text-base font-semibold text-primary">
                      What's included
                    </h4>
                    <div className="flex-1 border-t-2 border-gray-200"></div>
                  </div>
                  <ul className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                    {STANDARD_PLAN.features.map((feature) => (
                      <li key={feature.name} className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          {feature}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                <p className="text-lg leading-6 font-medium text-gray-900">
                  One simple price, everything included
                </p>
                <div className="mt-4 flex items-center justify-center text-5xl font-bold text-gray-900">
                  <span>${STANDARD_PLAN.price}</span>
                  <span className="ml-3 text-xl font-medium text-gray-500">/month</span>
                </div>
                <div className="mt-6">
                  <Link
                    to="/auth?signup=true"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful tools designed specifically for mortgage professionals
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Real-time Monitoring</h3>
                <p className="mt-2 text-gray-500">
                  Track mortgage rates in real-time with instant alerts when opportunities arise.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Client Management</h3>
                <p className="mt-2 text-gray-500">
                  Manage your entire client portfolio with our intuitive dashboard.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Enterprise Security</h3>
                <p className="mt-2 text-gray-500">
                  Bank-grade security to protect your sensitive client information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Is there a free trial?
              </h3>
              <p className="mt-2 text-gray-500">
                Yes, you get a 14-day free trial to test all features.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Can I cancel anytime?
              </h3>
              <p className="mt-2 text-gray-500">
                Yes, you can cancel your subscription at any time with no questions asked.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-gray-500">
                We accept all major credit cards including Visa, Mastercard, and American Express.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Is there a limit on clients?
              </h3>
              <p className="mt-2 text-gray-500">
                No, you can manage unlimited clients with your subscription.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-gray-100">Start your free trial today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/auth?signup=true"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}