import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['node-hid', 'usb'],
      },
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['node-hid', 'usb'],
      },
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: {
      rollupOptions: {
        external: ['node-hid', 'usb'],
      },
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [
      react(),
      svgr(),
      nodePolyfills({
        include: ['crypto', 'util', 'stream', 'querystring'],
      }),
    ],
  },
})
