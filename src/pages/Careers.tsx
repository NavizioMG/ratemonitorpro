import { MainLayout } from '../components/layout/MainLayout';
import { Building2, Users, Globe2, Zap, ArrowRight } from 'lucide-react';

export function Careers() {
  const openPositions = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Sales Development Representative',
      department: 'Sales',
      location: 'New York, NY',
      type: 'Full-time'
    }
  ];

  const values = [
    {
      icon: Users,
      name: 'Customer First',
      description: 'We put our customers at the center of everything we do.'
    },
    {
      icon: Zap,
      name: 'Innovation',
      description: 'We embrace new ideas and technologies to solve complex problems.'
    },
    {
      icon: Globe2,
      name: 'Remote-First',
      description: 'We believe in hiring the best talent, regardless of location.'
    }
  ];

  const benefits = [
    'Competitive salary and equity',
    'Remote-first culture',
    'Flexible PTO',
    'Health, dental, and vision insurance',
    '401(k) with company match',
    'Home office stipend',
    'Professional development budget',
    'Regular team retreats'
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="h-full w-full object-cover opacity-10"
            />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Join Our Team
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Help us revolutionize the mortgage industry with innovative technology.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-4 text-lg text-gray-500">
              The principles that guide everything we do
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.name} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{value.name}</h3>
                  <p className="mt-2 text-gray-500">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
              <p className="mt-4 text-lg text-gray-500">
                Join us in building the future of mortgage rate monitoring
              </p>
            </div>
            <div className="mt-12 grid gap-8">
              {openPositions.map((position) => (
                <div
                  key={position.title}
                  className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{position.title}</h3>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{position.department}</span>
                        <span className="text-sm text-gray-500">{position.location}</span>
                        <span className="text-sm text-gray-500">{position.type}</span>
                      </div>
                    </div>
                    <button className="flex items-center text-primary hover:text-primary-dark">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Benefits & Perks</h2>
            <p className="mt-4 text-lg text-gray-500">
              We take care of our team so they can focus on doing their best work
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors"
              >
                <p className="text-gray-900">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}