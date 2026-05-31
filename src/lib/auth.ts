import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aj-kitchen-fallback-secret-change-in-production'
);

export const COOKIE_NAME = 'ajk_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type JWTPayload = {
  userId: string;
  email: string;
  fullName: string;
};

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
