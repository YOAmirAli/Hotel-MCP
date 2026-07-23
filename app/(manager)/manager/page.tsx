'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface ManagerData {
  registrationRequest: { status: string; hotelName: string; adminNotes: string | null } | null
  hotel: { name: string; status: string } | null
  canManageListing: boolean
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manager/hotel')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  const status = data?.registrationRequest?.status ?? 'none'
  const canManage = data?.canManageListing

  return (
    <div>
      <h1 className="text-3xl font-bold text-on-surface mb-2">Manager Overview</h1>
      <p className="text-on-surface-variant mb-8">
        Submit your hotel for admin approval, then complete your listing once approved.
      </p>

      <Card title="Registration Status" className="mb-6">
        {status === 'none' && (
          <div>
            <p className="text-on-surface-variant mb-4">
              You haven&apos;t submitted a hotel registration yet.
            </p>
            <Link
              href="/register/hotel"
              className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm"
            >
              Register Your Hotel
            </Link>
          </div>
        )}
        {status === 'pending' && (
          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              Pending Admin Approval
            </span>
            <p className="mt-3 text-on-surface-variant">
              Your request for <strong>{data?.registrationRequest?.hotelName}</strong> is awaiting admin review.
              You&apos;ll be notified once approved.
            </p>
          </div>
        )}
        {status === 'rejected' && (
          <div>
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Rejected
            </span>
            {data?.registrationRequest?.adminNotes && (
              <p className="mt-3 text-on-surface-variant">
                Admin notes: {data.registrationRequest.adminNotes}
              </p>
            )}
          </div>
        )}
        {status === 'approved' && (
          <div>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Approved
            </span>
            <p className="mt-3 text-on-surface-variant">
              Your hotel <strong>{data?.hotel?.name}</strong> has been approved. Complete your profile and add rooms.
            </p>
            {canManage && (
              <div className="flex gap-3 mt-4">
                <Link href="/manager/profile" className="text-primary hover:underline text-sm">
                  Complete Profile →
                </Link>
                <Link href="/manager/rooms" className="text-primary hover:underline text-sm">
                  Add Rooms →
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
