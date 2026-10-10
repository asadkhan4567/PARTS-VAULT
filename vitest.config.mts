import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    // Each integration file boots Payload, which syncs the DB schema — run files one at a time.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.spec.ts', 'tests/int/**/*.int.spec.ts'],
  },
})
