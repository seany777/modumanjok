const REDTABLE_BASE_URL = 'https://seoul.openapi.redtable.global'

const RESOURCE_PATHS = {
  menus: '/api/menu/korean',
  restaurants: '/api/rstr',
  quality: '/api/rstr/qlt',
}

function sendJson(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')
  response.end(JSON.stringify(payload))
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { error: 'GET 요청만 사용할 수 있습니다.' })
  }

  const token = process.env.REDTABLE_API_TOKEN
  if (!token) return sendJson(response, 503, { error: 'Redtable API 토큰이 설정되지 않았습니다.' })

  const resource = String(request.query.resource || '')
  const path = RESOURCE_PATHS[resource]
  if (!path) return sendJson(response, 400, { error: '지원하지 않는 데이터 요청입니다.' })

  const pageNo = 1
  const url = new URL(path, REDTABLE_BASE_URL)
  url.searchParams.set('serviceKey', token)
  url.searchParams.set('pageNo', String(pageNo))

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!upstream.ok) throw new Error(`Redtable 응답 오류 (${upstream.status})`)

    const data = await upstream.json()
    if (data?.header?.resultCode && data.header.resultCode !== '00') {
      throw new Error(data.header.resultMsg || 'Redtable API 요청에 실패했습니다.')
    }

    return sendJson(response, 200, {
      page: data?.header?.pageNo || pageNo,
      totalCount: data?.header?.totalCount || 0,
      items: Array.isArray(data?.body) ? data.body : [],
    })
  } catch (error) {
    return sendJson(response, 502, { error: error.message || '식당 정보를 불러오지 못했습니다.' })
  }
}
