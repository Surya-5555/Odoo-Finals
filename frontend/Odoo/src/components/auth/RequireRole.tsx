import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export type Role = 'ADMIN' | 'PORTAL' | 'INTERNAL'

export function RequireRole({
  roles,
  children,
  redirectTo,
}: {
  roles: Role[]
  children: React.ReactElement
  redirectTo?: string
}) {
  const { accessToken, user, isMeLoading, isMeReady } = useAuth()
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Wait for the first /users/me sync so role-based redirects use DB truth.
  if (!isMeReady) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="text-sm text-muted-foreground">Syncing account…</div>
      </div>
    )
  }

  // While we are syncing /users/me, avoid flashing the wrong UI.
  if (isMeLoading && !user) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  if (!user?.role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!roles.includes(user.role)) {
    // Role mismatch: send the user to the right area.
    if (redirectTo) return <Navigate to={redirectTo} replace />
    if (user.role === 'PORTAL') return <Navigate to="/portal/home" replace />
    return <Navigate to="/app/overview" replace />
  }

  return children
}
