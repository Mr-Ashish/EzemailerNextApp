// 'use client';
import { CheckCircle, Clock } from 'lucide-react'; // Icons for feature status
import PaymentButton from '@/components/ui/paymentButton';

export default function Dashboard() {
  // Plans available in the tool
  const plans = [
    {
      id: 1,
      name: 'Basic Plan',
      price: '$2',
      amount: 2,
      features: ['2 Template Creations', '5 Updates per Template'],
    },
    {
      id: 2,
      name: 'Pro Plan',
      price: '$5',
      amount: 5,
      features: ['Unlimited Template Creation', 'Unlimited Updates'],
    },
  ];

  // Implemented features with descriptions
  const implementedFeatures = [
    {
      name: 'HTML to Email Conversion',
      description: 'Convert HTML code to email-compatible HTML easily.',
      status: 'Implemented', // Status for visual indicators
      icon: <CheckCircle className="text-green-500" />,
    },
    {
      name: 'Template Preview (Original & Transformed)',
      description: 'View both original and transformed templates side by side.',
      status: 'Implemented',
      icon: <CheckCircle className="text-green-500" />,
    },
    {
      name: 'Download Minified Files',
      description:
        'Download both original and transformed templates in minified form.',
      status: 'Implemented',
      icon: <CheckCircle className="text-green-500" />,
    },
    {
      name: 'Live Edit Transformed Templates',
      description: 'Make real-time changes to the transformed templates.',
      status: 'Implemented',
      icon: <CheckCircle className="text-green-500" />,
    },
    {
      name: 'Error Detection for Unsupported Styling/Tags',
      description: 'Warns you about unsupported styles or tags.',
      status: 'Implemented',
      icon: <CheckCircle className="text-green-500" />,
    },
  ];

  // Upcoming features
  const upcomingFeatures = [
    {
      name: 'Email Client Previews',
      status: 'Upcoming',
      icon: <Clock className="text-yellow-500" />,
    },
    {
      name: 'Send Test Email to Yourself',
      status: 'Upcoming',
      icon: <Clock className="text-yellow-500" />,
    },
    {
      name: 'Mobile View Email Preview',
      status: 'Upcoming',
      icon: <Clock className="text-yellow-500" />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-10">
        {/* Plans Section */}
        <h1 className="mb-6 text-3xl font-bold">Choose a Plan</h1>
        <div className="mb-8 grid grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border p-6 shadow-md">
              <h2 className="mb-2 text-xl font-semibold">{plan.name}</h2>
              <p className="mb-4 text-2xl font-bold">
                {plan.price} (One time Payment)
              </p>
              <ul className="mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {feature}
                  </li>
                ))}
              </ul>
              <PaymentButton amount={plan.amount} />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <h1 className="mb-6 text-3xl font-bold">Features Available</h1>
        <div className="grid grid-cols-2 gap-6">
          {implementedFeatures.map((feature, index) => (
            <div key={index} className="rounded-lg border p-4 shadow-md">
              <div className="flex items-center">
                {feature.icon}
                <h2 className="ml-4 text-xl font-semibold">{feature.name}</h2>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Upcoming Features Section */}
        <h1 className="mb-6 mt-10 text-3xl font-bold">Upcoming Features</h1>
        <div className="grid grid-cols-2 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="rounded-lg border p-4 shadow-md">
              <div className="flex items-center">
                {feature.icon}
                <h2 className="ml-4 text-xl font-semibold">{feature.name}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
