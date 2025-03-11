import { 
  TrendingUp, 
  Bell, 
  Shield, 
  Zap,
  Users,
  BarChart3,
  Mail,
  MessageSquare,
  Smartphone,
  Lock,
  RefreshCw,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Features() {
  const features = [
    {
      category: "Rate Monitoring",
      items: [
        {
          icon: TrendingUp,
          title: "Real-Time Rate Tracking",
          description: "Monitor mortgage rates in real-time with automatic updates throughout the day."
        },
        {
          icon: Bell,
          title: "Custom Rate Alerts",
          description: "Set custom rate thresholds and receive instant notifications when targets are met."
        },
        {
          icon: RefreshCw,
          title: "Historical Rate Analysis",
          description: "Access historical rate data and trends to make informed decisions."
        }
      ]
    },
    {
      category: "Client Management",
      items: [
        {
          icon: Users,
          title: "Client Portfolio",
          description: "Organize and manage your client base with detailed profiles and preferences."
        },
        {
          icon: Database,
          title: "Loan Tracking",
          description: "Track loan details, terms, and status for each client in one place."
        },
        {
          icon: BarChart3,
          title: "Performance Analytics",
          description: "Monitor your success rates and client engagement with detailed analytics."
        }
      ]
    },
    {
      category: "Communication",
      items: [
        {
          icon: Mail,
          title: "Automated Notifications",
          description: "Send automated updates to clients when rates match their criteria."
        },
        {
          icon: MessageSquare,
          title: "Client Portal",
          description: "Provide clients with their own portal to view rates and loan status."
        },
        {
          icon: Smartphone,
          title: "Mobile Optimized",
          description: "Access your dashboard and receive alerts on any device."
        }
      ]
    },
    {
      category: "Security & Compliance",
      items: [
        {
          icon: Shield,
          title: "Data Protection",
          description: "Enterprise-grade security to protect sensitive client information."
        },
        {
          icon: Lock,
          title: "Role-Based Access",
          description: "Control access levels for team members and administrators."
        },
        {
          icon: Zap,
          title: "Audit Trails",
          description: "Track all system activities with detailed audit logs."
        }
      ]
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
                Powerful Features for Mortgage Professionals
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Everything you need to streamline your mortgage business and provide better service to your clients.
              </p>
              <div className="mt-10">
                <Link
                  to="/auth?signup=true"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{category.category}</h2>
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {category.items.map((feature, index) => (
                  <div key={index} className="relative">
                    <div>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                        {feature.title}
                      </p>
                    </div>
                    <div className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-primary">Try Rate Monitor Pro today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/auth?signup=true"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  Get started
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}