import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'AgroVet Admin Portal',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              padding: '16px',
              fontWeight: '600',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}