import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  userId: string;
};

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}
