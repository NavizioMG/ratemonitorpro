import { 
  TrendingUp, 
  Bell, 
  Shield, 
  Zap,
  Users,
  Globe2,
  Target,
  ArrowRight,
  ArrowUpRight,
  Check,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { SocialProof } from '../components/ui/SocialProof';
import { SecurityFeatures } from '../components/ui/SecurityFeatures';
import { STANDARD_PLAN } from '../services/stripe';

export function Landing() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Rate Monitoring',
      description: 'Track mortgage rates in real-time with instant alerts when opportunities arise.',
      color: 'bg-blue-500'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get intelligent alerts about rate changes and refinancing opportunities.',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Client Management',
      description: 'Efficiently manage your client portfolio with our intuitive dashboard.',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Automated Workflows',
      description: 'Save time with automated client communications and rate monitoring.',
      color: 'bg-amber-500'
    }
  ];

  const values = [
    {
      icon: Target,
      name: 'Mission-Driven',
      description: 'Our mission is to empower mortgage professionals with the tools they need to succeed.',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      icon: Users,
      name: 'Client-Focused',
      description: 'We put our clients first and build solutions that address their real needs.',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      icon: Globe2,
      name: 'Innovation',
      description: 'We continuously innovate to stay ahead of industry changes and technological advances.',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const planFeatures = [
    'Unlimited Clients',
    'Real-time Rate Monitoring',
    'Smart Notifications',
    'Client Management',
    'Rate Analytics',
    'Priority Email Support',
    'API Access',
    'Custom Reports',
    'Data Export',
    'Client Portal'
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative pt-16 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2830&q=80"
              className="w-full h-full object-cover opacity-5"
              alt=""
            />
          </div>
          <div className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 animate-fade-in">
                Monitor Mortgage Rates.<br />
                <span className="text-primary">
                  Close More Deals.
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
                Automate your rate monitoring and client communications. Get instant alerts when rates match your targets.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
                <Link
                  to="/auth?signup=true"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark transition-all duration-200 group"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-primary transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <SocialProof />

        {/* Features Section */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Everything you need to grow your mortgage business
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful tools designed specifically for mortgage professionals
              </p>
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="relative bg-white p-8 rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className={`inline-flex rounded-lg p-3 ${feature.color} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 ${feature.color} text-opacity-80`} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-gray-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                One simple price, everything included
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">
                    Professional Plan
                  </h3>
                  <div className="mt-4 flex items-center justify-center text-5xl font-bold text-gray-900">
                    <span>${STANDARD_PLAN.price}</span>
                    <span className="ml-3 text-xl font-medium text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-center text-gray-600">
                    Everything you need to grow your mortgage business
                  </p>

                  <ul className="mt-8 space-y-4">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      to="/auth?signup=true"
                      className="block w-full bg-primary text-white rounded-lg px-6 py-3 text-center text-base font-medium hover:bg-primary-dark transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                    <p className="mt-4 text-sm text-center text-gray-500">
                      No long-term contracts • Instant setup • Unlimited features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <SecurityFeatures />

        {/* Values Section */}
        <div className="bg-gray-50 py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=2830&q=80"
              className="w-full h-full object-cover opacity-5"
              alt=""
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary">Our Values</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The principles that drive our innovation
              </p>
              <p className="mt-4 text-lg text-gray-600">
                We're committed to revolutionizing how mortgage professionals work and succeed.
              </p>
            </div>

            <div className="mt-20 grid gap-12 lg:grid-cols-3">
              {values.map((value, index) => (
                <div key={value.name} className="flex gap-8">
                  <div className="relative flex-none w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-12 w-12 text-primary" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.name}</h3>
                    <p className="text-gray-600 mb-4">{value.description}</p>
                    <img
                      src={value.image}
                      alt={value.name}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-primary/5 rounded-2xl p-8 sm:p-16">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Ready to transform your mortgage business?
                </h2>
                <p className="mt-6 text-lg text-gray-600">
                  Join thousands of mortgage professionals who are growing their business with Rate Monitor Pro.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/auth?signup=true"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}