import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OrbiTier } from "@orbi/types";

interface JwtPayload {
  userId: string;
  tier: OrbiTier;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId: string;
      userTier: OrbiTier;
    }
  }
}

// -----------------------------------------------------------
// Auth Middleware
// -----------------------------------------------------------
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = payload.userId;
    req.userTier = payload.tier;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// -----------------------------------------------------------
// Tier Gate Middleware Factory
// -----------------------------------------------------------
export function requireTier(...tiers: OrbiTier[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!tiers.includes(req.userTier)) {
      res.status(403).json({
        success: false,
        error: "This feature requires a higher Orbi plan",
        requiredTiers: tiers,
        currentTier: req.userTier,
        upgradeUrl: "/settings/subscription",
      });
      return;
    }
    next();
  };
}

// Convenience gates
export const requireAgent = requireTier(OrbiTier.AGENT, OrbiTier.FULL);
export const requireFull   = requireTier(OrbiTier.FULL);
