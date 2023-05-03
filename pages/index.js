import Head from 'next/head'
import { Open_Sans, Noto_Sans_JP, Noto_Sans_TC } from 'next/font/google'
import App from '@/components/app'

const open_sans = Open_Sans({ subsets: ['latin', 'latin-ext'] })
const noto_sans_jp = Noto_Sans_JP({ weight: '400', preload: false })
const noto_sans_tc = Noto_Sans_TC({ weight: '400', preload: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>背單字</title>
        <meta name="description" content="背單字.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style global jsx>{`
        html {
          font-family: ${open_sans.className} ${noto_sans_jp.className} ${noto_sans_tc.className};
        }
      `}</style>
      <main>
        <App />
      </main>
    </>
  )
}
