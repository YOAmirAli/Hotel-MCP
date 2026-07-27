"use client"

interface WhatsAppButtonProps {
  phoneNumber: string // Format: 923001234567 (without +)
  message: string
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'outline' | 'small'
}

export default function WhatsAppButton({
  phoneNumber,
  message,
  children,
  className = '',
  variant = 'primary',
}: WhatsAppButtonProps) {
  // Clean phone number: remove +, spaces, dashes
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
  
  // WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`

  const variants = {
    primary: 'bg-[#25D366] text-white hover:bg-[#1da851] shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white',
    small: 'bg-[#25D366] text-white hover:bg-[#1da851] px-4 py-2 text-sm shadow-md',
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${variants[variant]} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5 fill-current"
      >
        <path d="M24 0C10.7 0 0 10.7 0 24c0 4.5 1.2 8.7 3.3 12.4L0 48l12.4-3.3C16.1 46.4 20 48 24 48c13.3 0 24-10.7 24-24S37.3 0 24 0z" />
        <path
          fill="#fff"
          d="M35.3 31.9c-.4.9-1.4 1.7-2.4 2.1-1.4.6-6.9.6-9.1-.1-1.1-.4-2.4-1.1-3.4-1.9-2.3-1.9-4.4-4.9-4.9-8.1-.1-.6-.1-1.1 0-1.6.1-.6.3-1.1.6-1.6.4-.7 1-1.1 1.7-1.3.7-.1 1.1-.1 1.6.1.6.1 1.1.7 1.4 1.3.3.6.6 1.4.9 2.1.3.6.6 1.3.9 1.9.3.6.4 1.3.4 1.9 0 .7-.3 1.3-.9 1.9-.6.6-1.1.9-1.1.9s.4 1 1.3 1.6c.9.7 2.1 1.1 3.1 1.3.6.1 1.3.1 1.9-.1.6-.1 1.3-.6 1.6-1.3.3-.6.6-1.4.9-2.1.3-.7.9-1.1 1.6-1.3.7-.1 1.3-.1 1.9.1.6.1 1.1.7 1.4 1.3.3.6.6 1.4.9 2.1.3.7.6 1.4.9 2.1.4.7.4 1.4.1 2.1z"
        />
      </svg>
      {children || "📱 Send via WhatsApp"}
    </a>
  )
}