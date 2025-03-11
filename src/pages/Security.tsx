import { MainLayout } from '../components/layout/MainLayout';
import { Shield, Lock, Key, Users, Database, FileCheck } from 'lucide-react';

export function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Bank-level encryption and security measures to protect your data.'
    },
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data is encrypted in transit and at rest using industry-standard protocols.'
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Role-based access control and multi-factor authentication support.'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Granular user permissions and detailed audit logs.'
    },
    {
      icon: Database,
      title: 'Data Protection',
      description: 'Regular backups and disaster recovery procedures.'
    },
    {
      icon: FileCheck,
      title: 'Compliance',
      description: 'SOC 2 Type II compliant and GDPR ready.'
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="h-full w-full object-cover opacity-10"
            />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Security First
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Your data security and privacy are our top priorities. Learn about our comprehensive security measures.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="relative">
                  <div className="absolute h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pl-16">
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Certifications */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900">Security Certifications</h2>
              <p className="mt-4 text-lg text-gray-500">
                We maintain the highest security standards in the industry.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white shadow-sm rounded-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900">SOC 2 Type II</h3>
                <p className="mt-4 text-gray-500">
                  Independently audited and certified for security, availability, and confidentiality.
                </p>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900">GDPR Compliant</h3>
                <p className="mt-4 text-gray-500">
                  Full compliance with EU data protection and privacy regulations.
                </p>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900">ISO 27001</h3>
                <p className="mt-4 text-gray-500">
                  Certified information security management system (ISMS).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Practices */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center">Security Practices</h2>
            <div className="mt-12 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Data Encryption</h3>
                <p className="mt-4 text-gray-500">
                  All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
                  We use industry-standard encryption protocols to ensure your data remains secure.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Access Control</h3>
                <p className="mt-4 text-gray-500">
                  We implement strict access controls and authentication mechanisms to ensure
                  only authorized users can access sensitive data. Multi-factor authentication
                  is available for all accounts.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Regular Audits</h3>
                <p className="mt-4 text-gray-500">
                  We conduct regular security audits and penetration testing to identify and
                  address potential vulnerabilities. Our security measures are continuously
                  monitored and updated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900">Have Security Questions?</h2>
              <p className="mt-4 text-lg text-gray-500">
                Our security team is here to help. Contact us for any security-related inquiries.
              </p>
              <div className="mt-8">
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                >
                  Contact Security Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}