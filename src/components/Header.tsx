import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="bg-transparent">
      <div className="mx-auto px-2 py-2 flex items-center">
        <Image src="/introForgeLogo.png" alt="IntroForge AI Logo" className="filter brightness-0 invert" width={50} height={50} />
        <h1 className="text-2xl font-bold text-white">IntroForge AI</h1>
      </div>
    </header>
  );
};

export default Header;
