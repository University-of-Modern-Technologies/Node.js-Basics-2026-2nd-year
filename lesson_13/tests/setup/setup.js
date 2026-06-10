import { beforeEach, vi } from 'vitest'

import prisma from '../../prisma/client.js'

vi.mock('../../src/services/cloudinary.js', () => ({
  uploadAvatar: vi.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/avatar.jpg',
    public_id: 'avatars/user_1',
  }),
}))

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.todo.deleteMany()
  await prisma.user.deleteMany()
})
