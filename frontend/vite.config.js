import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Overwrites dist/robots.txt at build time (Phase 12) with the actual
 * backend origin in its `Sitemap:` line — see SitemapController.php's
 * docblock and public/robots.txt's own comment for the full reasoning.
 * `public/` files are copied verbatim with no way to interpolate an env
 * var into them, so this is a small build-time step instead of a second
 * static file to keep in sync. Derives the backend origin from the same
 * VITE_API_BASE_URL every API call already uses (stripping the trailing
 * /api) rather than needing a second env var that could drift from it.
 */
function generateRobotsTxt() {
  return {
    name: 'generate-robots-txt',
    apply: 'build',
    closeBundle() {
      const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '')
      const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8000/api'
      const backendOrigin = apiBase.replace(/\/api\/?$/, '')
      const contents = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /dashboard',
        'Disallow: /login',
        'Disallow: /register',
        '',
        `Sitemap: ${backendOrigin}/sitemap.xml`,
        '',
      ].join('\n')
      writeFileSync(resolve(process.cwd(), 'dist/robots.txt'), contents)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generateRobotsTxt()],
})
