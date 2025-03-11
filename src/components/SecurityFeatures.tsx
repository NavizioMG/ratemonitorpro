import { Shield, Lock, Key, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export function SecurityFeatures() {
  const features = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Bank-level encryption and security protocols protect your sensitive data at all times.'
    },
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.'
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Role-based access control and multi-factor authentication ensure only authorized access.'
    },
    {
      icon: Database,
      title: 'Regular Backups',
      description: 'Automated daily backups with point-in-time recovery capabilities.'
    },
    {
      icon: CheckCircle,
      title: 'Compliance Ready',
      description: 'Built to meet financial industry compliance requirements and data protection standards.'
    },
    {
      icon: AlertTriangle,
      title: 'Proactive Monitoring',
      description: '24/7 security monitoring and threat detection to prevent unauthorized access.'
    }
  ];

  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Enterprise-Grade Security
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Your data security and privacy are our top priorities
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex rounded-lg p-3 bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            Your Security is Our Priority
          </h3>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We employ multiple layers of security measures to protect your sensitive mortgage data. 
            Our platform is built with security-first architecture and undergoes regular security audits 
            to ensure your information remains safe and confidential.
          </p>
          <div className="mt-8 inline-flex items-center space-x-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-medium">SOC 2 Type II Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}