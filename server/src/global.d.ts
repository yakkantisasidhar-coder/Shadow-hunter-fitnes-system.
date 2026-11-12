import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  // Extend with any custom fields if needed. For now, inherit all Request properties.
}
