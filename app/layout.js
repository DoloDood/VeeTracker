import './globals.css';

export const metadata = {
  title: 'VeeFriends Lister',
  description: 'Track your VeeFriends collection and list it to eBay.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div className="vfl">{children}</div>
      </body>
    </html>
  );
}
