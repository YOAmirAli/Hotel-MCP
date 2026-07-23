"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Registration {
  id: number
  hotelName: string
  managerEmail: string
  managerFirstName: string
  managerLastName: string
  status: string
  submittedAt: string
  description: string
  adminNotes: string
  manager: { firstName: string; lastName: string; email: string }
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Registration | null>(null)
  const [notes, setNotes] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  async function fetchRegistrations() {
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setRegistrations(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(registrationId: number, action: 'approve' | 'reject') {
    try {
      const res = await fetch('/api/admin/approve-hotel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          registrationId,
          action,
          notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchRegistrations()
        setSelected(null)
        setNotes('')
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Failed to process registration')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading registrations...</div>
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Hotel Registrations</h2>
        <p className="text-on-surface-variant">Review and approve hotel registration requests</p>
      </header>

      <div className="space-y-4">
        {registrations.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">No registrations found</div>
        ) : (
          registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-6 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="font-title-lg text-primary">{reg.hotelName}</h3>
                  <span
                    className={`px-3 py-1 rounded font-label-sm text-[10px] uppercase tracking-wide ${
                      reg.status === 'pending'
                        ? 'bg-[#FFF8E1] text-[#F57C00]'
                        : reg.status === 'approved'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Manager: {reg.managerFirstName} {reg.managerLastName} ({reg.managerEmail})
                </p>
                <p className="text-on-surface-variant text-sm">
                  Submitted: {new Date(reg.submittedAt).toLocaleDateString()}
                </p>
                {reg.description && (
                  <p className="text-on-surface-variant text-sm mt-2 line-clamp-2">{reg.description}</p>
                )}
              </div>
              {reg.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelected(reg)
                      setNotes('')
                    }}
                    className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90"
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">{selected.hotelName}</h3>
                <p className="text-on-surface-variant">Registration #{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-label-sm text-on-surface-variant">Manager</p>
                  <p className="font-body-md text-primary">
                    {selected.managerFirstName} {selected.managerLastName}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Email</p>
                  <p className="font-body-md text-primary">{selected.managerEmail}</p>
                </div>
              </div>
              {selected.hotelAddress && (
                <div>
                  <p className="font-label-sm text-on-surface-variant">Address</p>
                  <p className="font-body-md text-primary">{selected.hotelAddress}</p>
                </div>
              )}
              {selected.description && (
                <div>
                  <p className="font-label-sm text-on-surface-variant">Description</p>
                  <p className="font-body-md text-primary">{selected.description}</p>
                </div>
              )}
              <div>
                <label className="font-label-sm text-on-surface-variant">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 p-3 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none"
                  rows={3}
                  placeholder="Add any notes about this registration..."
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end border-t border-outline-variant/30 pt-6">
              <button
                onClick={() => {
                  handleAction(selected.id, 'reject')
                }}
                className="px-6 py-3 border border-error text-error rounded-lg font-label-md hover:bg-error-container transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleAction(selected.id, 'approve')
                }}
                className="px-6 py-3 bg-[#386a20] text-white rounded-lg font-label-md hover:opacity-90 transition-all"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}