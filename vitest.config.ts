import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/server/lib/**/*.ts', 'src/server/domain/**/*.ts'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
    },
  },
})
