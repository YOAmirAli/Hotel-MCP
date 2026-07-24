import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-surface-container-low border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-10 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="font-display-lg text-2xl text-primary">LuxeStay</div>
          <p className="text-on-surface-variant max-w-xs">
            Redefining modern luxury through minimalist design and unparalleled hospitality.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-outline-variant uppercase tracking-widest mb-2">Explore</span>
          <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">Terms of Service</Link>
          <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">Contact Us</Link>
          <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">Newsletter</Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-outline-variant uppercase tracking-widest mb-2">Connect</span>
          <div className="flex gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-all">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-all">
              <span className="material-symbols-outlined">alternate_email</span>
            </button>
          </div>
          <p className="text-on-surface-variant mt-4">© 2024 LuxeStay Hospitality Group</p>
        </div>
      </div>
    </footer>
  )
}