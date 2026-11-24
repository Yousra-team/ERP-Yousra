import { prisma } from "../source/lib/prisma"
import { hashPassword } from "../source/lib/password"

const [, , username, newPassword] = process.argv
if (!username || !newPassword) {
  console.error("Usage: bun scripts/reset-password.ts <username> <newPassword>")
  process.exit(1)
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.")
  process.exit(1)
}

const hash = await hashPassword(newPassword)
const user = await prisma.user.update({
  where: { username },
  data: { password: hash },
  select: { Id: true, username: true, role: true },
})
console.log("Updated:", user)
process.exit(0)
