'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSubscription } from '@/app/dashboard/layout';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.

export default function NavLinks() {
  const pathname = usePathname();
  const subscription = useSubscription();

  const links = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, isValid: true },
    // {
    //   name: 'Invoices',
    //   href: '/dashboard/invoices',
    //   icon: DocumentDuplicateIcon,
    // },
    // { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
    {
      name: 'Template Validator',
      href: '/dashboard/validator',
      icon: DocumentDuplicateIcon,
      isValid: !!subscription?.length,
    },
  ];

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        if (!link.isValid) return null;
        return (
          <TooltipProvider key={link.name} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                    {
                      'bg-sky-100 text-blue-600': pathname === link.href,
                    }
                  )}
                  prefetch={true}
                >
                  <LinkIcon className="w-6 md:px-0" />
                  {/* <p className="hidden md:block"></p> */}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{link.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </>
  );
}
