import { useEffect, useState } from 'react'
import PrimaryButton from '../../components/common/PrimaryButton'
import {
  listAllUsers,
  approveSellerRole,
  deleteUserDoc,
  updateUserRole,
} from '../../services/firebase/firestore'
import { logEvent, logError } from '../../services/logger'

const DashboardPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await listAllUsers()
      setUsers(data)
    } catch (error) {
      logError('dashboard', 'load-users-failed', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    logEvent('info', 'dashboard', 'viewed')
  }, [])

  const approveSeller = async (uid) => {
    try {
      await approveSellerRole(uid)
      await loadUsers()
    } catch (error) {
      logError('dashboard', 'approve-failed', error, { uid })
    }
  }

  const deleteUser = async (uid) => {
    try {
      await deleteUserDoc(uid)
      setUsers((prev) => prev.filter((u) => u.id !== uid))
    } catch (error) {
      logError('dashboard', 'delete-user-failed', error, { uid })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Admin</p>
          <h1 className="font-display text-3xl text-text-primary">Dashboard</h1>
        </div>
        <PrimaryButton variant="outline" onClick={loadUsers} loading={loading}>
          Refresh
        </PrimaryButton>
      </div>

      {loading && <p className="text-text-secondary">Loading users...</p>}
      {!loading && users.length === 0 && (
        <p className="text-text-secondary">No users found.</p>
      )}

      <div className="grid gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {user.name || 'User'}{' '}
                <span className="text-xs uppercase text-text-secondary">{user.role}</span>
              </p>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <p className="text-xs text-text-secondary">
                {user.requestedRole ? `Requested: ${user.requestedRole}` : 'No pending request'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.requestedRole === 'seller' && (
                <PrimaryButton variant="outline" onClick={() => approveSeller(user.id)}>
                  Approve seller
                </PrimaryButton>
              )}
              {user.role !== 'user' && (
                <PrimaryButton
                  variant="outline"
                  onClick={() => updateUserRole(user.id, 'user').then(loadUsers)}
                >
                  Set user
                </PrimaryButton>
              )}
              {user.role !== 'seller' && (
                <PrimaryButton
                  variant="outline"
                  onClick={() => updateUserRole(user.id, 'seller').then(loadUsers)}
                >
                  Set seller
                </PrimaryButton>
              )}
              {user.role !== 'admin' && (
                <PrimaryButton
                  variant="outline"
                  onClick={() => updateUserRole(user.id, 'admin').then(loadUsers)}
                >
                  Set admin
                </PrimaryButton>
              )}
              <PrimaryButton variant="outline" onClick={() => deleteUser(user.id)}>
                Delete
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
