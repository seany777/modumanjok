const stripTags = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'GET 요청만 지원합니다.' })
  }

  const clientId = process.env.NAVER_API_HUB_CLIENT_ID
  const clientSecret = process.env.NAVER_API_HUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return response.status(503).json({ error: 'NAVER API HUB 인증 정보가 설정되지 않았습니다.' })
  }

  const query = String(request.query.query || '').trim().slice(0, 80)
  if (!query) return response.status(400).json({ error: '검색어가 필요합니다.' })

  try {
    const url = new URL('https://naverapihub.apigw.ntruss.com/search/v1/local')
    url.searchParams.set('query', query)
    url.searchParams.set('display', '5')
    url.searchParams.set('start', '1')
    url.searchParams.set('sort', 'comment')
    url.searchParams.set('format', 'json')
    const result = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
        Accept: 'application/json',
      },
    })
    const data = await result.json()
    if (!result.ok) return response.status(result.status).json({ error: data.errorMessage || data.message || '네이버 지역 검색에 실패했습니다.' })

    response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return response.status(200).json({
      items: (data.items || []).map((item, index) => ({
        id: `naver-${item.mapx}-${item.mapy}-${index}`,
        name: stripTags(item.title),
        address: item.roadAddress || item.address || '주소 정보 없음',
        phone: item.telephone || '',
        category: stripTags(item.category),
        link: item.link || '',
        lng: Number(item.mapx) / 10000000,
        lat: Number(item.mapy) / 10000000,
        rating: null,
      })),
    })
  } catch (error) {
    return response.status(502).json({ error: error.message || '네이버 지역 검색을 불러오지 못했습니다.' })
  }
}
