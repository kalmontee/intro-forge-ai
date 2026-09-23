import { JSX } from 'react';

export const Footer = (): JSX.Element => {
  return (
    <footer className="pt-6">
      <p className="text-meta text-muted">{`Developed by © Kelvin Almonte, ${new Date().getFullYear()}`}</p>
    </footer>
  );
};
