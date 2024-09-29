'use client';
import SideNav from '@/app/ui/dashboard/sidenav';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserSubscriptionsAction } from '@/app/lib/actions';
// Create context
const SubscriptionContext = createContext(null);

// Custom hook to use the context
export function useSubscription() {
  return useContext(SubscriptionContext);
}
export default function Layout({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState(null);

  const fetchSubscriptionIfAny = async () => {
    const userSubscriptions = await getUserSubscriptionsAction();
    if (userSubscriptions.success) {
      setSubscription(userSubscriptions.subscription);
    }
  };

  useEffect(() => {
    fetchSubscriptionIfAny();
  }, []);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <SubscriptionContext.Provider value={subscription}>
        <div className="w-full flex-none md:w-16">
          <SideNav />
        </div>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
          {children}{' '}
        </div>
      </SubscriptionContext.Provider>
    </div>
  );
}
