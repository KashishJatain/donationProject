import './globals.css'

export const metadata = {
  title: 'NGO Registration & Donation System',
  description: 'Support our cause',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}