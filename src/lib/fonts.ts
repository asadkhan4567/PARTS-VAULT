import { Inter, JetBrains_Mono, Noto_Nastaliq_Urdu, Rajdhani } from 'next/font/google'

export const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Only loaded on demand by the browser when Urdu text renders (preload off keeps LCP clean).
export const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-nastaliq',
  display: 'swap',
  preload: false,
})

export const fontVariables = [rajdhani, inter, jetbrainsMono, nastaliq]
  .map((f) => f.variable)
  .join(' ')
