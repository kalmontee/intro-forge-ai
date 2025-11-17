import { JSX } from 'react';
import { Main } from '@/components/Main';

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Main />
      </div>
    </div>
  );
}
