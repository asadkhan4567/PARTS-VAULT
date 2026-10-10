import { whatsappLink } from '@/lib/whatsapp'

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.6S23 3 16 3Zm0 23.1c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.2-4.2-.3-.4a10.4 10.4 0 0 1-1.6-5.5C5.3 9.8 10.1 5 16 5s10.6 4.8 10.6 10.6S21.9 26.1 16 26.1Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.8-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.5-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5 0-.1-.3-.2-.6-.4Z" />
    </svg>
  )
}

/** Floating WhatsApp button (above the mobile tab bar). */
export function WhatsAppFloat({ number }: { number: string }) {
  return (
    <a
      href={whatsappLink(number, 'Assalam o Alaikum! I need help finding a part.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-float"
      className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)] transition-transform hover:scale-105 md:bottom-6"
    >
      <WhatsAppIcon className="size-8" />
    </a>
  )
}
