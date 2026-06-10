import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    execArgv: ['--no-deprecation'],
    environment: 'node',
    globals: true,
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET:
        'test-secret-key-at-least-256-bits-long-for-testing-purposes-only',
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.js'],
          globalSetup: ['./tests/setup/globalSetup.js'],
          setupFiles: ['./tests/setup/setup.js'],
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.js'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['app.js', 'src/**/*.js'],
      exclude: ['src/routes/**'],
      reporter: ['text', 'html'],
    },
  },
})
