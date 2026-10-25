const stripTags = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()

const specialistRules = {
  '제육볶음': ['제육', '두루치기', '한식', '백반'],
  '치킨': ['치킨', '닭강정', '통닭'],
  '피자': ['피자'],
  '햄버거': ['햄버거', '버거'],
  '초밥': ['초밥', '스시', '회전초밥'],
  '라멘': ['라멘', '일본식라면'],
  '돈까스': ['돈가스', '돈까스'],
  '떡볶이': ['떡볶이'],
  '마라탕': ['마라탕', '마라'],
  '김치찌개': ['김치찌개', '찌개', '한식'],
  '비빔밥': ['비빔밥', '한식'],
  '파스타': ['파스타', '스파게티', '이탈리아음식'],
  '쌀국수': ['쌀국수', '베트남음식'],
  '샤브샤브': ['샤브샤브', '샤브'],
  '카레': ['카레', '커리', '인도음식', '돈가스', '돈까스', '덮밥'],
  '냉면': ['냉면'],
  '채소죽': ['채소죽', '야채죽'],
  '구운 채소': ['구운채소', '구운 채소', '채소구이', '야채구이'],
  '감자구이': ['감자구이', '구운감자'],
  '흰쌀밥과 나물': ['나물밥', '산채비빔밥', '나물'],
  '채소쌀국수': ['채소쌀국수', '야채쌀국수', '쌀국수', '베트남음식'],
  '채소찜': ['채소찜', '야채찜', '채식', '비건'],
}

const matchesSpecialistCategory = (item, menu) => {
  const keywords = specialistRules[menu]
  if (!keywords) return true
  const searchable = stripTags(`${item.title} ${item.category} ${item.description}`).toLowerCase()
  return keywords.some((keyword) => searchable.includes(keyword))
}

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
  const menu = String(request.query.menu || '').trim().slice(0, 30)
  if (!query) return response.status(400).json({ error: '검색어가 필요합니다.' })

  try {
    const url = new URL('https://naverapihub.apigw.ntruss.com/search/v1/local')
    url.searchParams.set('query', query)
    url.searchParams.set('display', '5')
    url.searchParams.set('start', '1')
    url.searchParams.set('sort', 'random')
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
      items: (data.items || []).filter((item) => matchesSpecialistCategory(item, menu)).map((item, index) => ({
        id: `naver-${item.mapx}-${item.mapy}-${index}`,
        name: stripTags(item.title),
        address: item.roadAddress || item.address || '주소 정보 없음',
        phone: item.telephone || '',
        category: stripTags(item.category),
        link: item.link || '',
        lng: Number(item.mapx) / 10000000,
        lat: Number(item.mapy) / 10000000,
      })),
    })
  } catch (error) {
    return response.status(502).json({ error: error.message || '네이버 지역 검색을 불러오지 못했습니다.' })
  }
}
