import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const alg = "HS256";

export interface AuthPayload extends JWTPayload {
  userId: string;
  role: string;        // e.g. "HR_ADMIN", "EMPLOYEE"
}

export async function signAccessToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d") // Untill Franck learns to use Refresh Tokens
    .sign(secret);
}

export async function signRefreshToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken<T extends JWTPayload = AuthPayload>(
  token: string,
): Promise<T> {
  const { payload } = await jwtVerify(token, secret);
  return payload as T;
}