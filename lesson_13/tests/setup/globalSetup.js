import { execSync } from 'node:child_process'

export default function setup() {
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db',
    },
    stdio: 'pipe',
  })
}
