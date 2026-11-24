import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const alg = "HS256";

// Read the secret lazily so it sees the env after dotenv.config() runs.
// Reading at module load would freeze an empty key: ES-module imports
// evaluate before server.ts's dotenv.config() statement.
function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(raw);
}

export interface AuthPayload extends JWTPayload {
  userId: string;
  role: string;        // e.g. "HR_ADMIN", "EMPLOYEE"
}

export async function signAccessToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d") // Untill Franck learns to use Refresh Tokens
    .sign(getSecret());
}

export async function signRefreshToken(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken<T extends JWTPayload = AuthPayload>(
  token: string,
): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T;
}
