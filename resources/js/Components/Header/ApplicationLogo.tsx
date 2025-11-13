import React from 'react';
import { Link } from '@inertiajs/react';

export default function ApplicationLogo() {
  return (
    <div className="relative">
        <Link href={'/'}>
            <img src="/images/header/logo.png" alt="Logo" />
        </Link>
    </div>
  );
}
