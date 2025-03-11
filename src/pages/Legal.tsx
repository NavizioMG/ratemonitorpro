import { Shield, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Legal() {
  const location = useLocation();
  const isPrivacyPolicy = location.pathname === '/privacy';

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {isPrivacyPolicy ? (
                  <div className="flex items-center justify-center">
                    <Lock className="h-8 w-8 mr-2" />
                    Privacy Policy
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="h-8 w-8 mr-2" />
                    Terms of Service
                  </div>
                )}
              </h1>
              <p className="mt-4 text-lg text-gray-100">
                Last updated: March 15, 2024
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          {isPrivacyPolicy ? (
            <div className="prose prose-lg">
              <h2>Introduction</h2>
              <p>
                At Rate Monitor Pro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>

              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Client information you input into our system</li>
              </ul>

              <h3>Usage Information</h3>
              <p>We automatically collect certain information about your device and how you interact with our services, including:</p>
              <ul>
                <li>Log and usage data</li>
                <li>Device information</li>
                <li>Location information</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process your transactions</li>
                <li>Send you notifications and updates</li>
                <li>Improve our services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul>
                <li>Service providers</li>
                <li>Business partners</li>
                <li>Legal authorities when required</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Data portability</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@ratemonitorpro.com">privacy@ratemonitorpro.com</a>
              </p>
            </div>
          ) : (
            <div className="prose prose-lg">
              <h2>Agreement to Terms</h2>
              <p>
                By accessing or using Rate Monitor Pro's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>

              <h2>Use License</h2>
              <p>
                We grant you a limited, non-exclusive, non-transferable license to use our services for your mortgage business operations.
              </p>

              <h3>Restrictions</h3>
              <p>You may not:</p>
              <ul>
                <li>Modify or copy our software</li>
                <li>Use the service for any illegal purpose</li>
                <li>Transfer your account to another party</li>
                <li>Attempt to decompile or reverse engineer any portion of the service</li>
              </ul>

              <h2>Account Terms</h2>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information is accurate</li>
              </ul>

              <h2>Payment Terms</h2>
              <p>
                Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law.
              </p>

              <h2>Service Availability</h2>
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to our services. We reserve the right to modify or discontinue services with or without notice.
              </p>

              <h2>Data Usage</h2>
              <p>
                You retain all rights to your data. We may use aggregated, anonymized data for service improvement and analysis.
              </p>

              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account for violations of these terms. You may terminate your account at any time by contacting support.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify you of significant changes via email or through the service.
              </p>

              <h2>Contact Information</h2>
              <p>
                Questions about these Terms should be sent to{' '}
                <a href="mailto:legal@ratemonitorpro.com">legal@ratemonitorpro.com</a>
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-center space-x-8">
              <Link
                to="/privacy"
                className={`text-sm font-medium ${
                  isPrivacyPolicy ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className={`text-sm font-medium ${
                  !isPrivacyPolicy ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}