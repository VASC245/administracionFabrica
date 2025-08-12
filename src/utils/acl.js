// ACL simple: un rol por usuario ('admin' | 'opera' | 'supervisor')

export function canAccess(userRolOrRoles, allowedRoles = []) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true

  // soporta también array de roles por si lo usas en otro lado
  if (Array.isArray(userRolOrRoles)) {
    const set = new Set(userRolOrRoles.map(String))
    return allowedRoles.some(r => set.has(String(r)))
  }
  return allowedRoles.includes(String(userRolOrRoles))
}

export function hasRole(userRol, roles) {
  return canAccess(userRol, roles)
}

export function canAccessRoute(userRolOrRoles, meta = {}) {
  const allowed = Array.isArray(meta.roles) ? meta.roles : []
  return canAccess(userRolOrRoles, allowed)
}
