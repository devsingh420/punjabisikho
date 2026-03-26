import './globals.css'

export const metadata = {
  title: 'ਗੁਰਮੁਖੀ — Learn Punjabi',
  description: 'The fun way to learn Punjabi for kids and adults',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
