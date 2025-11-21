import { JSX } from 'react';
import { Main } from '@/components/Main';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-5">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
}
// max-w-[1400px]
