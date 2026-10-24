import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const redtablePaths = {
  menus: '/api/menu/korean',
  restaurants: '/api/rstr',
  quality: '/api/rstr/qlt',
}

function localRedtableApi(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    name: 'local-redtable-api',
    configureServer(server) {
      server.middlewares.use('/api/redtable', async (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        const query = new URL(request.url || '/', 'http://localhost').searchParams
        const path = redtablePaths[query.get('resource')]
        if (!env.REDTABLE_API_TOKEN) {
          response.statusCode = 503
          return response.end(JSON.stringify({ error: '로컬 REDTABLE_API_TOKEN이 설정되지 않았습니다.' }))
        }
        if (!path) {
          response.statusCode = 400
          return response.end(JSON.stringify({ error: '지원하지 않는 데이터 요청입니다.' }))
        }
        try {
          const upstream = new URL(path, 'https://seoul.openapi.redtable.global')
          upstream.searchParams.set('serviceKey', env.REDTABLE_API_TOKEN)
          upstream.searchParams.set('pageNo', '1')
          const result = await fetch(upstream, { headers: { Accept: 'application/json' } })
          const data = await result.json()
          response.statusCode = result.ok ? 200 : result.status
          response.end(JSON.stringify({
            page: data?.header?.pageNo || 1,
            totalCount: data?.header?.totalCount || 0,
            items: Array.isArray(data?.body) ? data.body : [],
            ...(!result.ok ? { error: data?.header?.resultMsg || 'Redtable API 요청에 실패했습니다.' } : {}),
          }))
        } catch (error) {
          response.statusCode = 502
          response.end(JSON.stringify({ error: error.message || '식당 정보를 불러오지 못했습니다.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localRedtableApi(mode)],
}))
