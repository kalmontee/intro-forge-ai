import { JSX } from 'react';
import { Main } from '@/components/Main';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:py-8">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
}
