import bcrypt from 'bcrypt'

/** Кілька «реєстрацій» підряд — лише щоб показати bcrypt.hash на різних паролях. */
const users = [
  { username: 'john', password: 'secret123' },
  { username: 'jane', password: 'hunter2' },
  { username: 'admin', password: 'correct-horse-battery-staple' },
]

for (const { username, password } of users) {
  console.log('---')
  console.log('login:', username)
  console.log('password:', password)
  const passwordHash = await bcrypt.hash(password, 6)
  console.log('passwordHash:', passwordHash)
}
