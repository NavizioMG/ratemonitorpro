import { Building2, Users, Globe2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function About() {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: '15+ years in mortgage industry, former Senior Loan Officer'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: 'Former Tech Lead at major fintech companies'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      bio: '10+ years product management in financial services'
    }
  ];

  const values = [
    {
      icon: Target,
      name: 'Mission-Driven',
      description: 'Our mission is to empower mortgage professionals with the tools they need to succeed.'
    },
    {
      icon: Users,
      name: 'Client-Focused',
      description: 'We put our clients first and build solutions that address their real needs.'
    },
    {
      icon: Globe2,
      name: 'Innovation',
      description: 'We continuously innovate to stay ahead of industry changes and technological advances.'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Our Story
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Building the future of mortgage rate monitoring and client management
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Rate Monitor Pro was founded with a simple mission: to help mortgage professionals serve their clients better through technology. We understand the challenges of staying on top of rate changes while managing a growing client base.
              </p>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Our platform combines real-time rate monitoring with powerful client management tools, making it easier for mortgage professionals to focus on what matters most - helping their clients achieve their homeownership dreams.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
              <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl tracking-tight font-bold text-gray-900 sm:text-4xl">Our Values</h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                The principles that guide everything we do
              </p>
            </div>
            <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
              {values.map((value) => (
                <div key={value.name} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                        <value.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="mt-4 text-xl font-semibold text-gray-900">{value.name}</p>
                      <p className="mt-3 text-base text-gray-500">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white">
          <div className="mx-auto py-12 px-4 max-w-7xl sm:px-6 lg:px-8 lg:py-24">
            <div className="space-y-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Team</h2>
              <ul className="space-y-12 lg:grid lg:grid-cols-3 lg:items-start lg:gap-x-8 lg:gap-y-12 lg:space-y-0">
                {team.map((person) => (
                  <li key={person.name}>
                    <div className="space-y-4">
                      <div className="aspect-w-3 aspect-h-2">
                        <img className="object-cover shadow-lg rounded-lg" src={person.image} alt="" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">{person.name}</h3>
                        <p className="text-primary">{person.role}</p>
                      </div>
                      <div className="text-lg">
                        <p className="text-gray-500">{person.bio}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to see it in action?</span>
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