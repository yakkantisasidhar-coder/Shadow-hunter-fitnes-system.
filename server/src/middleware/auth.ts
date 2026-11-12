import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store.js';
import { UserRole, GymPermission } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'shadow_hunter_fitness_super_secure_jwt_secret_2025_prod_key';

export function signUserToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
      req.user = decoded;
      return next();
    } catch (err) {
      // If token fails, check fallback dev header if in dev
      if (process.env.NODE_ENV !== 'production' && devUserId) {
        const user = dbStore.findUserById(devUserId);
        if (user) {
          req.user = { id: user.id, email: user.email, role: user.role };
          return next();
        }
      }
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
  }

  // Developer fallback header
  if (devUserId) {
    const user = dbStore.findUserById(devUserId);
    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role };
      return next();
    }
  }

  return res.status(401).json({ error: 'Authentication credentials required' });
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Role '${req.user.role}' does not possess clearance for this operation.` 
      });
    }

    next();
  };
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Restricted: Super Administrator clearance required.' });
  }
  next();
}

/**
 * Enforces server-side granular gym permission and facility isolation.
 * Super Host (super_admin) retains platform-level override.
 * Gym Owners must have active gymAccess for the target gymId with the specific permission.
 */
export function requireGymPermission(permission: GymPermission, gymIdParam = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super Host has complete authority over all facilities
    if (req.user.role === 'super_admin') {
      return next();
    }

    const gymId = (req.params[gymIdParam] || req.body?.gymId || req.query?.gymId) as string;
    if (!gymId) {
      return res.status(400).json({ error: 'Gym facility ID is required for this operation.' });
    }

    const profile = dbStore.getUserProfile(req.user.id);
    if (!profile) {
      return res.status(403).json({ error: 'User profile not found.' });
    }

    if (profile.isSuspended) {
      return res.status(403).json({ error: 'Account is suspended by platform administration.' });
    }

    // Check gymAccess map
    const accessRecord = profile.gymAccess ? profile.gymAccess[gymId] : undefined;

    // Fallback: If user.gymId matches and user is gym_owner, grant default base access
    const isOwnerLegacy = profile.role === 'gym_owner' && profile.gymId === gymId && profile.gymStatus === 'approved';

    if (!accessRecord && !isOwnerLegacy) {
      return res.status(403).json({ 
        error: `Forbidden: You do not possess authorized clearance for gym facility '${gymId}'.` 
      });
    }

    if (accessRecord) {
      if (accessRecord.status === 'suspended') {
        return res.status(403).json({ 
          error: `Access Denied: Your privileges for this gym have been temporarily suspended by the Super Host.` 
        });
      }
      if (accessRecord.status === 'revoked') {
        return res.status(403).json({ 
          error: `Access Denied: Your privileges for this gym have been revoked by the Super Host.` 
        });
      }
      if (!accessRecord.permissions || !accessRecord.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: `Permission Denied: Missing required permission '${permission}' for this facility.` 
        });
      }
    }

    next();
  };
}

