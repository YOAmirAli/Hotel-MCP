"use client"

import Link from "next/link"

export default function HomePage() {
  const featuredRooms = [
    { name: "The Executive Atelier", price: 450, size: "55m²", bed: "King Bed", view: "City View" },
    { name: "Royal Horizon Suite", price: 820, size: "120m²", bed: "2 King Beds", view: "Ocean View" },
    { name: "Signature Wellness Loft", price: 1250, size: "85m²", bed: "Private Sauna", view: "Park View" },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/hero/1920/1080')"
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
          <Link
            href="/rooms"
            className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label-md text-label-md uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Explore Rooms
          </Link>
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

      {/* Featured Rooms */}
      <section className="bg-surface-container-low py-24 overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="font-label-sm text-secondary uppercase tracking-[0.3em]">The Collection</span>
              <h2 className="font-display-lg text-headline-md md:text-display-lg mt-4 text-primary">Featured Residences</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.name} className="bg-surface-container-lowest shadow-sm group rounded-xl overflow-hidden">
                <div className="relative h-[300px] overflow-hidden bg-surface-container-highest">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{
                      backgroundImage: `url('https://picsum.photos/seed/${room.name.replace(/\s/g, '')}/800/600')`
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 font-label-sm text-primary uppercase">
                    From ${room.price}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-headline-sm mb-2 text-primary">{room.name}</h3>
                  <div className="flex gap-4 text-on-surface-variant mb-6 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">square_foot</span> {room.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bed</span> {room.bed}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">visibility</span> {room.view}
                    </span>
                  </div>
                  <Link
                    href="/rooms"
                    className="w-full py-4 border border-primary text-primary font-label-md uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all block text-center rounded-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}