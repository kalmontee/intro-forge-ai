import { JSX } from 'react';

export const Footer = (): JSX.Element => {
  return (
    <footer>
      <div className="container flex items-center justify-center pt-5">
        <p className="text-white font-bold text-sm">{`Developed by © Kelvin Almonte, ${new Date().getFullYear()}`}</p>
      </div>
    </footer>
  );
};
