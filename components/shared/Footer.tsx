import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t p-2 md:p-4">
      <div className="wrapper flex-between flex-col sm:flex-row items-center text-center gap-2">
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/assets/images/logo.png"
            alt="logo"
            width={110}
            height={10}
          />
        </Link>
        <p className="text-sm lg:text-base">2024 PYOP. All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
