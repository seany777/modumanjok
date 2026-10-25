const ACTOR_ID = 'xvg44GCreVkeViPQ8'
const DAY = 24 * 60 * 60 * 1000
const cache = new Map()
const pending = new Map()
const attempts = new Map()

const normalize = (value = '') => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
const addressKey = (value) => normalize(String(value).replace(/서울특별시|서울시/g, '서울').replace(/경기도/g, '경기').replace(/(부산|대구|인천|광주|대전|울산)광역시/g, '$1'))

export function extractPlaceRating(rows, name, address) {
  const expectedAddress = addressKey(address)
  const matched = rows.filter((row) => {
    if (normalize(row.placeName) !== normalize(name)) return false
    const foundAddress = addressKey(row.placeAddress)
    return expectedAddress.length >= 8 && foundAddress.length >= 8
      && (foundAddress.includes(expectedAddress) || expectedAddress.includes(foundAddress))
  })
  // Never substitute the score from the one sampled visitor review.
  const aggregate = matched.find((row) => row.reviewType === 'place_stats') || matched[0]
  const value = aggregate?.averageRating ?? aggregate?.placeRating
  const rating = value !== null && value !== undefined && value !== '' ? Number(value) : NaN
  return {
    rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null,
    reviewCount: Number.isFinite(Number(aggregate?.totalVisitorReviews)) ? Number(aggregate.totalVisitorReviews) : null,
    placeId: /^\d+$/.test(String(aggregate?.placeId || '')) ? String(aggregate.placeId) : null,
    status: matched.length ? 'available' : 'unmatched',
    checkedAt: Date.now(),
  }
}

async function scrapeRating(name, address, token) {
  const url = new URL(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`)
  url.searchParams.set('timeout', '35')
  url.searchParams.set('maxTotalChargeUsd', '0.01')
  url.searchParams.set('restartOnError', 'false')
  url.searchParams.set('fields', 'reviewType,placeId,placeName,placeAddress,placeRating,averageRating,totalVisitorReviews')
  const result = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      placeUrls: [], startUrls: [],
      searchKeywords: [`${address.split(/\s+/).slice(0, 3).join(' ')} ${name}`],
      maxPlacesPerKeyword: 1, maxReviews: 1, maxReviewPages: 1,
      includeBlogReviews: false, includeReviewPhotos: false, includeReviewStats: true,
      maxConcurrency: 1, proxyConfiguration: { useApifyProxy: true },
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!result.ok) throw new Error('RATING_UPSTREAM_FAILED')
  const rows = await result.json()
  if (!Array.isArray(rows)) throw new Error('RATING_INVALID_RESPONSE')
  return extractPlaceRating(rows, name, address)
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'GET 요청만 지원합니다.' })
  }
  const token = process.env.APIFY_API_TOKEN
  if (!token) return response.status(503).json({ error: '평점 조회 준비 중이에요.', code: 'RATING_NOT_CONFIGURED' })
  const name = typeof request.query.name === 'string' ? request.query.name.trim() : ''
  const address = typeof request.query.address === 'string' ? request.query.address.trim() : ''
  if (!name || name.length > 100 || address.length < 8 || address.length > 250) return response.status(400).json({ error: '매장 이름과 주소를 확인해주세요.' })
  const idToken = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1]
  if (!idToken || !process.env.VITE_FIREBASE_API_KEY) return response.status(401).json({ error: '로그인 후 평점을 확인해주세요.' })
  try {
    const verification = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(process.env.VITE_FIREBASE_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }), signal: AbortSignal.timeout(5000),
    })
    const user = await verification.json()
    const uid = user.users?.[0]?.localId
    if (!verification.ok || !uid) return response.status(401).json({ error: '로그인을 다시 확인해주세요.' })
    const key = `${normalize(name)}|${addressKey(address)}`
    const cached = cache.get(key)
    let value = cached?.checkedAt > Date.now() - DAY ? cached : null
    if (!value) {
      if (!pending.has(key)) {
        const now = Date.now()
        // Best-effort warm-instance throttle; account-level limits belong in Apify.
        for (const [id, entry] of attempts) if (now - entry.startedAt > 3600000) attempts.delete(id)
        const quota = attempts.get(uid) || { startedAt: now, count: 0 }
        if (quota.count >= 20) return response.status(429).json({ error: '평점을 많이 조회했어요. 잠시 후 다시 시도해주세요.' })
        if (pending.size >= 2) return response.status(429).json({ error: '다른 평점을 확인 중이에요. 잠시 후 다시 시도해주세요.' })
        quota.count += 1
        attempts.set(uid, quota)
        const job = scrapeRating(name, address, token).then((data) => {
          if (cache.size >= 300) cache.delete(cache.keys().next().value)
          cache.set(key, data)
          return data
        }).finally(() => pending.delete(key))
        pending.set(key, job)
      }
      value = await pending.get(key)
    }
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400')
    return response.status(200).json(value)
  } catch {
    return response.status(502).json({ error: '평점을 확인하지 못했어요. 잠시 후 다시 시도해주세요.' })
  }
}
