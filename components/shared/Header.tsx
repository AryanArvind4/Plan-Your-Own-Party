"use client";

import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "../ui/button";
import NavItems from './NavItems';
import MobileNav from './MobileNav';

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-36" aria-label="Go to homepage">
          <Image 
            src="/assets/images/logo.png" 
            width={110} 
            height={10}
            alt="PYOP logo" 
          />
        </Link>
        <SignedIn>
          <nav className='md:flex-between hidden w-full max-w-xs'>
            <NavItems />
          </nav>
        </SignedIn>
        <div className="flex w-32 justify-end gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl='/' />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button asChild className='rounded-full' size='sm'>
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Header;
