import Link from "next/link"

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmDwGmDvKufbJOTqS5AkFB2R4iDIylL1km2PsuNkv6QDyaj2mxxtDDyNw7wmFdBEiEQlReyel_COv454ExBsF_uqF2jeeXHR7seB6iO4yyZK2FlHFhJ2VH5RJ71kKOdi8GlW50AP15IF_2LwI-do1GHZAFrh17_mjgA5PO2Y04ZjIDm7gJQFp0yftzVHKAgz5sGm6_oTOS307ef2DUT4d0bfhFxtFxl8XLvZAvAegOm-4bs77C3yrI')"
          }}
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 text-center px-margin-mobile max-w-4xl">
          <h1 className="font-display-lg text-white text-5xl md:text-7xl mb-6 leading-tight">
            Your Private Sanctuary <br /> <span className="italic">in the Heart of the City</span>
          </h1>
          <p className="font-body-lg text-white/90 max-w-2xl mx-auto mb-12">
            Discover an unparalleled blend of editorial design and legendary service at LuxeStay.
          </p>
        </div>

        {/* Search widget (simplified) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-container-max px-margin-mobile z-30 hidden md:block">
          <div className="glass-panel p-8 shadow-xl border border-outline-variant/20 flex flex-wrap lg:flex-nowrap items-end gap-6 bg-white/85 backdrop-blur-md">
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase">Check-In</label>
              <input type="date" className="w-full bg-transparent border-none border-b border-outline py-2 focus:ring-0 font-body-md" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase">Check-Out</label>
              <input type="date" className="w-full bg-transparent border-none border-b border-outline py-2 focus:ring-0 font-body-md" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase">Guests</label>
              <select className="w-full bg-transparent border-none border-b border-outline p-0 py-2 focus:ring-0 font-body-md">
                <option>1 Adult</option>
                <option selected>2 Adults</option>
                <option>2 Adults, 1 Child</option>
              </select>
            </div>
            <Link
              href="/rooms"
              className="bg-primary text-on-primary px-10 py-4 rounded-DEFAULT font-label-md text-label-md uppercase tracking-widest hover:bg-primary-container transition-all self-stretch flex items-center justify-center"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <span className="font-label-sm text-secondary uppercase tracking-[0.3em]">The LuxeStay Standard</span>
          <h2 className="font-display-lg text-headline-md md:text-display-lg mt-4 text-primary">Elegance in Every Detail</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: "diamond", title: "Uncompromising Luxury", desc: "From Egyptian cotton linens to hand‑selected artwork." },
            { icon: "location_on", title: "Prime Destinations", desc: "Strategically located in the cultural heartbeat of the city." },
            { icon: "temp_preferences_custom", title: "Intuitive Service", desc: "Our concierge team anticipates your needs before you do." },
          ].map((item) => (
            <div key={item.title} className="group p-8 border border-transparent hover:border-outline-variant/30 transition-all duration-500">
              <span className="material-symbols-outlined text-4xl text-secondary mb-6 block">{item.icon}</span>
              <h3 className="font-headline-sm mb-4 text-primary">{item.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms Slider – static version */}
      <section className="bg-surface-container-low py-24 overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex justify-between items-end mb-12">
          <div>
            <span className="font-label-sm text-secondary uppercase tracking-[0.3em]">The Collection</span>
            <h2 className="font-display-lg text-headline-md md:text-display-lg mt-4 text-primary">Featured Residences</h2>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto scrollbar-hide px-margin-mobile md:px-margin-desktop pb-8">
          {[
            { name: "The Executive Atelier", price: 450, size: "55m²", bed: "King Bed", view: "City View" },
            { name: "Royal Horizon Suite", price: 820, size: "120m²", bed: "2 King Beds", view: "Ocean View" },
            { name: "Signature Wellness Loft", price: 1250, size: "85m²", bed: "Private Sauna", view: "Park View" },
          ].map((room) => (
            <div key={room.name} className="flex-none w-[320px] md:w-[450px] bg-surface-container-lowest shadow-sm group">
              <div className="relative h-[300px] md:h-[400px] overflow-hidden bg-surface-container-highest">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 font-label-sm text-primary uppercase">From ${room.price}</div>
              </div>
              <div className="p-8">
                <h3 className="font-headline-sm mb-2 text-primary">{room.name}</h3>
                <div className="flex gap-4 text-on-surface-variant mb-6 text-sm">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">square_foot</span> {room.size}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">bed</span> {room.bed}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">cut</span> {room.view}</span>
                </div>
                <Link href="/rooms" className="w-full py-4 border border-primary text-primary font-label-md uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all block text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials etc. – you can add more from your design */}
    </div>
  )
}