// src/lib/password.ts
export async function hashPassword(plain: string): Promise<string> {
  return await Bun.password.hash(plain, {
    algorithm: "bcrypt",
    cost: 10, // same as bcrypt's saltRounds
  });
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return await Bun.password.verify(plain, hash);
}