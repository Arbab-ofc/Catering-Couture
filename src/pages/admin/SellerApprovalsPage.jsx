import { useEffect, useState } from 'react'
import PrimaryButton from '../../components/common/PrimaryButton'
import { listSellerRequests, approveSellerRole } from '../../services/firebase/firestore'
import { logEvent, logError } from '../../services/logger'

const SellerApprovalsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await listSellerRequests()
        setRequests(data)
      } catch (error) {
        logError('approvals', 'load-failed', error)
      } finally {
        setLoading(false)
      }
    }
    load()
    logEvent('info', 'approvals', 'viewed')
  }, [])

  const approve = async (userId) => {
    try {
      await approveSellerRole(userId)
      setRequests((prev) => prev.filter((r) => r.id !== userId))
    } catch (error) {
      logError('approvals', 'approve-failed', error, { userId })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Admin</p>
        <h1 className="font-display text-3xl text-text-primary">Seller approvals</h1>
      </div>

      {loading && <p className="text-text-secondary">Loading requests...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-text-secondary">No pending seller requests.</p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-lg font-semibold text-text-primary">{req.name || 'User'}</p>
              <p className="text-sm text-text-secondary">{req.email}</p>
              <p className="text-xs text-text-secondary">Requested: Seller</p>
            </div>
            <PrimaryButton onClick={() => approve(req.id)}>Approve</PrimaryButton>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SellerApprovalsPage