import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="mb-5 lg:mb-6">
      <div className="flex items-center gap-2">
        <Image src="/introForgeLogo.png" alt="" width={44} height={44} priority />
        <h1 className="text-title font-semibold tracking-tight text-slate">IntroForge AI</h1>
      </div>
    </header>
  );
};

export default Header;
