"use client"

import Link from "next/link"

interface RoomCardProps {
  id: number
  roomNumber: string
  floor: number
  roomType: {
    id: number
    name: string
    description: string
    basePrice: number
    capacity: number
    amenities: string[]
    imageUrl: string | null
  }
  checkIn: string
  checkOut: string
  guests: number
  pricePerNight: number
  totalPrice: number
  nights: number
}

export default function RoomCard({
  id,
  roomNumber,
  floor,
  roomType,
  checkIn,
  checkOut,
  guests,
  pricePerNight,
  totalPrice,
  nights,
}: RoomCardProps) {
  return (
    <div className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-surface-container-highest"
          style={{
            backgroundImage: roomType.imageUrl
              ? `url(${roomType.imageUrl})`
              : `url('https://picsum.photos/seed/${roomType.name.replace(/\s/g, '')}${id}/800/600')`,
          }}
        />
        <div className="absolute top-4 left-4 bg-[#e6f4ea] text-[#1e4620] px-3 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider">
          Available
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary">{roomType.name}</h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Room {roomNumber} • Floor {floor}</p>
          </div>
          <div className="text-right">
            <span className="block font-headline-sm text-headline-sm text-secondary">${pricePerNight}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Per Night</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 py-2 border-y border-outline-variant/20">
          {roomType.amenities?.slice(0, 3).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-label-sm text-label-sm">{amenity}</span>
            </div>
          ))}
        </div>
        <Link
          href={{
            pathname: "/booking",
            query: {
              roomId: id,
              checkIn,
              checkOut,
              guests,
              price: pricePerNight,
              total: totalPrice,
              nights,
              roomName: roomType.name,
            },
          }}
          className="w-full border border-primary text-primary py-3 rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all uppercase tracking-widest text-center block"
        >
          Book Now
        </Link>
      </div>
    </div>
  )
}