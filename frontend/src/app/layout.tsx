import { LanguageProvider } from '../components/context/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'ORUS SAGE - AI Communication Platform',
  description: 'Your cognitive partner powered by ORUS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="bg-gray-950 text-white antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}