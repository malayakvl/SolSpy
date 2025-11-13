import { Link, type InertiaLinkProps } from '@inertiajs/react';
import { type ReactNode } from 'react';

// Extend InertiaLinkProps but make href optional since it will be passed through ...props
interface NavLinkProps extends Omit<InertiaLinkProps, 'href'> {
  active?: boolean;
  className?: string;
  children: ReactNode;
  href?: string;
}

export default function NavLink({
  active = false,
  className = '',
  children,
  ...props
}: NavLinkProps) {
  return (
    <Link {...props} className={'' + className}>
      {children}
    </Link>
  );
}