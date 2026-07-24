import { notFound } from 'next/navigation'

interface RoomPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Room Details</h1>
      <p className="mt-4 text-gray-600">Room ID: {id}</p>
    </div>
  )
}
