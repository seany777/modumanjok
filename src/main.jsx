import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import QRCode from 'qrcode'
import { onAuthStateChanged, signInAnonymously, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { equalTo, get, onValue, orderByChild, query, ref, runTransaction, serverTimestamp, set, update } from 'firebase/database'
import {
  ArrowLeft,
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Coffee,
  Copy,
  Crown,
  ExternalLink,
  Flag,
  Home,
  Heart,
  History,
  Info,
  Lock,
  LogOut,
  LogIn,
  MapPin,
  MessageCircleMore,
  Monitor,
  Moon,
  Navigation,
  Pencil,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Settings,
  Settings2,
  SquarePlus,
  Sparkles,
  Star,
  Sun,
  Swords,
  Trash2,
  Trophy,
  UsersRound,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { auth, database, googleProvider } from './firebase'
import './styles.css'

const aiMenuCandidates = [
  { name: '제육볶음', score: 94, reason: '예산과 한식 선호를 가장 고르게 만족해요' },
  { name: '라멘', score: 87, reason: '면류 선호가 높은 멤버에게 잘 맞아요' },
  { name: '마라탕', score: 81, reason: '재료 선택이 자유로워 취향 조절이 쉬워요' },
]

const roomModeLabels = {
  ai: '맞춤 메뉴 추천',
  tournament: '메뉴 이상형 월드컵',
  roulette: '메뉴 룰렛',
  competition: 'Hot Potato 먹기 도전',
}

const tournamentMenus = [
  '제육볶음', '라멘', '피자', '마라탕',
  '김치찌개', '비빔밥', '돈까스', '초밥',
  '떡볶이', '햄버거', '파스타', '쌀국수',
  '치킨', '샤브샤브', '카레', '냉면',
  '족발', '보쌈', '김밥', '순대국',
  '칼국수', '닭갈비', '부대찌개', '짜장면',
  '짬뽕', '탕수육', '우동',
  '오므라이스', '회덮밥', '샌드위치', '케밥',
]

const tournamentMenuImages = {
  '제육볶음': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=640&q=78',
  '라멘': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=78',
  '피자': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=640&q=78',
  '마라탕': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=640&q=78',
  '김치찌개': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=640&q=78',
  '비빔밥': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=640&q=78',
  '돈까스': 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=640&q=78',
  '초밥': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=640&q=78',
  '떡볶이': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=640&q=78',
  '햄버거': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=78',
  '파스타': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=640&q=78',
  '쌀국수': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=640&q=78',
  '치킨': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=640&q=78',
  '샤브샤브': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=640&q=78',
  '카레': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=640&q=78',
  '냉면': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=640&q=78',
}

const menuPreferenceCatalog = [
  { name: '제육볶음', cuisine: ['한식'], form: ['밥류', '고기류'], cooking: ['볶음'], risks: ['돼지고기', '대두(콩류)', '밀'] },
  { name: '라멘', cuisine: ['일식'], form: ['면류'], cooking: ['국물'], risks: ['난류(가금류)', '밀', '대두(콩류)', '돼지고기'] },
  { name: '피자', cuisine: ['양식'], form: ['빵류'], cooking: ['구이'], risks: ['우유', '밀', '토마토'] },
  { name: '마라탕', cuisine: ['중식'], form: ['면류', '채소류'], cooking: ['국물'], risks: ['땅콩', '대두(콩류)', '쇠고기'] },
  { name: '김치찌개', cuisine: ['한식'], form: ['고기류'], cooking: ['국물'], risks: ['돼지고기', '대두(콩류)'] },
  { name: '비빔밥', cuisine: ['한식'], form: ['밥류', '채소류'], cooking: ['비빔'], risks: ['난류(가금류)', '대두(콩류)'] },
  { name: '돈까스', cuisine: ['일식'], form: ['고기류'], cooking: ['튀김'], risks: ['돼지고기', '밀', '난류(가금류)', '우유'] },
  { name: '초밥', cuisine: ['일식'], form: ['밥류', '해산물류'], cooking: ['생식 (회·육회 등)'], risks: ['고등어', '갑각류', '새우', '게', '조개류(굴·전복·홍합)'] },
  { name: '떡볶이', cuisine: ['분식'], form: ['떡류'], cooking: ['국물'], risks: ['밀', '대두(콩류)'] },
  { name: '햄버거', cuisine: ['패스트푸드'], form: ['빵류', '고기류'], cooking: ['구이'], risks: ['밀', '우유', '난류(가금류)', '쇠고기'] },
  { name: '파스타', cuisine: ['양식'], form: ['면류'], cooking: ['볶음'], risks: ['밀', '우유', '토마토'] },
  { name: '쌀국수', cuisine: ['동남아 음식'], form: ['면류'], cooking: ['국물'], risks: ['쇠고기'] },
  { name: '치킨', cuisine: ['패스트푸드'], form: ['고기류'], cooking: ['튀김'], risks: ['닭고기', '밀'] },
  { name: '샤브샤브', cuisine: ['한식', '일식'], form: ['고기류', '채소류'], cooking: ['국물'], risks: ['쇠고기', '대두(콩류)'] },
  { name: '카레', cuisine: ['인도·중동 음식'], form: ['밥류'], cooking: ['볶음'], risks: ['우유', '밀'] },
  { name: '냉면', cuisine: ['한식'], form: ['면류'], cooking: ['국물'], risks: ['메밀', '쇠고기', '난류(가금류)'] },
  { name: '족발', cuisine: ['한식'], form: ['고기류'], cooking: ['조림'], risks: ['돼지고기', '대두(콩류)'] },
  { name: '보쌈', cuisine: ['한식'], form: ['고기류', '채소류'], cooking: ['찜'], risks: ['돼지고기', '새우', '대두(콩류)'] },
  { name: '김밥', cuisine: ['한식', '분식'], form: ['밥류', '채소류'], cooking: ['기타'], risks: ['난류(가금류)', '대두(콩류)', '참깨'] },
  { name: '순대국', cuisine: ['한식'], form: ['고기류'], cooking: ['국물'], risks: ['돼지고기', '들깨'] },
  { name: '칼국수', cuisine: ['한식'], form: ['면류'], cooking: ['국물'], risks: ['밀', '조개류(굴·전복·홍합)'] },
  { name: '닭갈비', cuisine: ['한식'], form: ['고기류'], cooking: ['볶음'], risks: ['닭고기', '대두(콩류)'] },
  { name: '부대찌개', cuisine: ['한식'], form: ['고기류'], cooking: ['국물'], risks: ['돼지고기', '대두(콩류)', '밀', '우유'] },
  { name: '짜장면', cuisine: ['중식'], form: ['면류'], cooking: ['볶음'], risks: ['밀', '대두(콩류)', '돼지고기'] },
  { name: '짬뽕', cuisine: ['중식'], form: ['면류', '해산물류'], cooking: ['국물'], risks: ['밀', '갑각류', '조개류(굴·전복·홍합)'] },
  { name: '탕수육', cuisine: ['중식'], form: ['고기류'], cooking: ['튀김'], risks: ['돼지고기', '밀', '대두(콩류)'] },
  { name: '우동', cuisine: ['일식'], form: ['면류'], cooking: ['국물'], risks: ['밀', '대두(콩류)', '고등어'] },
  { name: '오므라이스', cuisine: ['양식', '일식'], form: ['밥류'], cooking: ['볶음'], risks: ['난류(가금류)', '우유', '토마토'] },
  { name: '회덮밥', cuisine: ['한식', '일식'], form: ['밥류', '해산물류'], cooking: ['생식 (회·육회 등)'], risks: ['고등어', '대두(콩류)', '참깨'] },
  { name: '샌드위치', cuisine: ['양식'], form: ['빵류', '채소류'], cooking: ['기타'], risks: ['밀', '우유', '난류(가금류)'] },
  { name: '케밥', cuisine: ['인도·중동 음식'], form: ['빵류', '고기류'], cooking: ['구이'], risks: ['밀', '우유', '쇠고기'] },
]

const menuPriceRanges = {
  '제육볶음': [9000, 14000], '라멘': [9000, 15000], '피자': [9000, 18000], '마라탕': [10000, 18000],
  '김치찌개': [8000, 12000], '비빔밥': [8000, 13000], '돈까스': [9000, 16000], '초밥': [13000, 30000],
  '떡볶이': [5000, 12000], '햄버거': [6000, 14000], '파스타': [12000, 22000], '쌀국수': [9000, 15000],
  '치킨': [9000, 16000], '샤브샤브': [14000, 26000], '카레': [8000, 14000], '냉면': [9000, 15000],
  '족발': [12000, 23000], '보쌈': [12000, 23000], '김밥': [3500, 7000], '순대국': [9000, 13000],
  '칼국수': [8000, 13000], '닭갈비': [12000, 18000], '부대찌개': [10000, 17000],
  '짜장면': [7000, 11000], '짬뽕': [9000, 14000], '탕수육': [9000, 18000], '우동': [7000, 12000],
  '오므라이스': [9000, 15000], '회덮밥': [12000, 20000], '샌드위치': [6000, 13000], '케밥': [8000, 15000],
}

const allergyFallbackCatalog = [
  { name: '채소죽', cuisine: ['한식'], form: ['밥류', '채소류'], cooking: ['국물'], risks: [] },
  { name: '구운 채소', cuisine: ['한식', '양식'], form: ['채소류'], cooking: ['구이'], risks: [] },
  { name: '감자구이', cuisine: ['양식'], form: ['채소류'], cooking: ['구이'], risks: [] },
  { name: '흰쌀밥과 나물', cuisine: ['한식'], form: ['밥류', '채소류'], cooking: ['비빔'], risks: [] },
  { name: '채소쌀국수', cuisine: ['동남아 음식'], form: ['면류', '채소류'], cooking: ['국물'], risks: [] },
  { name: '채소찜', cuisine: ['한식'], form: ['채소류'], cooking: ['찜'], risks: [] },
]

const normalizeFoodText = (value = '') => value.toLowerCase().replace(/[\s·()]/g, '')

const isMenuBlockedForMembers = (menu, memberRecords) => {
  const menuTerms = [menu.name, ...menu.cuisine, ...menu.form, ...menu.cooking, ...menu.risks].map(normalizeFoodText)
  return Object.values(memberRecords || {}).some((member) => {
    const preferences = member.preferences || {}
    return [...(preferences.allergies || []), ...(preferences.avoided || [])].some((item) => {
      const normalized = normalizeFoodText(item)
      return normalized && menuTerms.some((term) => term.includes(normalized) || normalized.includes(term))
    })
  })
}

const getSafeMenuNames = (memberRecords) => {
  const safe = menuPreferenceCatalog.filter((menu) => !isMenuBlockedForMembers(menu, memberRecords)).map((menu) => menu.name)
  return safe.length >= 2 ? safe : allergyFallbackCatalog.map((menu) => menu.name)
}

const seededMenuValue = (value) => [...value].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261)

const getTournamentBracket = (memberRecords, seed = '') => {
  const ordered = [...getSafeMenuNames(memberRecords)].sort((a, b) => seededMenuValue(`${seed}-${a}`) - seededMenuValue(`${seed}-${b}`))
  const size = ordered.length >= 16 ? 16 : ordered.length >= 8 ? 8 : ordered.length >= 4 ? 4 : 2
  return ordered.slice(0, size)
}

const roulettePalette = ['#f06a3b', '#ffbd82', '#ef8758', '#ffd4ad', '#df552a', '#f6a36f', '#ffcab0', '#e97947']
const getRouletteGradient = (menus) => {
  const size = 360 / Math.max(1, menus.length)
  return `conic-gradient(${menus.map((_, index) => `${roulettePalette[index % roulettePalette.length]} ${index * size}deg ${(index + 1) * size}deg`).join(',')})`
}

const getProfilePreferences = (profile) => ({
  cuisine: profile.cuisine || [],
  form: profile.form || [],
  cooking: profile.cooking || [],
  avoided: profile.avoided || [],
  allergies: profile.allergies || [],
  recentMenus: [...(profile.menuHistory || [])]
    .sort((a, b) => Number(b?.completedAt || 0) - Number(a?.completedAt || 0))
    .slice(0, 5)
    .map((item) => item?.menu)
    .filter(Boolean),
})

function makePreferenceCandidates(memberRecords, budgetMin = 0, budgetMax = 0) {
  const preferences = Object.values(memberRecords || {}).map((member) => member.preferences).filter(Boolean)
  const total = Math.max(1, preferences.length)
  const normalizedBudgetMin = Math.max(0, Number(budgetMin || 0))
  const normalizedBudgetMax = Math.max(normalizedBudgetMin, Number(budgetMax || 0))
  const hasBudget = normalizedBudgetMax > 0
  const candidates = menuPreferenceCatalog.map((menu) => {
    const menuTerms = [menu.name, ...menu.cuisine, ...menu.form, ...menu.cooking, ...menu.risks].map(normalizeFoodText)
    const blockedBy = []
    let preferenceScore = 0
    let matchedMembers = 0
    let recentMatchCount = 0
    preferences.forEach((profile) => {
      const blocked = [...(profile.allergies || []), ...(profile.avoided || [])].filter((item) => {
        const normalized = normalizeFoodText(item)
        return normalized && menuTerms.some((term) => term.includes(normalized) || normalized.includes(term))
      })
      if (blocked.length) {
        blockedBy.push(...blocked)
        return
      }
      const matches = [
        menu.cuisine.some((item) => profile.cuisine?.includes(item)),
        menu.form.some((item) => profile.form?.includes(item)),
        menu.cooking.some((item) => profile.cooking?.includes(item)),
      ].filter(Boolean).length
      if (matches) matchedMembers += 1
      preferenceScore += matches * 11
      const normalizedMenuName = normalizeFoodText(menu.name)
      const recentlyAteMenu = (profile.recentMenus || []).some((recentMenu) => {
        const normalizedRecentMenu = normalizeFoodText(recentMenu)
        return normalizedRecentMenu && (
          normalizedRecentMenu === normalizedMenuName
          || normalizedRecentMenu.includes(normalizedMenuName)
          || normalizedMenuName.includes(normalizedRecentMenu)
        )
      })
      if (recentlyAteMenu) recentMatchCount += 1
    })
    const uniqueBlocked = [...new Set(blockedBy)]
    const recentMenuPenalty = Math.round((recentMatchCount / total) * 8)
    const [priceMin, priceMax] = menuPriceRanges[menu.name] || [0, 0]
    const budgetDistance = !hasBudget || (priceMax >= normalizedBudgetMin && priceMin <= normalizedBudgetMax)
      ? 0
      : priceMax < normalizedBudgetMin ? normalizedBudgetMin - priceMax : priceMin - normalizedBudgetMax
    const budgetPenalty = Math.min(24, Math.ceil(budgetDistance / 1000) * 2)
    const budgetMismatch = hasBudget && budgetDistance > 0
    return {
      name: menu.name,
      blocked: uniqueBlocked.length > 0,
      budgetMismatch,
      budgetDistance,
      priceMin,
      priceMax,
      score: Math.max(35, Math.min(98, Math.round(62 + preferenceScore / total + (matchedMembers / total) * 8 - recentMenuPenalty - budgetPenalty))),
      reason: preferences.length
        ? `${preferences.length}명 취향 반영 · 약 ${priceMin.toLocaleString('ko-KR')}~${priceMax.toLocaleString('ko-KR')}원${budgetMismatch ? ' · 예산 근접 후보' : ''}${recentMatchCount ? ` · 최근 식사 ${recentMatchCount}명 중복 감점` : ''}`
        : `예상 가격 약 ${priceMin.toLocaleString('ko-KR')}~${priceMax.toLocaleString('ko-KR')}원`,
    }
  })
  const allergySafe = candidates.filter((candidate) => !candidate.blocked)
  const budgetSafe = allergySafe.filter((candidate) => !candidate.budgetMismatch)
  const safe = (budgetSafe.length ? budgetSafe : allergySafe).sort((a, b) => a.budgetDistance - b.budgetDistance || b.score - a.score)
  if (!allergySafe.length) {
    const avoidedTerms = preferences.flatMap((profile) => profile.avoided || []).map(normalizeFoodText).filter(Boolean)
    const fallback = allergyFallbackCatalog.filter((menu) => {
      const menuTerms = [menu.name, ...menu.cuisine, ...menu.form, ...menu.cooking].map(normalizeFoodText)
      return !avoidedTerms.some((term) => menuTerms.some((menuTerm) => menuTerm.includes(term) || term.includes(menuTerm)))
    })
    return fallback
      .map((menu) => ({
        ...menu,
        score: 68,
        fallback: true,
        reason: '알레르기 조건을 우선한 대체 후보 · 주문 전 매장 확인 필수',
      }))
      .sort(() => Math.random() - .5)
      .slice(0, 3)
  }
  return safe.sort((a, b) => b.score - a.score || Math.random() - .5).slice(0, 3)
}

const sampleRestaurants = [
  { id: 1, name: '오늘의 식탁', distance: '320m', rating: 4.8, walk: '도보 5분', address: '학교 정문 앞 1번 골목' },
  { id: 2, name: '한상 가득', distance: '580m', rating: 4.6, walk: '도보 8분', address: '대학로 42길 7' },
  { id: 3, name: '모두의 키친', distance: '850m', rating: 4.5, walk: '도보 12분', address: '중앙로 18번길 3' },
]

const cleanMenuName = (name = '') => name.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()

const formatPrice = (price) => Number(price).toLocaleString('ko-KR') + '원'

const distanceInMeters = (origin, destination) => {
  if (!origin || !destination?.lat || !destination?.lng) return null
  const toRad = (degree) => degree * Math.PI / 180
  const earthRadius = 6371000
  const latDelta = toRad(destination.lat - origin.lat)
  const lngDelta = toRad(destination.lng - origin.lng)
  const value = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(lngDelta / 2) ** 2
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)))
}

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return '거리 계산 전'
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

function makeApiCandidates(menuItems, restaurantItems, qualityItems) {
  const restaurants = new Map(restaurantItems.map((item) => [String(item.RSTR_ID), item]))
  const qualities = new Map(qualityItems.map((item) => [String(item.RSTR_ID), item]))
  const groups = new Map()
  const dishKeywords = ['제육', '김치찌개', '비빔밥', '냉면', '치킨', '파스타', '햄버거', '카레', '칼국수', '닭갈비', '갈비', '족발', '보쌈', '국밥', '짜장면']
  const excludedKeywords = ['소주', '맥주', '와인', '막걸리', '음료', '콜라', '사이다', '커피', '에이드', '주스', '케이크', '파이', '볶음밥']

  menuItems.forEach((item) => {
    const name = cleanMenuName(item.MENU_NM)
    const price = Number(item.MENU_PRICE)
    if (!name || !/[가-힣]/.test(name) || name.length > 18 || !price || price > 30000 || excludedKeywords.some((keyword) => name.includes(keyword))) return
    const current = groups.get(name) || { name, prices: [], restaurantIds: new Set() }
    current.prices.push(price)
    current.restaurantIds.add(String(item.RSTR_ID))
    groups.set(name, current)
  })

  return [...groups.values()]
    .filter((group) => [...group.restaurantIds].some((id) => restaurants.has(id)))
    .sort((a, b) => {
      const aDish = dishKeywords.some((keyword) => a.name.includes(keyword)) ? 1 : 0
      const bDish = dishKeywords.some((keyword) => b.name.includes(keyword)) ? 1 : 0
      return bDish - aDish || b.restaurantIds.size - a.restaurantIds.size || Math.min(...a.prices) - Math.min(...b.prices)
    })
    .slice(0, 3)
    .map((group, index) => ({
      name: group.name,
      score: 94 - index * 6,
      reason: `서울 관광 음식 데이터 · ${formatPrice(Math.min(...group.prices))}부터`,
      restaurants: [...group.restaurantIds]
        .map((id) => {
          const restaurant = restaurants.get(id)
          if (!restaurant) return null
          const quality = qualities.get(id)
          return {
            id,
            name: restaurant.RSTR_NM,
            address: restaurant.RSTR_RDNMADR || restaurant.RSTR_LNNO_ADRES || '주소 정보 없음',
            phone: restaurant.RSTR_TELNO || '',
            lat: Number(restaurant.RSTR_LA),
            lng: Number(restaurant.RSTR_LO),
            rating: Number(quality?.NAVER_GRAD) || null,
          }
        })
        .filter(Boolean)
        .slice(0, 8),
    }))
}

let naverMapLoader
let redtableBundleLoader
const naverRestaurantLoaders = new Map()
const REDTABLE_CACHE_KEY = 'modumanjok-redtable-v1'
const REDTABLE_CACHE_AGE = 6 * 60 * 60 * 1000

function loadRedtableBundle() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(REDTABLE_CACHE_KEY) || 'null')
    if (cached?.savedAt > Date.now() - REDTABLE_CACHE_AGE && cached?.data) return Promise.resolve(cached.data)
  } catch {
    sessionStorage.removeItem(REDTABLE_CACHE_KEY)
  }
  if (redtableBundleLoader) return redtableBundleLoader
  const getResource = (resource) => fetch(`/api/redtable?resource=${resource}`).then((response) => (
    response.ok ? response.json() : response.json().then((data) => Promise.reject(new Error(data.error)))
  ))
  redtableBundleLoader = Promise.all([getResource('menus'), getResource('restaurants'), getResource('quality')])
    .then((data) => {
      try {
        sessionStorage.setItem(REDTABLE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }))
      } catch {
        // 저장 공간이 부족하면 메모리 캐시만 사용합니다.
      }
      return data
    })
    .catch((error) => {
      redtableBundleLoader = null
      throw error
    })
  return redtableBundleLoader
}

function loadNaverRestaurants(menu, area) {
  const areaParts = area.split(/\s+/).filter(Boolean)
  const searchAreas = [...new Set([
    area,
    areaParts.slice(0, -1).join(' '),
    areaParts[0],
  ].filter(Boolean))]
  const cacheKey = `modumanjok-naver-local-v3:${searchAreas.join('|')}:${menu}`
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null')
    if (cached?.savedAt > Date.now() - 30 * 60 * 1000) return Promise.resolve({ ...cached, area })
  } catch {
    sessionStorage.removeItem(cacheKey)
  }
  if (naverRestaurantLoaders.has(cacheKey)) return naverRestaurantLoaders.get(cacheKey)
  const loader = (async () => {
    let lastError = null
    for (const searchArea of searchAreas) {
      const queryText = `${searchArea} ${menu} 맛집`.trim()
      try {
        const result = await fetch(`/api/naver-local?query=${encodeURIComponent(queryText)}&menu=${encodeURIComponent(menu)}`)
        const data = await result.json()
        if (!result.ok) throw new Error(data.error || '네이버 식당 검색에 실패했습니다.')
        if (data.items?.length) {
          const value = { items: data.items, area: searchArea, savedAt: Date.now() }
          try { sessionStorage.setItem(cacheKey, JSON.stringify(value)) } catch { /* memory cache only */ }
          return value
        }
      } catch (error) {
        lastError = error
      }
    }
    if (lastError) throw lastError
    return { items: [], area, savedAt: Date.now() }
  })()
    .finally(() => naverRestaurantLoaders.delete(cacheKey))
  naverRestaurantLoaders.set(cacheKey, loader)
  return loader
}

function reverseGeocodeArea(location, keyId) {
  if (!location || !keyId) return Promise.reject(new Error('위치 또는 지도 키가 없습니다.'))
  return loadNaverMaps(keyId).then((maps) => new Promise((resolve, reject) => {
    maps.Service.reverseGeocode({
      coords: new maps.LatLng(location.lat, location.lng),
      orders: 'admcode,legalcode',
    }, (status, response) => {
      if (status !== maps.Service.Status.OK) {
        reject(new Error('현재 위치의 주소를 확인하지 못했어요.'))
        return
      }
      const results = response?.v2?.results || []
      const region = (results.find((item) => item.name === 'admcode') || results[0])?.region
      if (!region) {
        reject(new Error('현재 위치의 행정구역 정보가 없어요.'))
        return
      }
      const area1 = region.area1?.name || ''
      const area2 = region.area2?.name || ''
      const area3 = region.area3?.name || ''
      resolve({
        query: [area2, area3].filter(Boolean).join(' ') || area1,
        label: [area1, area2, area3].filter(Boolean).join(' '),
      })
    })
  }))
}

function loadNaverMaps(keyId) {
  if (window.naver?.maps?.Service) return Promise.resolve(window.naver.maps)
  if (naverMapLoader) return naverMapLoader
  naverMapLoader = new Promise((resolve, reject) => {
    const callbackName = `initModumanjokMap${Date.now()}`
    let settled = false
    const startedAt = Date.now()
    const finish = () => {
      if (settled) return
      if (!window.naver?.maps?.Service) {
        if (Date.now() - startedAt < 8000) {
          setTimeout(finish, 100)
          return
        }
        settled = true
        clearTimeout(timeout)
        reject(new Error('네이버 지도 위치 변환 모듈을 불러오지 못했습니다. Reverse Geocoding과 Web 서비스 URL을 확인해주세요.'))
        return
      }
      settled = true
      clearTimeout(timeout)
      delete window[callbackName]
      resolve(window.naver.maps)
    }
    window[callbackName] = () => {
      finish()
    }
    window.navermap_authFailure = () => {
      window.dispatchEvent(new Event('navermap-auth-failure'))
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        reject(new Error('네이버 지도 인증에 실패했습니다.'))
      }
    }
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(keyId)}&submodules=geocoder&callback=${callbackName}`
    script.async = true
    script.onload = finish
    script.onerror = () => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        reject(new Error('네이버 지도를 불러오지 못했습니다.'))
      }
    }
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error('네이버 지도 응답이 없습니다. Reverse Geocoding과 Web 서비스 URL을 확인해주세요.'))
      }
    }, 9000)
    document.head.appendChild(script)
  }).catch((error) => {
    naverMapLoader = null
    throw error
  })
  return naverMapLoader
}

function NaverRestaurantMap({ restaurants, selectedRestaurant, userLocation, showRoute = false }) {
  const mapElement = useRef(null)
  const mapInstance = useRef(null)
  const markerInstances = useRef([])
  const routeInstance = useRef(null)
  const keyId = import.meta.env.VITE_NAVER_MAP_NCP_KEY_ID
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    const locations = restaurants.filter((restaurant) => Number.isFinite(restaurant.lat) && Number.isFinite(restaurant.lng))
    if (!keyId || !mapElement.current || (!locations.length && !userLocation)) return
    let disposed = false
    const handleAuthFailure = () => {
      if (!disposed) setMapError('네이버 지도 인증에 실패했습니다. 콘솔의 Web 서비스 URL을 확인해주세요.')
    }
    window.addEventListener('navermap-auth-failure', handleAuthFailure)

    loadNaverMaps(keyId).then((maps) => {
      if (disposed || !mapElement.current) return
      const focus = userLocation || locations[0]
      const map = mapInstance.current || new maps.Map(mapElement.current, {
          center: new maps.LatLng(focus.lat, focus.lng),
          zoom: 14,
          zoomControl: true,
        })
      mapInstance.current = map
      markerInstances.current.forEach((marker) => marker.setMap(null))
      markerInstances.current = []
      routeInstance.current?.setMap(null)
      routeInstance.current = null
      const bounds = new maps.LatLngBounds()
      locations.forEach((restaurant) => {
        const position = new maps.LatLng(restaurant.lat, restaurant.lng)
        bounds.extend(position)
        markerInstances.current.push(new maps.Marker({ map, position, title: restaurant.name }))
      })
      if (userLocation) {
        const position = new maps.LatLng(userLocation.lat, userLocation.lng)
        bounds.extend(position)
        markerInstances.current.push(new maps.Marker({
          map,
          position,
          title: '현재 위치',
          icon: { content: '<div class="current-location-marker"></div>', anchor: new maps.Point(8, 8) },
        }))
      }
      if (showRoute && userLocation && Number.isFinite(selectedRestaurant?.lat) && Number.isFinite(selectedRestaurant?.lng)) {
        routeInstance.current = new maps.Polyline({
          map,
          path: [
            new maps.LatLng(userLocation.lat, userLocation.lng),
            new maps.LatLng(selectedRestaurant.lat, selectedRestaurant.lng),
          ],
          strokeColor: '#ed6535',
          strokeOpacity: .92,
          strokeWeight: 5,
          strokeStyle: 'shortdash',
        })
      }
      if (locations.length > 0 && userLocation) map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 })
      else if (locations.length > 1) map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 })
      else if (userLocation) {
        map.setCenter(new maps.LatLng(userLocation.lat, userLocation.lng))
        map.setZoom(14)
      }
      setTimeout(() => maps.Event.trigger(map, 'resize'), 100)
    }).catch((error) => setMapError(error.message))

    return () => {
      disposed = true
      window.removeEventListener('navermap-auth-failure', handleAuthFailure)
    }
  }, [keyId, restaurants, userLocation, selectedRestaurant?.lat, selectedRestaurant?.lng, showRoute])

  useEffect(() => {
    if (!selectedRestaurant?.lat || !selectedRestaurant?.lng || !mapInstance.current || !window.naver?.maps) return
    mapInstance.current.panTo(new window.naver.maps.LatLng(selectedRestaurant.lat, selectedRestaurant.lng))
  }, [selectedRestaurant])

  if (!keyId) return <div className="map-placeholder"><MapPin size={22} /><span>네이버 지도 키를 연결하면 여기에 지도가 표시돼요.</span></div>
  if (mapError) return <div className="map-placeholder error"><AlertTriangle size={22} /><span>{mapError}</span></div>
  return <div ref={mapElement} className="naver-restaurant-map" aria-label="추천 매장 지도" />
}

const navItems = [
  { id: 'home', label: '메인', icon: Home },
  { id: 'rooms', label: '방 접속', icon: LogIn },
  { id: 'community', label: '커뮤', icon: MessageCircleMore },
  { id: 'profile', label: '내 정보', icon: CircleUserRound },
]

const defaultUserProfile = {
  name: '',
  image: '/assets/default-profile.svg',
  cuisine: [],
  form: [],
  cooking: [],
  avoided: [],
  allergies: [],
  menuHistory: [],
}

const PROFILE_DATA_VERSION = 2
const SETTINGS_STORAGE_KEY = 'modumanjok-app-settings'
const SPLASH_SESSION_KEY = 'modumanjok-splash-seen'
const defaultAppSettings = {
  theme: 'light',
  voteNotifications: true,
  profileVisibility: 'friends',
}

const loadSavedSettings = () => {
  try {
    return { ...defaultAppSettings, ...JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}') }
  } catch {
    return defaultAppSettings
  }
}

const roomColors = ['lime', 'coral', 'sky']
const homeTitleMessages = [
  '오늘은 뭐 먹을까요?',
  '우리 같이 뭐 먹을까요?',
  '모두 만족할 메뉴는?',
  '오늘의 메뉴를 골라볼까요?',
  '지금 딱 좋은 메뉴는?',
  '맛있는 결정을 시작할까요?',
]

const createInviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()
const normalizeNickname = (value = '') => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR')
const nicknamePathKey = (value = '') => encodeURIComponent(normalizeNickname(value)).replace(/\./g, '%2E')
const createGuestNickname = (uid = '') => `너구리-${uid.slice(-6).toUpperCase() || Math.random().toString(16).slice(2, 8).toUpperCase()}`

const normalizeRoom = (id, room) => {
  const memberRecords = room?.members || {}
  return {
    id,
    ...room,
    color: room?.color || roomColors[Math.abs(String(id).length) % roomColors.length],
    members: Object.values(memberRecords).map((member) => member.name || '참여자'),
    memberRecords,
  }
}

function App() {
  const [splashState, setSplashState] = useState(() => {
    try {
      return sessionStorage.getItem(SPLASH_SESSION_KEY) ? 'hidden' : 'visible'
    } catch {
      return 'visible'
    }
  })
  const [authUser, setAuthUser] = useState(undefined)
  const [profileReady, setProfileReady] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [authBusy, setAuthBusy] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [roomsLoadStatus, setRoomsLoadStatus] = useState('loading')
  const [roomsLoadError, setRoomsLoadError] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [rooms, setRooms] = useState([])
  const [friends, setFriends] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [requestedRoomId, setRequestedRoomId] = useState('')
  const [shareRoom, setShareRoom] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileSheet, setProfileSheet] = useState(null)
  const [profileFocus, setProfileFocus] = useState(null)
  const [friendSheetRoom, setFriendSheetRoom] = useState(null)
  const [pendingJoinCode, setPendingJoinCode] = useState('')
  const [appSettings, setAppSettings] = useState(loadSavedSettings)
  const [userProfile, setUserProfile] = useState(defaultUserProfile)
  const memberPreferenceSync = useRef('')

  useEffect(() => {
    if (splashState !== 'visible') return undefined
    try { sessionStorage.setItem(SPLASH_SESSION_KEY, '1') } catch { /* storage unavailable */ }
    const leaveTimer = setTimeout(() => setSplashState('leaving'), 1750)
    const hideTimer = setTimeout(() => setSplashState('hidden'), 2200)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const applyRoute = (pathname = window.location.pathname, search = window.location.search) => {
    const roomMatch = pathname.match(/^\/rooms\/([^/]+)$/)
    const joinMatch = pathname.match(/^\/join\/([^/]+)$/)
    const queryCode = new URLSearchParams(search).get('join')
    if (joinMatch || queryCode) {
      setPendingJoinCode(decodeURIComponent(joinMatch?.[1] || queryCode).toUpperCase())
      setSelectedRoom(null)
      setRequestedRoomId('')
      setSettingsOpen(false)
      setActiveTab('rooms')
      setSheet('join')
      return
    }
    setSheet(null)
    if (roomMatch) {
      setRequestedRoomId(decodeURIComponent(roomMatch[1]))
      setSettingsOpen(false)
      setActiveTab('rooms')
      return
    }
    setRequestedRoomId('')
    setSelectedRoom(null)
    if (pathname === '/community') {
      setActiveTab('community')
      setSettingsOpen(false)
    } else if (pathname === '/profile') {
      setActiveTab('profile')
      setSettingsOpen(false)
    } else if (pathname === '/settings') {
      setActiveTab('profile')
      setSettingsOpen(true)
    } else if (pathname === '/rooms') {
      setActiveTab('rooms')
      setSettingsOpen(false)
    } else {
      setActiveTab('home')
      setSettingsOpen(false)
    }
  }

  const navigateTo = (path, { replace = false } = {}) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    applyRoute(path, '')
  }

  const openRoom = (room, { replace = false } = {}) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `/rooms/${encodeURIComponent(room.id)}`)
    setRequestedRoomId(room.id)
    setSelectedRoom(room)
    setActiveTab('rooms')
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!authUser) return undefined
    applyRoute()
    const handlePopState = () => applyRoute()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [authUser])

  useEffect(() => {
    if (!authUser || !userProfile.name) return
    let cancelled = false
    const syncDirectory = async () => {
      let nickname = userProfile.name.trim()
      let key = nicknamePathKey(nickname)
      try {
        let reservation = await runTransaction(ref(database, `nicknames/${key}`), (ownerUid) => (
          ownerUid === null || ownerUid === authUser.uid ? authUser.uid : undefined
        ), { applyLocally: false })
        if (!reservation.committed) {
          nickname = `${nickname}_${authUser.uid.slice(0, 4)}`
          key = nicknamePathKey(nickname)
          reservation = await runTransaction(ref(database, `nicknames/${key}`), (ownerUid) => (
            ownerUid === null || ownerUid === authUser.uid ? authUser.uid : undefined
          ), { applyLocally: false })
        }
        if (!reservation.committed || cancelled) return
        if (nickname !== userProfile.name) {
          setUserProfile((profile) => ({ ...profile, name: nickname }))
          await update(ref(database, `users/${authUser.uid}`), { name: nickname, updatedAt: serverTimestamp() })
          return
        }
        await update(ref(database, `userDirectory/${authUser.uid}`), {
          name: nickname,
          nameNormalized: normalizeNickname(nickname),
          email: authUser.email?.toLowerCase() || '',
          image: userProfile.image || '/assets/default-profile.svg',
          updatedAt: serverTimestamp(),
        })
      } catch (error) {
        console.error('User directory sync failed:', error)
      }
    }
    syncDirectory()
    return () => { cancelled = true }
  }, [authUser, userProfile.name, userProfile.image])

  useEffect(() => {
    if (!authUser || !rooms.length) return
    const joinedRoomIds = rooms.filter((room) => room.memberRecords?.[authUser.uid]).map((room) => room.id).sort()
    const preferences = getProfilePreferences(userProfile)
    const signature = JSON.stringify({ joinedRoomIds, preferences, name: userProfile.name, image: userProfile.image })
    if (!joinedRoomIds.length || memberPreferenceSync.current === signature) return
    memberPreferenceSync.current = signature
    const changes = {}
    joinedRoomIds.forEach((roomId) => {
      changes[`rooms/${roomId}/members/${authUser.uid}/name`] = userProfile.name
      changes[`rooms/${roomId}/members/${authUser.uid}/image`] = userProfile.image
      changes[`rooms/${roomId}/members/${authUser.uid}/preferences`] = preferences
    })
    update(ref(database), changes).catch((error) => {
      memberPreferenceSync.current = ''
      console.error('Room preference sync failed:', error)
    })
  }, [authUser, rooms, userProfile.name, userProfile.image, userProfile.cuisine, userProfile.form, userProfile.cooking, userProfile.avoided, userProfile.allergies, userProfile.menuHistory])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme = appSettings.theme === 'system'
        ? (media.matches ? 'dark' : 'light')
        : appSettings.theme
      document.documentElement.dataset.theme = resolvedTheme
    }
    applyTheme()
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appSettings))
    media.addEventListener?.('change', applyTheme)
    return () => media.removeEventListener?.('change', applyTheme)
  }, [appSettings])

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    setProfileReady(false)
    setAuthUser(user)
    setAuthBusy(false)
    setAuthError('')

    if (!user) {
      setUserProfile(defaultUserProfile)
      setNeedsOnboarding(false)
      setProfileReady(true)
      return
    }

    const googleProfile = {
      ...defaultUserProfile,
      name: user.isAnonymous ? createGuestNickname(user.uid) : user.displayName || user.email?.split('@')[0] || '사용자',
      image: user.photoURL || defaultUserProfile.image,
    }
    setUserProfile(googleProfile)

    try {
      const userRef = ref(database, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const saved = snapshot.val()
        setNeedsOnboarding(saved.onboardingComplete === false)
        if (saved.settings) setAppSettings({ ...defaultAppSettings, ...saved.settings })
        if (saved.profileDataVersion !== PROFILE_DATA_VERSION) {
          await update(userRef, {
            ...googleProfile,
            uid: user.uid,
            email: user.email || '',
            profileDataVersion: PROFILE_DATA_VERSION,
            updatedAt: serverTimestamp(),
          })
          setUserProfile(googleProfile)
          return
        }
        const savedName = saved.name && saved.name !== '<이름>' ? saved.name : googleProfile.name
        setUserProfile({
          ...googleProfile,
          ...saved,
          name: savedName,
          image: saved.image || googleProfile.image,
          cuisine: saved.cuisine || googleProfile.cuisine,
          form: saved.form || googleProfile.form,
          cooking: saved.cooking || googleProfile.cooking,
          avoided: saved.avoided || googleProfile.avoided,
          allergies: saved.allergies || googleProfile.allergies,
          menuHistory: Array.isArray(saved.menuHistory) ? saved.menuHistory : Object.values(saved.menuHistory || {}),
        })
        if (!saved.name || saved.name === '<이름>') {
          await update(userRef, { name: googleProfile.name, updatedAt: serverTimestamp() })
        }
      } else {
        await set(userRef, {
          ...googleProfile,
          uid: user.uid,
          email: user.email || '',
          profileDataVersion: PROFILE_DATA_VERSION,
          settings: appSettings,
          onboardingComplete: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setUserProfile(googleProfile)
        setNeedsOnboarding(true)
      }
    } catch (error) {
      console.error('Firebase profile sync failed:', error)
      setUserProfile(googleProfile)
      setToast('로그인은 됐지만 DB 규칙을 확인해주세요')
      setNeedsOnboarding(false)
    } finally {
      setProfileReady(true)
    }
  }), [])

  useEffect(() => {
    if (!authUser) {
      setRooms([])
      setFriends([])
      setRoomsLoading(false)
      setRoomsLoadStatus('idle')
      setRoomsLoadError('')
      return undefined
    }

    setRoomsLoading(true)
    setRoomsLoadStatus('loading')
    setRoomsLoadError('')
    const unsubscribeRooms = onValue(ref(database, 'rooms'), (snapshot) => {
      try {
        const nextRooms = Object.entries(snapshot.val() || {})
          .filter(([, room]) => Boolean(room.members?.[authUser.uid]))
          .map(([roomId, room]) => normalizeRoom(roomId, room))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setRooms(nextRooms)
        setRoomsLoadStatus('ready')
        setRoomsLoadError('')
      } catch (error) {
        console.error('Room sync failed:', error)
        setToast('방 목록을 불러오지 못했어요')
      } finally {
        setRoomsLoading(false)
      }
    }, (error) => {
      console.error('Room subscription failed:', error)
      setRooms([])
      setRoomsLoading(false)
      setRoomsLoadStatus('error')
      setRoomsLoadError(error.code || error.message || 'UNKNOWN')
      setToast(error.code === 'PERMISSION_DENIED' ? '방 DB 읽기 권한이 없어요. Firebase 규칙을 게시해주세요' : '방 목록 연결에 실패했어요')
    })

    const unsubscribeFriends = onValue(ref(database, `friends/${authUser.uid}`), (snapshot) => {
      setFriends(Object.entries(snapshot.val() || {}).map(([uid, friend]) => ({ uid, ...friend })))
    }, (error) => console.error('Friend subscription failed:', error))

    return () => {
      unsubscribeRooms()
      unsubscribeFriends()
    }
  }, [authUser])

  const saveAppSetting = (key, value) => {
    const nextSettings = { ...appSettings, [key]: value }
    setAppSettings(nextSettings)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))
    if (auth.currentUser) {
      update(ref(database, `users/${auth.currentUser.uid}/settings`), {
        [key]: value,
        updatedAt: serverTimestamp(),
      }).catch((error) => {
        console.error('Settings save failed:', error)
        setToast('설정은 이 기기에 저장됐지만 DB 동기화에 실패했어요')
      })
    }
  }

  useEffect(() => {
    if (!selectedRoom) return
    const current = rooms.find((room) => room.id === selectedRoom.id)
    if (current) setSelectedRoom(current)
  }, [rooms, selectedRoom?.id])

  useEffect(() => {
    if (!requestedRoomId || !rooms.length) return
    const requestedRoom = rooms.find((room) => room.id === requestedRoomId)
    if (requestedRoom) setSelectedRoom(requestedRoom)
    else navigateTo('/rooms', { replace: true })
  }, [rooms, requestedRoomId])

  useEffect(() => {
    if (!friendSheetRoom) return
    const current = rooms.find((room) => room.id === friendSheetRoom.id)
    if (current) setFriendSheetRoom(current)
  }, [rooms, friendSheetRoom?.id])

  const loginWithGoogle = async () => {
    setAuthBusy(true)
    setAuthError('')
    try {
      if (window.matchMedia('(max-width: 760px)').matches) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (error) {
      console.error('Google login failed:', error)
      const message = error.code === 'auth/unauthorized-domain'
        ? 'Firebase 승인된 도메인에 현재 주소를 추가해주세요.'
        : error.code === 'auth/operation-not-allowed'
          ? 'Firebase Authentication에서 Google 로그인을 활성화해주세요.'
          : 'Google 로그인에 실패했어요. 잠시 후 다시 시도해주세요.'
      setAuthError(message)
      setAuthBusy(false)
    }
  }

  const continueAsGuest = async () => {
    setAuthBusy(true)
    setAuthError('')
    try {
      await signInAnonymously(auth)
    } catch (error) {
      console.error('Guest login failed:', error)
      setAuthError(error.code === 'auth/operation-not-allowed'
        ? 'Firebase Authentication에서 익명 로그인을 활성화해주세요.'
        : '비회원으로 시작하지 못했어요. 잠시 후 다시 시도해주세요.')
      setAuthBusy(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      window.history.replaceState({}, '', '/')
      setActiveTab('home')
      setSettingsOpen(false)
      setSelectedRoom(null)
    } catch (error) {
      console.error('Logout failed:', error)
      setToast('로그아웃에 실패했어요')
    }
  }

  const saveUserProfile = async (nextProfile, message) => {
    if (!auth.currentUser) {
      setUserProfile(nextProfile)
      setProfileSheet(null)
      setToast(message)
      return true
    }

    const uid = auth.currentUser.uid
    const nickname = nextProfile.name.trim().replace(/\s+/g, ' ')
    if (nickname.length < 2 || nickname.length > 20) {
      setToast('닉네임은 2~20자로 입력해주세요')
      return false
    }
    const nextNicknameKey = nicknamePathKey(nickname)
    const previousNicknameKey = nicknamePathKey(userProfile.name)
    const nicknameChanged = normalizeNickname(nickname) !== normalizeNickname(userProfile.name)
    try {
      if (nicknameChanged) {
        const reservation = await runTransaction(ref(database, `nicknames/${nextNicknameKey}`), (ownerUid) => (
          ownerUid === null || ownerUid === uid ? uid : undefined
        ), { applyLocally: false })
        if (!reservation.committed) {
          setToast('이미 사용 중인 닉네임이에요')
          return false
        }
      }
      const savedProfile = { ...nextProfile, name: nickname }
      const changes = {
        [`users/${uid}`]: {
          ...savedProfile,
          uid,
          email: auth.currentUser.email || '',
          profileDataVersion: PROFILE_DATA_VERSION,
          updatedAt: serverTimestamp(),
        },
        [`userDirectory/${uid}`]: {
          name: nickname,
          nameNormalized: normalizeNickname(nickname),
          email: auth.currentUser.email?.toLowerCase() || '',
          image: savedProfile.image || '/assets/default-profile.svg',
          updatedAt: serverTimestamp(),
        },
      }
      if (nicknameChanged && previousNicknameKey && previousNicknameKey !== nextNicknameKey) {
        const previousReservation = await get(ref(database, `nicknames/${previousNicknameKey}`))
        if (previousReservation.val() === uid) changes[`nicknames/${previousNicknameKey}`] = null
      }
      await update(ref(database), changes)
      setUserProfile(savedProfile)
      setProfileSheet(null)
      setToast(message)
      return true
    } catch (error) {
      console.error('Profile save failed:', error)
      setToast('닉네임 또는 프로필 저장에 실패했어요')
      return false
    }
  }

  const addRoom = async (name) => {
    if (!authUser) return
    const roomId = crypto.randomUUID()
    const code = createInviteCode()
    const roomData = {
      name: name.trim() || '새로운 모임',
      code,
      ownerId: authUser.uid,
      ownerName: userProfile.name,
      subtitle: '일정 미정 · 장소 미정',
      status: '방금 생성',
      color: roomColors[rooms.length % roomColors.length],
      createdAt: Date.now(),
      members: {
        [authUser.uid]: {
          name: userProfile.name,
          email: authUser.email || '',
          image: userProfile.image,
          role: 'owner',
          preferences: getProfilePreferences(userProfile),
          joinedAt: Date.now(),
        },
      },
      flow: {
        stage: 0,
        mode: 'ai',
        budgetMin: 8000,
        budgetMax: 20000,
        selectedMenu: '',
        selectedRestaurant: null,
        updatedAt: Date.now(),
      },
    }
    try {
      await update(ref(database), {
        [`rooms/${roomId}`]: roomData,
        [`userRooms/${authUser.uid}/${roomId}`]: true,
      })
      setSheet(null)
      openRoom(normalizeRoom(roomId, roomData))
      setToast('새 방을 만들었어요')
    } catch (error) {
      console.error('Room create failed:', error)
      setToast(error.code === 'PERMISSION_DENIED' ? '방 생성 권한이 없어요. Firebase 규칙을 게시해주세요' : `방 생성 실패 · ${error.code || 'DB 연결 확인'}`)
    }
  }

  const joinRoom = async (rawCode) => {
    if (!authUser) return
    const code = rawCode.trim().replace(/[<>\s]/g, '').toUpperCase()
    if (!code) {
      setToast('초대 코드를 입력해주세요')
      return
    }
    try {
      const snapshot = await get(query(ref(database, 'rooms'), orderByChild('code'), equalTo(code)))
      if (!snapshot.exists()) {
        setToast('해당 초대 코드의 방을 찾지 못했어요')
        return
      }
      const [roomId, roomData] = Object.entries(snapshot.val())[0]
      await update(ref(database), {
        [`rooms/${roomId}/members/${authUser.uid}`]: {
          name: userProfile.name,
          email: authUser.email || '',
          image: userProfile.image,
          role: roomData.ownerId === authUser.uid ? 'owner' : 'member',
          preferences: getProfilePreferences(userProfile),
          joinedAt: Date.now(),
        },
        [`userRooms/${authUser.uid}/${roomId}`]: true,
      })
      setSheet(null)
      setPendingJoinCode('')
      openRoom(normalizeRoom(roomId, {
        ...roomData,
        members: {
          ...(roomData.members || {}),
          [authUser.uid]: { name: userProfile.name, email: authUser.email || '', role: 'member' },
        },
      }), { replace: window.location.pathname.startsWith('/join/') })
      setToast('방에 참여했어요')
    } catch (error) {
      console.error('Room join failed:', error)
      setToast('방 접속에 실패했어요. DB 규칙을 확인해주세요')
    }
  }

  const deleteRoom = async (room) => {
    const memberIds = Object.keys(room.memberRecords || {})
    const changes = { [`rooms/${room.id}`]: null }
    memberIds.forEach((uid) => { changes[`userRooms/${uid}/${room.id}`] = null })
    try {
      await update(ref(database), changes)
      window.history.replaceState({}, '', '/rooms')
      setSelectedRoom(null)
      setActiveTab('rooms')
      setToast('방을 종료하고 삭제했어요')
    } catch (error) {
      console.error('Room delete failed:', error)
      setToast('방 삭제에 실패했어요')
      throw error
    }
  }

  const keepRoomAndReturnHome = async (room) => {
    if (!authUser || room.ownerId !== authUser.uid) {
      setToast('방장만 방을 초기화할 수 있어요')
      return
    }
    const changes = {
      [`rooms/${room.id}/flow/stage`]: 1,
      [`rooms/${room.id}/flow/mode`]: room.flow?.mode || 'ai',
      [`rooms/${room.id}/flow/selectedMenu`]: null,
      [`rooms/${room.id}/flow/selectedRestaurant`]: null,
      [`rooms/${room.id}/flow/tournamentComplete`]: false,
      [`rooms/${room.id}/flow/tournamentSessionId`]: null,
      [`rooms/${room.id}/flow/rouletteResult`]: null,
      [`rooms/${room.id}/flow/rouletteSpinning`]: false,
      [`rooms/${room.id}/flow/hotPotatoSessionId`]: null,
      [`rooms/${room.id}/flow/completedAt`]: null,
      [`rooms/${room.id}/flow/updatedAt`]: Date.now(),
      [`rooms/${room.id}/tournamentVotes`]: null,
      [`rooms/${room.id}/hotPotatoChoice`]: null,
    }
    Object.keys(room.memberRecords || {}).forEach((uid) => {
      changes[`rooms/${room.id}/members/${uid}/tournamentResult`] = null
      changes[`rooms/${room.id}/members/${uid}/hotPotatoResult`] = null
    })
    try {
      await update(ref(database), changes)
      navigateTo('/')
      setToast('멤버는 유지하고 방을 1단계로 초기화했어요')
    } catch (error) {
      console.error('Room reset failed:', error)
      setToast('방 초기화에 실패했어요')
    }
  }

  const leaveRoom = async (room, nextOwnerId = null) => {
    if (!authUser) return
    const changes = {
      [`rooms/${room.id}/members/${authUser.uid}`]: null,
      [`userRooms/${authUser.uid}/${room.id}`]: null,
    }
    if (room.ownerId === authUser.uid && nextOwnerId) {
      changes[`rooms/${room.id}/ownerId`] = nextOwnerId
      changes[`rooms/${room.id}/ownerName`] = room.memberRecords[nextOwnerId]?.name || '새 방장'
      changes[`rooms/${room.id}/members/${nextOwnerId}/role`] = 'owner'
    }
    try {
      await update(ref(database), changes)
      window.history.replaceState({}, '', '/rooms')
      setSelectedRoom(null)
      setActiveTab('rooms')
      setToast(nextOwnerId ? '방장을 양도하고 나왔어요' : '방에서 나왔어요')
    } catch (error) {
      console.error('Room leave failed:', error)
      setToast('방 나가기에 실패했어요')
      throw error
    }
  }

  const transferOwner = async (room, nextOwnerId) => {
    if (!authUser || room.ownerId !== authUser.uid) return
    try {
      await update(ref(database), {
        [`rooms/${room.id}/ownerId`]: nextOwnerId,
        [`rooms/${room.id}/ownerName`]: room.memberRecords[nextOwnerId]?.name || '새 방장',
        [`rooms/${room.id}/members/${authUser.uid}/role`]: 'member',
        [`rooms/${room.id}/members/${nextOwnerId}/role`]: 'owner',
      })
      setToast('방장을 양도했어요')
    } catch (error) {
      console.error('Owner transfer failed:', error)
      setToast('방장 양도에 실패했어요')
      throw error
    }
  }

  const addFriend = async (nickname) => {
    if (!authUser) return false
    const normalizedNickname = normalizeNickname(nickname)
    if (!normalizedNickname || normalizedNickname === normalizeNickname(userProfile.name)) {
      setToast('다른 사용자의 닉네임을 입력해주세요')
      return false
    }
    try {
      let friendUid = null
      const nicknameSnapshot = await get(ref(database, `nicknames/${nicknamePathKey(normalizedNickname)}`))
      if (nicknameSnapshot.exists()) friendUid = nicknameSnapshot.val()
      if (!friendUid) {
        const directoryQuery = query(ref(database, 'userDirectory'), orderByChild('nameNormalized'), equalTo(normalizedNickname))
        const directorySnapshot = await get(directoryQuery)
        friendUid = Object.keys(directorySnapshot.val() || {})[0] || null
      }
      if (!friendUid) {
        setToast('해당 닉네임의 사용자를 찾지 못했어요')
        return false
      }
      if (friendUid === authUser.uid) {
        setToast('내 닉네임은 친구로 추가할 수 없어요')
        return false
      }
      let friendSnapshot = await get(ref(database, `userDirectory/${friendUid}`))
      if (!friendSnapshot.exists()) {
        const directoryQuery = query(ref(database, 'userDirectory'), orderByChild('nameNormalized'), equalTo(normalizedNickname))
        const directorySnapshot = await get(directoryQuery)
        const fallbackUid = Object.keys(directorySnapshot.val() || {})[0]
        if (fallbackUid) {
          friendUid = fallbackUid
          friendSnapshot = await get(ref(database, `userDirectory/${friendUid}`))
        }
      }
      if (!friendSnapshot.exists()) {
        setToast('친구 프로필을 불러오지 못했어요')
        return false
      }
      const friend = friendSnapshot.val()
      await set(ref(database, `friends/${authUser.uid}/${friendUid}`), {
        name: friend.name || nickname.trim(),
        nicknameNormalized: normalizedNickname,
        image: friend.image || '/assets/default-profile.svg',
        addedAt: Date.now(),
      })
      setToast('친구를 추가했어요')
      return true
    } catch (error) {
      console.error('Friend add failed:', error)
      setToast('친구 추가에 실패했어요')
      return false
    }
  }

  const inviteFriend = async (room, friend) => {
    if (!authUser || room.ownerId !== authUser.uid) return
    if (room.memberRecords?.[friend.uid]) {
      setToast('이미 방에 참여 중인 친구예요')
      return
    }
    try {
      await update(ref(database), {
        [`rooms/${room.id}/members/${friend.uid}`]: {
          name: friend.name,
          email: friend.email || '',
          image: friend.image || '/assets/default-profile.svg',
          role: 'member',
          joinedAt: Date.now(),
        },
        [`userRooms/${friend.uid}/${room.id}`]: true,
      })
      setToast(`${friend.name}님을 방에 초대했어요`)
    } catch (error) {
      console.error('Friend invite failed:', error)
      setToast('친구 초대에 실패했어요')
    }
  }

  const updateRoomFlow = async (room, patch) => {
    if (!authUser || room.ownerId !== authUser.uid) return false
    try {
      await update(ref(database, `rooms/${room.id}/flow`), {
        ...patch,
        updatedAt: Date.now(),
      })
      return true
    } catch (error) {
      console.error('Room flow sync failed:', error)
      setToast('진행 상태 저장에 실패했어요')
      return false
    }
  }

  const submitTournamentResult = async (room, scores, winner, sessionId) => {
    if (!authUser || !sessionId) return false
    const result = {
      scores,
      winner,
      sessionId,
      voterName: userProfile.name,
      completedAt: Date.now(),
    }
    try {
      // Every member can always write their own member record. Keeping the result
      // here prevents a room-level rule from making other members appear incomplete.
      await set(ref(database, `rooms/${room.id}/members/${authUser.uid}/tournamentResult`), result)
      // Retain the original path as a backwards-compatible mirror. The member result
      // above remains the source of truth even if an older deployed rule rejects this.
      set(ref(database, `rooms/${room.id}/tournamentVotes/${authUser.uid}`), result)
        .catch((error) => console.warn('Tournament vote mirror failed:', error))
      setToast('내 월드컵 결과를 제출했어요')
      return true
    } catch (error) {
      console.error('Tournament result save failed:', error)
      setToast('월드컵 결과 저장에 실패했어요')
      return false
    }
  }

  const submitHotPotatoResult = async (room, elapsedMs, sessionId) => {
    if (!authUser || !sessionId) return false
    try {
      await set(ref(database, `rooms/${room.id}/members/${authUser.uid}/hotPotatoResult`), {
        sessionId,
        elapsedMs: Math.round(elapsedMs),
        playerName: userProfile.name,
        completedAt: Date.now(),
      })
      setToast('완주 기록을 제출했어요')
      return true
    } catch (error) {
      console.error('Hot potato result save failed:', error)
      setToast('완주 기록 저장에 실패했어요')
      return false
    }
  }

  const chooseHotPotatoMenu = async (room, menu, sessionId) => {
    if (!authUser || !sessionId || !menu) return false
    try {
      await set(ref(database, `rooms/${room.id}/hotPotatoChoice`), {
        sessionId,
        winnerUid: authUser.uid,
        winnerName: userProfile.name,
        menu,
        selectedAt: Date.now(),
      })
      setToast(`${menu} 메뉴를 선택했어요`)
      return true
    } catch (error) {
      console.error('Hot potato menu choice failed:', error)
      setToast('우승 메뉴 저장에 실패했어요')
      return false
    }
  }

  const recordMenuHistory = async (room) => {
    if (!authUser || !room?.flow?.selectedMenu) return
    const historyRef = ref(database, `users/${authUser.uid}/menuHistory`)
    try {
      const snapshot = await get(historyRef)
      const current = Array.isArray(snapshot.val()) ? snapshot.val() : Object.values(snapshot.val() || {})
      const entry = {
        roomId: room.id,
        roomName: room.name,
        menu: room.flow.selectedMenu,
        restaurant: room.flow.selectedRestaurant?.name || '',
        completedAt: Number(room.flow.completedAt || Date.now()),
      }
      const next = [entry, ...current.filter((item) => item?.roomId !== room.id)]
        .sort((a, b) => Number(b.completedAt || 0) - Number(a.completedAt || 0))
        .slice(0, 5)
      await set(historyRef, next)
      setUserProfile((profile) => ({ ...profile, menuHistory: next }))
    } catch (error) {
      console.error('Menu history save failed:', error)
      setToast('메뉴 기록 저장에 실패했어요')
    }
  }

  useEffect(() => {
    if (selectedRoom?.flow?.stage !== 4 || !selectedRoom.flow.selectedMenu) return
    recordMenuHistory(selectedRoom)
  }, [selectedRoom?.id, selectedRoom?.flow?.stage, selectedRoom?.flow?.selectedMenu])

  if (splashState !== 'hidden') {
    return (
      <AppFrame>
        <SplashScreen leaving={splashState === 'leaving'} />
      </AppFrame>
    )
  }

  if (authUser === undefined || (authUser && !profileReady)) {
    return (
      <AppFrame>
        <AuthLoadingScreen />
      </AppFrame>
    )
  }

  if (!authUser) {
    return (
      <AppFrame>
        <LoginScreen onLogin={loginWithGoogle} onGuest={continueAsGuest} busy={authBusy} error={authError} />
      </AppFrame>
    )
  }

  if (needsOnboarding) {
    return (
      <AppFrame>
        {authUser.isAnonymous ? (
          <GuestOnboardingScreen
            profile={userProfile}
            onBack={logout}
            onComplete={async (profile) => {
              const saved = await saveUserProfile({ ...profile, onboardingComplete: true }, '비회원 설정을 완료했어요')
              if (saved) setNeedsOnboarding(false)
              return saved
            }}
          />
        ) : (
          <OnboardingScreen
            profile={userProfile}
            onComplete={async (profile) => {
              const saved = await saveUserProfile({ ...profile, onboardingComplete: true }, '취향 설정을 완료했어요')
              if (saved) setNeedsOnboarding(false)
              return saved
            }}
          />
        )}
        {toast && <Toast>{toast}</Toast>}
      </AppFrame>
    )
  }

  if (selectedRoom) {
    return (
      <AppFrame>
        <RoomDetail
          room={selectedRoom}
          currentUser={authUser}
          friends={friends}
          onBack={() => navigateTo('/rooms')}
          onShare={() => setShareRoom(selectedRoom)}
          onDelete={() => deleteRoom(selectedRoom)}
          onLeave={(nextOwnerId) => leaveRoom(selectedRoom, nextOwnerId)}
          onTransfer={(nextOwnerId) => transferOwner(selectedRoom, nextOwnerId)}
          onOpenFriends={() => setFriendSheetRoom(selectedRoom)}
          onFlowChange={(patch) => updateRoomFlow(selectedRoom, patch)}
          onTournamentSubmit={(scores, winner, sessionId) => submitTournamentResult(selectedRoom, scores, winner, sessionId)}
          onHotPotatoSubmit={(elapsedMs, sessionId) => submitHotPotatoResult(selectedRoom, elapsedMs, sessionId)}
          onHotPotatoChoose={(menu, sessionId) => chooseHotPotatoMenu(selectedRoom, menu, sessionId)}
          onKeep={() => keepRoomAndReturnHome(selectedRoom)}
        />
        {shareRoom && <ShareModal room={shareRoom} onClose={() => setShareRoom(null)} onToast={setToast} />}
        {friendSheetRoom && (
          <FriendInviteSheet
            room={friendSheetRoom}
            friends={friends}
            onClose={() => setFriendSheetRoom(null)}
            onAddFriend={addFriend}
            onInvite={(friend) => inviteFriend(friendSheetRoom, friend)}
          />
        )}
        {toast && <Toast>{toast}</Toast>}
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <main className={`page ${activeTab === 'rooms' ? 'rooms-page' : ''} ${activeTab === 'home' ? 'home-page' : ''}`}>
        {activeTab === 'home' && (
          <HomeScreen
            rooms={rooms}
            onOpenRoom={openRoom}
            onGoRooms={() => navigateTo('/rooms')}
            onOpenCreate={() => setSheet('create')}
            onOpenJoin={() => { setPendingJoinCode(''); setSheet('join') }}
            onOpenHistory={() => {
              setProfileFocus('history')
              navigateTo('/profile')
            }}
            onOpenTaste={() => {
              setProfileFocus('taste')
              navigateTo('/profile')
              setProfileSheet('taste')
            }}
          />
        )}
        {activeTab === 'rooms' && (
          <RoomsScreen
            rooms={rooms}
            loading={roomsLoading}
            loadStatus={roomsLoadStatus}
            loadError={roomsLoadError}
            profileName={userProfile.name}
            onOpenRoom={openRoom}
            onShareRoom={setShareRoom}
            onCreate={() => setSheet('create')}
            onJoin={() => setSheet('join')}
          />
        )}
        {activeTab === 'community' && <PlaceholderScreen type="community" />}
        {activeTab === 'profile' && (settingsOpen ? (
          <SettingsScreen
            profile={userProfile}
            settings={appSettings}
            onBack={() => navigateTo('/profile')}
            onChange={saveAppSetting}
            onAction={setToast}
            onLogout={logout}
          />
        ) : (
          <ProfileScreen
            profile={userProfile}
            focusTarget={profileFocus}
            onOpenSettings={() => navigateTo('/settings')}
            onEditProfile={() => authUser.isAnonymous ? setToast('비회원은 프로필 설정을 사용할 수 없어요') : setProfileSheet('profile')}
            onEditTaste={() => authUser.isAnonymous ? setToast('비회원은 처음 설정한 취향만 사용할 수 있어요') : setProfileSheet('taste')}
          />
        ))}
      </main>

      <BottomNav
        active={activeTab}
        onChange={(nextTab) => {
          navigateTo({ home: '/', rooms: '/rooms', community: '/community', profile: '/profile' }[nextTab])
        }}
      />
      {shareRoom && <ShareModal room={shareRoom} onClose={() => setShareRoom(null)} onToast={setToast} />}
      {sheet && (
        <ActionSheet
          type={sheet}
          initialCode={pendingJoinCode}
          onClose={() => {
            setSheet(null)
            if (window.location.pathname.startsWith('/join/')) navigateTo('/rooms', { replace: true })
          }}
          onCreate={addRoom}
          onJoin={joinRoom}
        />
      )}
      {profileSheet === 'profile' && (
        <ProfileEditSheet
          profile={userProfile}
          onClose={() => setProfileSheet(null)}
          onSave={(nextProfile) => saveUserProfile(nextProfile, '프로필을 저장했어요')}
        />
      )}
      {profileSheet === 'taste' && (
        <TasteEditSheet
          profile={userProfile}
          onClose={() => setProfileSheet(null)}
          onSave={(nextProfile) => saveUserProfile(nextProfile, '음식 취향을 저장했어요')}
        />
      )}
      {toast && <Toast>{toast}</Toast>}
    </AppFrame>
  )
}

function AppFrame({ children }) {
  return (
    <div className="site-shell">
      <div className="app-frame">{children}</div>
    </div>
  )
}

function AuthLoadingScreen() {
  return (
    <main className="auth-page auth-loading" aria-label="로그인 상태 확인 중">
      <span className="auth-spinner" />
      <p>로그인 상태를 확인하고 있어요</p>
    </main>
  )
}

function SplashScreen({ leaving }) {
  return (
    <main className={`splash-page ${leaving ? 'leaving' : ''}`} aria-label="모두만족 시작 화면">
      <div className="splash-brand">
        <img src="/assets/modumanjok-logo.png" alt="모두만족 로고" />
        <h1>모두만족</h1>
        <p>모두가 만족하는 한 끼를 찾아드려요</p>
      </div>
      <aside className="splash-ad" aria-label="가상 광고">
        <span className="splash-ad-kicker">CAMPUS FOOD WEEK</span>
        <strong>학교 앞 맛집 할인전</strong>
        <small>스타트업톤 시연용 가상 광고입니다.</small>
        <span className="ad-badge">AD</span>
      </aside>
    </main>
  )
}

function OnboardingScreen({ profile, onComplete }) {
  const [name, setName] = useState(profile.name)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState({ cuisine: [], form: [], cooking: [], allergies: [] })
  const [avoidedText, setAvoidedText] = useState('')
  const options = {
    allergies: ['난류(가금류)', '우유', '메밀', '땅콩', '대두(콩류)', '밀', '잣', '호두', '갑각류', '게', '새우', '오징어', '고등어', '조개류(굴·전복·홍합)', '복숭아', '토마토', '닭고기', '돼지고기', '쇠고기', '아황산류'],
    cuisine: ['한식', '중식', '일식', '양식', '동남아 음식', '인도·중동 음식', '분식', '패스트푸드', '기타'],
    form: ['밥류', '면류', '빵류', '고기류', '해산물류', '채소류', '떡류'],
    cooking: ['국물', '볶음', '구이', '튀김', '찜', '조림', '비빔', '생식 (회·육회 등)'],
  }
  const toggle = (group, item) => setSelected((current) => ({
    ...current,
    [group]: current[group].includes(item) ? current[group].filter((value) => value !== item) : [...current[group], item],
  }))
  const submit = async () => {
    setBusy(true)
    await onComplete({
      ...profile,
      name: name.trim(),
      ...selected,
      avoided: avoidedText.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
    })
    setBusy(false)
  }
  const hasPreference = selected.cuisine.length || selected.form.length || selected.cooking.length
  return (
    <main className="onboarding-page">
      <div className="onboarding-head"><img src="/assets/modumanjok-logo.png" alt="" /><span><small>처음 오셨군요!</small><h1>내 음식 취향 설정</h1><p>모두가 함께 먹을 수 있는 메뉴를 찾기 위해 꼭 필요한 정보예요.</p></span></div>
      <div className="onboarding-scroll">
        <label className="field-label">사용할 닉네임<input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} placeholder="2~20자 고유 닉네임" /></label>
        {[
          ['allergies', '1. 알레르기', '해당하는 알레르기를 먼저 선택해주세요.'],
          ['cuisine', '2. 선호하는 음식 종류', '평소 좋아하는 음식 종류를 골라주세요.'],
          ['form', '3. 선호하는 음식 형태', '밥·면·고기처럼 좋아하는 형태를 골라주세요.'],
          ['cooking', '4. 선호하는 조리 방식', '좋아하는 조리 방식을 골라주세요.'],
        ].map(([group, label, description]) => (
          <section className="onboarding-choice" key={group}><strong>{label}</strong><small>{description}</small><div>{options[group].map((item) => <button type="button" key={item} className={selected[group].includes(item) ? 'selected' : ''} onClick={() => toggle(group, item)}>{item}</button>)}</div></section>
        ))}
        <label className="subjective-field"><strong>5. 못 먹는 음식</strong><textarea value={avoidedText} onChange={(event) => setAvoidedText(event.target.value)} placeholder="예: 가지, 고수, 오이" rows={3} /><small>쉼표 또는 줄바꿈으로 구분해주세요.</small></label>
      </div>
      <button type="button" className="room-primary-button onboarding-submit" disabled={busy || name.trim().length < 2 || !hasPreference} onClick={submit}>{busy ? '저장 중…' : '설정 완료하고 시작하기'} <ChevronRight size={18} /></button>
    </main>
  )
}

function GuestOnboardingScreen({ profile, onComplete, onBack }) {
  const [selected, setSelected] = useState({
    allergies: profile.allergies || [],
    cuisine: profile.cuisine || [],
    form: profile.form || [],
    cooking: profile.cooking || [],
  })
  const [busy, setBusy] = useState(false)
  const allergies = ['난류(가금류)', '우유', '메밀', '땅콩', '대두(콩류)', '밀', '잣', '호두', '갑각류', '게', '새우', '오징어', '고등어', '조개류(굴·전복·홍합)', '복숭아', '토마토', '닭고기', '돼지고기', '쇠고기', '아황산류']
  const options = {
    cuisine: ['한식', '중식', '일식', '양식', '동남아 음식', '인도·중동 음식', '분식', '패스트푸드', '기타'],
    form: ['밥류', '면류', '빵류', '고기류', '해산물류', '채소류', '떡류'],
    cooking: ['국물', '볶음', '구이', '튀김', '찜', '조림', '비빔', '생식 (회·육회 등)'],
  }
  const toggle = (group, item) => setSelected((current) => ({
    ...current,
    [group]: current[group].includes(item) ? current[group].filter((value) => value !== item) : [...current[group], item],
  }))
  const submit = async () => {
    setBusy(true)
    const saved = await onComplete({
      ...profile,
      ...selected,
      avoided: [],
    })
    if (!saved) setBusy(false)
  }
  return (
    <main className="onboarding-page guest-onboarding-page">
      <div className="onboarding-head"><button type="button" className="icon-button back-button" onClick={onBack} aria-label="로그인으로 돌아가기"><ArrowLeft size={22} /></button><img src="/assets/modumanjok-logo.png" alt="" /><span><small>빠르게 시작하기</small><h1>비회원 간단 설정</h1><p>알레르기와 선호하는 음식 조건만 고르면 바로 모임에 참여할 수 있어요.</p></span></div>
      <div className="guest-name-chip"><span>임시 닉네임</span><strong>{profile.name}</strong><small>프로필 설정에서 변경할 수 없어요.</small></div>
      <div className="onboarding-scroll guest-onboarding-scroll">
        <section className="onboarding-choice"><strong>1. 알레르기</strong><small>해당하는 항목을 모두 선택해주세요. 없으면 건너뛰어도 돼요.</small><div>{allergies.map((item) => <button type="button" key={item} className={selected.allergies.includes(item) ? 'selected' : ''} onClick={() => toggle('allergies', item)}>{item}</button>)}</div></section>
        {[['cuisine', '2. 선호하는 음식 종류'], ['form', '3. 선호하는 음식 형태'], ['cooking', '4. 선호하는 조리 방식']].map(([group, label]) => (
          <section className="onboarding-choice" key={group}><strong>{label}</strong><small>원하는 항목을 모두 선택해주세요.</small><div>{options[group].map((item) => <button type="button" key={item} className={selected[group].includes(item) ? 'selected' : ''} onClick={() => toggle(group, item)}>{item}</button>)}</div></section>
        ))}
      </div>
      <button type="button" className="room-primary-button onboarding-submit" disabled={busy || !(selected.cuisine.length || selected.form.length || selected.cooking.length)} onClick={submit}>{busy ? '저장 중…' : '설정 완료하고 방 접속하기'} <ChevronRight size={18} /></button>
    </main>
  )
}

function LoginScreen({ onLogin, onGuest, busy, error }) {
  return (
    <main className="auth-page login-page">
      <div className="login-copy">
        <span>WELCOME</span>
        <h1>같이 먹을 메뉴,<br />이제 빠르게 정해요.</h1>
        <p>Google 계정으로 시작하면 내 취향과 모임 기록을 안전하게 저장할 수 있어요.</p>
      </div>
      <div className="login-visual" aria-hidden="true">
        <span className="login-brand-logo"><img src="/assets/modumanjok-logo.png" alt="" /></span>
        <div><UsersRound size={24} /><Sparkles size={22} /></div>
      </div>
      <div className="login-actions">
        <button type="button" className="google-login-button" onClick={onLogin} disabled={busy}>
          <span className="google-mark">G</span>
          {busy ? 'Google 연결 중…' : 'Google로 계속하기'}
        </button>
        <button type="button" className="guest-login-button" onClick={onGuest} disabled={busy}>비회원으로 계속</button>
        {error && <p className="auth-error"><AlertTriangle size={14} /> {error}</p>}
        <small>계속하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.</small>
      </div>
    </main>
  )
}

function Header({ eyebrow, title, back, onBack, action }) {
  return (
    <header className="top-header">
      <div className="header-title-wrap">
        {back && (
          <button type="button" className="icon-button back-button" onClick={onBack} aria-label="뒤로가기">
            <ArrowLeft size={22} />
          </button>
        )}
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
        </div>
      </div>
      {action}
    </header>
  )
}

function AnimatedHomeTitle({ children }) {
  const characters = [...children]
  return (
    <span className="animated-home-title" aria-label={children}>
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          style={{ '--character-index': index }}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  )
}

function HomeScreen({ rooms, onOpenRoom, onGoRooms, onOpenCreate, onOpenJoin, onOpenHistory, onOpenTaste }) {
  const recentRoom = rooms[0]
  const [homeTitle] = useState(() => homeTitleMessages[Math.floor(Math.random() * homeTitleMessages.length)])
  return (
    <>
      <Header eyebrow="반가워요 👋" title={<AnimatedHomeTitle>{homeTitle}</AnimatedHomeTitle>} action={<span />} />
      <HomeAdCarousel onOpenCreate={onOpenCreate} />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RECENT ROOM</span>
            <h2>최근 참여한 방</h2>
          </div>
          <button type="button" className="text-button" onClick={onGoRooms}>전체보기 <ChevronRight size={16} /></button>
        </div>
        {recentRoom ? (
          <button type="button" className="recent-room" onClick={() => onOpenRoom(recentRoom)}>
            <div className="recent-top">
              <div><h3>{recentRoom.name}</h3><small>방 이어가기</small></div>
              <div className="round-arrow"><ChevronRight size={21} /></div>
            </div>
            <div className="summary-grid">
              <div className="summary-item"><span className="summary-icon lime"><UsersRound size={18} /></span><span><small>참여 인원</small><strong>{recentRoom.members.length}명</strong></span></div>
              <div className="summary-item"><span className="summary-icon coral"><QrCode size={18} /></span><span><small>초대 코드</small><strong>{recentRoom.code}</strong></span></div>
              <div className="summary-item"><span className="summary-icon sky"><Play size={18} /></span><span><small>진행 상태</small><strong>처음부터</strong></span></div>
            </div>
          </button>
        ) : (
          <button type="button" className="recent-room empty-recent-room" onClick={onOpenCreate}><Plus size={22} /><span><b>참여 중인 방이 없어요</b><small>새 모임을 만들어 시작해보세요.</small></span></button>
        )}
      </section>

      <section className="section-block compact">
        <div className="section-heading">
          <div>
            <span className="section-kicker">QUICK MENU</span>
            <h2>빠른 메뉴</h2>
          </div>
        </div>
        <div className="quick-grid">
          <button type="button" onClick={onOpenJoin}><span className="quick-icon"><LogIn size={22} /></span><b>코드로 방 접속</b><small>초대 코드 입력</small></button>
          <button type="button" onClick={onOpenHistory}><span className="quick-icon coral"><UtensilsCrossed size={22} /></span><b>최근 메뉴</b><small>결정 기록</small></button>
          <button type="button" onClick={onOpenTaste}><span className="quick-icon sky"><Coffee size={22} /></span><b>취향 설정</b><small>내 조건 관리</small></button>
        </div>
      </section>
    </>
  )
}

function HomeAdCarousel({ onOpenCreate }) {
  const ads = [
    { label: 'AD · 모두만족 PICK', title: '오늘 첫 모임은\n배달비 3,000원 할인', copy: '가상의 프로모션 광고입니다.', action: '쿠폰 보기', tone: 'ad-dark' },
    { label: 'AD · CAMPUS', title: '학교 앞 인기 메뉴\n점심 세트 모아보기', copy: '학생 모임을 위한 가상 광고', action: '둘러보기', tone: 'ad-light' },
    { label: '모두만족', title: '친구를 모으고\n메뉴를 바로 정해요', copy: '방을 만들고 초대 코드를 공유하세요.', action: '새 모임 시작', tone: 'ad-accent' },
  ]
  const scroller = useRef(null)
  const [activeAd, setActiveAd] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAd((current) => {
        const next = (current + 1) % ads.length
        scroller.current?.scrollTo({ left: scroller.current.clientWidth * next, behavior: 'smooth' })
        return next
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [ads.length])

  const moveToAd = (index) => {
    setActiveAd(index)
    scroller.current?.scrollTo({ left: scroller.current.clientWidth * index, behavior: 'smooth' })
  }

  return (
    <section className="home-ad-wrap" aria-label="프로모션">
      <div
        ref={scroller}
        className="home-ad-carousel"
        onScroll={(event) => setActiveAd(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
      >
        {ads.map((ad, index) => (
          <article className={`home-ad-card ${ad.tone}`} key={ad.title}>
            <span>{ad.label}</span><h2>{ad.title.split('\n').map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</h2><p>{ad.copy}</p>
            <button type="button" onClick={index === 2 ? onOpenCreate : () => {}}>{ad.action}</button>
            <span className="ad-badge">AD</span>
          </article>
        ))}
      </div>
      <div className="ad-dots" aria-label="광고 배너 선택">
        {ads.map((ad, index) => (
          <button
            type="button"
            key={ad.title}
            className={activeAd === index ? 'active' : ''}
            aria-label={`${index + 1}번째 배너로 이동`}
            aria-current={activeAd === index ? 'true' : undefined}
            onClick={() => moveToAd(index)}
          />
        ))}
      </div>
    </section>
  )
}

function RoomsScreen({ rooms, loading, loadStatus, loadError, profileName, onOpenRoom, onShareRoom, onCreate, onJoin }) {
  const [query, setQuery] = useState('')
  const filtered = rooms.filter((room) => room.name.includes(query))
  return (
    <div className="rooms-screen">
      <div className="rooms-fixed-area">
        <Header eyebrow="ROOMS" title="내가 참여한 방" action={<span />} />
        <div className="room-account-bar" aria-label="방 바로가기">
          <button type="button" className="profile-name-button" aria-label={`${profileName} 계정 메뉴`}>
            <span>{profileName}</span>
          </button>
          <div className="room-account-actions">
            <button type="button" className="room-action-button" onClick={onCreate} aria-label="방 생성" data-tooltip="방 생성">
              <SquarePlus size={24} strokeWidth={2} />
            </button>
            <button type="button" className="room-action-button" onClick={onJoin} aria-label="방 접속" data-tooltip="방 접속">
              <LogIn size={25} strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <div className="search-box">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="방 이름 검색" aria-label="방 이름 검색" />
        </div>
      </div>
      <div className="rooms-scroll-area">
        <div className={`room-load-status ${loadStatus}`} role="status">
          {loadStatus === 'loading' && <><span className="mini-spinner" /> 방 불러오는 중</>}
          {loadStatus === 'ready' && <><CheckCircle2 size={14} /> 방 불러오기 완료</>}
          {loadStatus === 'error' && <><AlertTriangle size={14} /> DB 연결 실패 · {loadError}</>}
        </div>
        <div className="room-list-heading">
          <p>총 <strong>{filtered.length}</strong>개의 방</p>
          <span>길게 눌러 초대 코드 보기</span>
        </div>
        <section className="room-list">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onOpen={() => onOpenRoom(room)} onLongPress={() => onShareRoom(room)} />
          ))}
        </section>
        {filtered.length === 0 && <div className="empty-state"><Search size={28} /><p>{loading ? '방 목록을 불러오는 중이에요.' : query ? '검색한 방이 없어요.' : '참여 중인 방이 없어요.'}</p></div>}
      </div>
    </div>
  )
}

function RoomCard({ room, onOpen, onLongPress }) {
  const timer = useRef(null)
  const longPressed = useRef(false)

  const startPress = () => {
    longPressed.current = false
    timer.current = setTimeout(() => {
      longPressed.current = true
      onLongPress()
    }, 550)
  }
  const clearPress = () => clearTimeout(timer.current)
  const handleClick = () => {
    if (!longPressed.current) onOpen()
    longPressed.current = false
  }

  const visibleMembers = room.members.slice(0, 3)
  const hiddenCount = Math.max(room.members.length - 3, 0)
  return (
    <button
      type="button"
      className={`room-card ${room.color}`}
      onPointerDown={startPress}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(event) => { event.preventDefault(); onLongPress() }}
      onClick={handleClick}
    >
      <div className="room-card-head">
        <h2>{room.name}</h2>
        <ChevronRight size={20} />
      </div>
      <div className="member-row">
        <div className="avatars">
          {visibleMembers.map((member, index) => <span key={member} style={{ zIndex: 4 - index }}>{member.slice(0, 1)}</span>)}
          {hiddenCount > 0 && <span className="more-avatar">+{hiddenCount}</span>}
        </div>
        <p>{visibleMembers.join(', ')}{hiddenCount > 0 ? '…' : ''}</p>
      </div>
    </button>
  )
}

function RoomDetail({ room, currentUser, friends, onBack, onShare, onDelete, onLeave, onTransfer, onOpenFriends, onFlowChange, onTournamentSubmit, onHotPotatoSubmit, onHotPotatoChoose, onKeep }) {
  const pageRef = useRef(null)
  const menuConfirmationRef = useRef({ roomId: room.id, stage: Number(room.flow?.stage || 0) })
  const [stage, setStage] = useState(Number(room.flow?.stage || 0))
  const [mode, setMode] = useState(room.flow?.mode || 'ai')
  const [selectedMenu, setSelectedMenu] = useState(room.flow?.selectedMenu || aiMenuCandidates[0].name)
  const [menuCandidates, setMenuCandidates] = useState(aiMenuCandidates)
  const [menuApiStatus, setMenuApiStatus] = useState('idle')
  const [menuApiMessage, setMenuApiMessage] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [tournamentRoundMenus, setTournamentRoundMenus] = useState(tournamentMenus)
  const [tournamentRoundWinners, setTournamentRoundWinners] = useState([])
  const [tournamentMatchIndex, setTournamentMatchIndex] = useState(0)
  const [tournamentComplete, setTournamentComplete] = useState(false)
  const [tournamentScores, setTournamentScores] = useState({})
  const [rouletteState, setRouletteState] = useState(room.flow?.rouletteResult ? 'stopped' : 'idle')
  const [rouletteAngle, setRouletteAngle] = useState(0)
  const [rouletteResult, setRouletteResult] = useState(room.flow?.rouletteResult || '')
  const rouletteTimer = useRef(null)
  const [hotPotatoPhase, setHotPotatoPhase] = useState('ready')
  const [hotPotatoCountdown, setHotPotatoCountdown] = useState(3)
  const [foilTaps, setFoilTaps] = useState(0)
  const [coolProgress, setCoolProgress] = useState(0)
  const [eatTaps, setEatTaps] = useState(0)
  const [hotPotatoElapsed, setHotPotatoElapsed] = useState(null)
  const hotPotatoStartedAt = useRef(0)
  const hotPotatoCountdownTimer = useRef(null)
  const coolPointer = useRef({ active: false, x: 0, y: 0 })
  const [selectedRestaurant, setSelectedRestaurant] = useState(room.flow?.selectedRestaurant || null)
  const [naverRestaurants, setNaverRestaurants] = useState([])
  const [restaurantSource, setRestaurantSource] = useState('location')
  const [restaurantMessage, setRestaurantMessage] = useState('')
  const [currentArea, setCurrentArea] = useState('')
  const [expandedRestaurant, setExpandedRestaurant] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false)
  const [pullBack, setPullBack] = useState({ distance: 0, armed: false })
  const pullStartY = useRef(null)
  const pullEligible = useRef(false)
  const pullArmed = useRef(false)
  const previousStage = useRef(stage)
  const transitionDirection = stage >= previousStage.current ? 'forward' : 'backward'
  const isOwner = room.ownerId === currentUser.uid
  const memberEntries = Object.entries(room.memberRecords || {})
  const preferenceSignature = JSON.stringify(memberEntries.map(([uid, member]) => [uid, member.preferences || null]))
  const roomBudgetMin = Number(room.flow?.budgetMin ?? 8000)
  const roomBudgetMax = Number(room.flow?.budgetMax ?? 20000)
  const safeMenuNames = getSafeMenuNames(room.memberRecords)
  const rouletteMenus = [...safeMenuNames]
    .sort((a, b) => seededMenuValue(`${room.id}-roulette-${a}`) - seededMenuValue(`${room.id}-roulette-${b}`))
    .slice(0, 16)
  const tournamentSessionId = room.flow?.tournamentSessionId || ''
  const hotPotatoSessionId = room.flow?.hotPotatoSessionId || ''
  const tournamentVoteMap = new Map()
  Object.entries(room.tournamentVotes || {}).forEach(([uid, vote]) => {
    if (vote?.sessionId === tournamentSessionId) tournamentVoteMap.set(uid, vote)
  })
  memberEntries.forEach(([uid, member]) => {
    const vote = member?.tournamentResult
    if (vote?.sessionId === tournamentSessionId) tournamentVoteMap.set(uid, vote)
  })
  const tournamentVotes = [...tournamentVoteMap.values()]
  const currentTournamentVote = room.memberRecords?.[currentUser.uid]?.tournamentResult || room.tournamentVotes?.[currentUser.uid]
  const hasSubmittedTournament = currentTournamentVote?.sessionId === tournamentSessionId
  const tournamentAllComplete = Boolean(tournamentSessionId) && tournamentVotes.length >= memberEntries.length
  const tournamentTotals = tournamentVotes.reduce((totals, vote) => {
    Object.entries(vote.scores || {}).forEach(([menu, score]) => { totals[menu] = (totals[menu] || 0) + Number(score || 0) })
    return totals
  }, {})
  const groupTournamentWinner = Object.entries(tournamentTotals).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || ''
  const hotPotatoResults = memberEntries
    .map(([uid, member]) => ({ uid, ...member.hotPotatoResult }))
    .filter((result) => result.sessionId === hotPotatoSessionId && Number.isFinite(result.elapsedMs))
    .sort((a, b) => a.elapsedMs - b.elapsedMs)
  const hotPotatoAllComplete = Boolean(hotPotatoSessionId) && hotPotatoResults.length >= memberEntries.length
  const hotPotatoWinner = hotPotatoResults[0] || null
  const currentHotPotatoResult = room.memberRecords?.[currentUser.uid]?.hotPotatoResult
  const hasFinishedHotPotato = currentHotPotatoResult?.sessionId === hotPotatoSessionId
  const hotPotatoChoice = room.hotPotatoChoice?.sessionId === hotPotatoSessionId ? room.hotPotatoChoice : null

  useEffect(() => {
    const flow = room.flow || {}
    setStage(Number(flow.stage || 0))
    setMode(flow.mode || 'ai')
    if (flow.selectedMenu) setSelectedMenu(flow.selectedMenu)
    if (flow.selectedRestaurant) setSelectedRestaurant(flow.selectedRestaurant)
    if (flow.rouletteSpinning) {
      setRouletteState('spinning')
      if (!isOwner) setRouletteAngle((current) => current + 2160)
    } else if (flow.rouletteResult) {
      setRouletteResult(flow.rouletteResult)
      setRouletteState('stopped')
    } else if (flow.mode === 'roulette') {
      setRouletteResult('')
      setRouletteState('idle')
    }
  }, [room.flow?.stage, room.flow?.mode, room.flow?.selectedMenu, room.flow?.rouletteResult, room.flow?.rouletteSpinning, room.flow?.updatedAt])

  useEffect(() => {
    const nextStage = Number(room.flow?.stage || 0)
    const previous = menuConfirmationRef.current
    menuConfirmationRef.current = { roomId: room.id, stage: nextStage }
    if (previous.roomId !== room.id || previous.stage >= 3 || nextStage !== 3 || !room.flow?.selectedMenu) return
    if (document.visibilityState !== 'visible' || !window.matchMedia('(pointer: coarse)').matches) return
    if (typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([120, 80, 120])
      } catch {
        // Vibration may be blocked by the device or browser settings.
      }
    }
  }, [room.id, room.flow?.stage, room.flow?.selectedMenu])

  useEffect(() => () => clearTimeout(rouletteTimer.current), [])

  useEffect(() => {
    resetTournament()
    setTournamentScores({})
  }, [tournamentSessionId])

  useEffect(() => {
    clearInterval(hotPotatoCountdownTimer.current)
    setHotPotatoPhase(hasFinishedHotPotato ? 'done' : 'ready')
    setHotPotatoCountdown(3)
    setFoilTaps(0)
    setCoolProgress(0)
    setEatTaps(0)
    setHotPotatoElapsed(hasFinishedHotPotato ? currentHotPotatoResult.elapsedMs : null)
  }, [hotPotatoSessionId])

  useEffect(() => () => clearInterval(hotPotatoCountdownTimer.current), [])

  useEffect(() => {
    if (!isOwner || !tournamentAllComplete || !groupTournamentWinner || room.flow?.selectedMenu === groupTournamentWinner) return
    setSelectedMenu(groupTournamentWinner)
    onFlowChange({ selectedMenu: groupTournamentWinner, tournamentComplete: true })
  }, [isOwner, tournamentAllComplete, groupTournamentWinner, room.flow?.selectedMenu])

  useEffect(() => {
    if (!isOwner || !hotPotatoChoice?.menu || room.flow?.selectedMenu === hotPotatoChoice.menu) return
    setSelectedMenu(hotPotatoChoice.menu)
    moveToStage(3, { selectedMenu: hotPotatoChoice.menu })
  }, [isOwner, hotPotatoChoice?.menu, room.flow?.selectedMenu])

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    previousStage.current = stage
  }, [stage])

  useEffect(() => {
    const candidates = makePreferenceCandidates(room.memberRecords, roomBudgetMin, roomBudgetMax)
    setMenuCandidates(candidates)
    setMenuApiStatus('ready')
    const preferenceCount = memberEntries.filter(([, member]) => member.preferences).length
    setMenuApiMessage(`${preferenceCount}/${memberEntries.length}명의 취향과 ${roomBudgetMin.toLocaleString('ko-KR')}~${roomBudgetMax.toLocaleString('ko-KR')}원 예산을 반영했어요.`)
    if (stage <= 2 && !room.flow?.selectedMenu && candidates[0]) setSelectedMenu(candidates[0].unavailable ? null : candidates[0].name)
  }, [preferenceSignature, roomBudgetMin, roomBudgetMax])

  useEffect(() => {
    if (stage < 3 || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    )
  }, [stage])

  useEffect(() => {
    if (stage !== 3 || !selectedMenu || !userLocation) return
    let cancelled = false
    const keyId = import.meta.env.VITE_NAVER_MAP_NCP_KEY_ID
    setRestaurantSource('loading')
    setRestaurantMessage('네이버에서 현재 위치의 주소를 확인하는 중이에요.')
    reverseGeocodeArea(userLocation, keyId).then(({ query: areaQuery, label }) => {
      if (cancelled) return null
      setCurrentArea(label)
      setRestaurantMessage(`${label} 주변 식당을 찾는 중이에요.`)
      return loadNaverRestaurants(selectedMenu, areaQuery)
    }).then((result) => {
      if (!result || cancelled) return
      const { items } = result
      if (cancelled) return
      if (!items.length) throw new Error(`${currentArea || '현재 지역'} 검색 결과가 없어요.`)
      setNaverRestaurants(items)
      setRestaurantSource('naver')
      setRestaurantMessage('현재 위치의 행정구역을 기준으로 찾은 네이버 검색 결과예요.')
    }).catch((error) => {
      if (cancelled) return
      setNaverRestaurants([])
      setRestaurantSource('error')
      setRestaurantMessage(error.message)
    })
    return () => { cancelled = true }
  }, [stage, selectedMenu, userLocation?.lat, userLocation?.lng])

  const stageTitles = ['대기실', '메뉴 고르기 모드', mode === 'ai' ? '맞춤 메뉴 추천' : mode === 'tournament' ? '메뉴 이상형 월드컵' : mode === 'roulette' ? '메뉴 룰렛' : 'Hot Potato 먹기 도전', '주변 매장 찾기', '식사 준비 완료']
  const tournamentPair = tournamentRoundMenus.slice(tournamentMatchIndex * 2, tournamentMatchIndex * 2 + 2)
  const tournamentRoundLabel = tournamentRoundMenus.length === 2 ? '결승' : `${tournamentRoundMenus.length}강`
  const tournamentMatchCount = Math.max(1, tournamentRoundMenus.length / 2)
  const selectedCandidate = menuCandidates.find((candidate) => candidate.name === selectedMenu)
  const isAllergyFallback = menuCandidates.some((candidate) => candidate.fallback)
  const restaurantOptions = naverRestaurants

  const resetTournament = () => {
    setTournamentRoundMenus(getTournamentBracket(room.memberRecords, tournamentSessionId || room.id))
    setTournamentRoundWinners([])
    setTournamentMatchIndex(0)
    setTournamentComplete(false)
    setTournamentScores({})
  }

  const resetRoulette = () => {
    clearTimeout(rouletteTimer.current)
    setRouletteState('idle')
    setRouletteResult('')
    setRouletteAngle(0)
  }

  const selectMode = (nextMode) => {
    if (!isOwner) return
    setMode(nextMode)
    const firstMenu = menuCandidates[0]?.unavailable ? null : menuCandidates[0]?.name
    setSelectedMenu(nextMode === 'ai' ? firstMenu : null)
    resetTournament()
    resetRoulette()
    onFlowChange({ mode: nextMode, selectedMenu: nextMode === 'ai' ? firstMenu || '' : '', rouletteResult: null, rouletteSpinning: false })
  }

  const moveToStage = (nextStage, extra = {}) => {
    if (!isOwner) return
    setStage(nextStage)
    onFlowChange({ stage: nextStage, mode, selectedMenu: selectedMenu || '', ...extra })
  }

  const pickTournamentMenu = (menu) => {
    const nextScores = { ...tournamentScores, [menu]: (tournamentScores[menu] || 0) + 1 }
    setTournamentScores(nextScores)
    const nextWinners = [...tournamentRoundWinners, menu]
    const isLastMatch = tournamentMatchIndex + 1 >= tournamentMatchCount

    if (!isLastMatch) {
      setTournamentRoundWinners(nextWinners)
      setTournamentMatchIndex((current) => current + 1)
      return
    }

    if (nextWinners.length === 1) {
      setSelectedMenu(nextWinners[0])
      setTournamentComplete(true)
      onTournamentSubmit(nextScores, nextWinners[0], tournamentSessionId)
      return
    }

    setTournamentRoundMenus(nextWinners)
    setTournamentRoundWinners([])
    setTournamentMatchIndex(0)
  }

  const spinRoulette = () => {
    if (!isOwner || rouletteState === 'spinning' || !rouletteMenus.length) return
    const winningIndex = Math.floor(Math.random() * rouletteMenus.length)
    const segmentSize = 360 / rouletteMenus.length
    const targetAngle = 360 - ((winningIndex + .5) * segmentSize)
    setRouletteState('spinning')
    setRouletteResult('')
    setSelectedMenu(null)
    onFlowChange({ rouletteResult: null, rouletteSpinning: true, selectedMenu: '' })
    setRouletteAngle((current) => {
      const normalized = ((current % 360) + 360) % 360
      return current + (360 * 6) + ((targetAngle - normalized + 360) % 360)
    })
    rouletteTimer.current = setTimeout(() => {
      const result = rouletteMenus[winningIndex]
      setRouletteResult(result)
      setSelectedMenu(result)
      setRouletteState('stopped')
      onFlowChange({ rouletteResult: result, rouletteSpinning: false })
    }, 4300)
  }

  const startHotPotato = () => {
    if (hasFinishedHotPotato || hotPotatoPhase !== 'ready') return
    let count = 3
    setHotPotatoCountdown(count)
    setHotPotatoPhase('countdown')
    hotPotatoCountdownTimer.current = setInterval(() => {
      count -= 1
      if (count > 0) {
        setHotPotatoCountdown(count)
        return
      }
      clearInterval(hotPotatoCountdownTimer.current)
      hotPotatoStartedAt.current = performance.now()
      setHotPotatoPhase('foil')
    }, 1000)
  }

  const tapHotPotato = () => {
    if (hotPotatoPhase === 'foil') {
      setFoilTaps((current) => {
        const next = Math.min(12, current + 1)
        if (next >= 12) setHotPotatoPhase('cool')
        return next
      })
    }
    if (hotPotatoPhase === 'eat') {
      setEatTaps((current) => {
        const next = Math.min(16, current + 1)
        if (next >= 16) {
          const elapsed = performance.now() - hotPotatoStartedAt.current
          setHotPotatoElapsed(elapsed)
          setHotPotatoPhase('done')
          onHotPotatoSubmit(elapsed, hotPotatoSessionId)
        }
        return next
      })
    }
  }

  const moveCoolingPotato = (event) => {
    if (hotPotatoPhase !== 'cool' || !coolPointer.current.active) return
    const distance = Math.abs(event.clientX - coolPointer.current.x) + Math.abs(event.clientY - coolPointer.current.y)
    coolPointer.current = { active: true, x: event.clientX, y: event.clientY }
    if (distance < 2) return
    setCoolProgress((current) => {
      const next = Math.min(100, current + distance / 7)
      if (next >= 100) setHotPotatoPhase('eat')
      return next
    })
  }

  const startConfiguredMode = () => {
    if (!isOwner) return
    if (mode === 'ai') {
      const topMenu = menuCandidates[0]?.unavailable ? '' : menuCandidates[0]?.name || ''
      if (!topMenu) return
      setSelectedMenu(topMenu)
      moveToStage(3, { selectedMenu: topMenu })
      return
    }
    moveToStage(2, {
      tournamentSessionId: mode === 'tournament' ? `${Date.now()}` : null,
      tournamentComplete: false,
      rouletteResult: null,
      rouletteSpinning: false,
      hotPotatoSessionId: mode === 'competition' ? `${Date.now()}` : null,
    })
  }

  const changeRoomMode = async (nextMode) => {
    if (!isOwner || stage > 1) return false
    setMode(nextMode)
    setSelectedMenu(null)
    resetTournament()
    resetRoulette()
    return onFlowChange({
      mode: nextMode,
      selectedMenu: '',
      tournamentSessionId: null,
      rouletteResult: null,
      rouletteSpinning: false,
      hotPotatoSessionId: null,
    })
  }

  const changeRoomBudget = async (budgetMin, budgetMax) => {
    if (!isOwner || stage > 1) return false
    const min = Math.max(0, Math.round(Number(budgetMin) || 0))
    const max = Math.max(min, Math.round(Number(budgetMax) || 0))
    return onFlowChange({ budgetMin: min, budgetMax: max })
  }

  const undoStage = () => {
    if (!isOwner) return
    if (stage === 1) moveToStage(0)
    if (stage === 2) {
      moveToStage(1, { selectedMenu: mode === 'ai' && !menuCandidates[0]?.unavailable ? menuCandidates[0]?.name : '', rouletteResult: null, rouletteSpinning: false })
      resetTournament()
      resetRoulette()
      setSelectedMenu(mode === 'ai' && !menuCandidates[0]?.unavailable ? menuCandidates[0]?.name : null)
    }
    if (stage === 3) {
      const previousStage = mode === 'ai' ? 1 : 2
      moveToStage(previousStage, {
        selectedRestaurant: null,
        ...(mode === 'ai' ? { selectedMenu: '' } : {}),
      })
      setSelectedRestaurant(null)
      setExpandedRestaurant(null)
      if (mode === 'ai') setSelectedMenu(null)
    }
    if (stage === 4) {
      moveToStage(3, { completedAt: null })
      setConfirmDelete(false)
    }
  }

  const resetPullBack = () => {
    pullStartY.current = null
    pullEligible.current = false
    pullArmed.current = false
    setPullBack({ distance: 0, armed: false })
  }

  const beginPullBack = (clientY) => {
    const page = pageRef.current
    if (!isOwner || !page || stage === 0 || (mode === 'competition' && stage >= 2)) return
    const atBottom = page.scrollHeight - page.scrollTop - page.clientHeight <= 8
    if (!atBottom) return
    pullStartY.current = clientY
    pullEligible.current = true
  }

  const movePullBack = (clientY, event) => {
    if (!pullEligible.current || pullStartY.current === null) return
    const rawDistance = Math.max(0, pullStartY.current - clientY)
    const distance = Math.min(96, rawDistance * .72)
    const armed = rawDistance >= 76
    pullArmed.current = armed
    setPullBack({ distance, armed })
    if (rawDistance > 0 && event?.cancelable) event.preventDefault()
  }

  const endPullBack = () => {
    if (!pullEligible.current) return
    const shouldUndo = pullArmed.current
    resetPullBack()
    if (shouldUndo) undoStage()
  }

  if (stage === 0) {
    return (
      <main ref={pageRef} className="page detail-page room-flow-page">
        <Header
          back
          onBack={onBack}
          eyebrow="ROOM LOBBY"
          title={room.name}
          action={<button type="button" className="icon-button" onClick={() => setRoomSettingsOpen(true)} aria-label="방 설정"><Settings size={21} /></button>}
        />
        <div className={`room-stage-motion ${transitionDirection}`}>
          <section className="room-lobby-hero">
            <span className="status-badge">시작 전</span>
            <h2>모두 모이면<br />메뉴 결정을 시작해요</h2>
            <p>{room.subtitle}</p>
            <div className="lobby-member-grid">
              {memberEntries.map(([uid, member]) => (
                <div key={uid}>
                  <span>{member.name?.slice(0, 1) || '?'}</span>
                  <strong>{member.name || '참여자'}</strong>
                  {uid === room.ownerId ? <small><Crown size={11} /> 방장</small> : <small><CheckCircle2 size={11} /> 참여 완료</small>}
                </div>
              ))}
            </div>
          </section>
          <section className="lobby-ready-card">
            <div><UsersRound size={20} /><span><strong>{room.members.length}명 모두 참여했어요</strong><small>방장이 시작하면 1단계로 이동합니다.</small></span></div>
            <button type="button" className="room-primary-button" disabled={!isOwner} onClick={() => moveToStage(1, { mode, selectedMenu: '' })}><Play size={18} fill="currentColor" /> {isOwner ? '시작하기' : '방장이 시작하기를 기다리는 중'}</button>
          </section>
          <div className="lobby-invite-actions">
            <button type="button" className="share-wide secondary-share" onClick={onShare}><QrCode size={19} /> 초대 코드 보기</button>
            {isOwner && <button type="button" className="share-wide secondary-share" onClick={onOpenFriends}><UsersRound size={19} /> 친구 바로 초대</button>}
          </div>
        </div>
        {roomSettingsOpen && <RoomSettingsModal room={room} currentUser={currentUser} onClose={() => setRoomSettingsOpen(false)} onLeave={onLeave} onDelete={onDelete} onTransfer={onTransfer} onChangeMode={changeRoomMode} onChangeBudget={changeRoomBudget} />}
      </main>
    )
  }

  return (
    <main
      ref={pageRef}
      className="page detail-page room-flow-page"
      onPointerDown={(event) => beginPullBack(event.clientY)}
      onPointerMove={(event) => movePullBack(event.clientY, event)}
      onPointerUp={endPullBack}
      onPointerCancel={resetPullBack}
    >
      <Header
        back
        onBack={onBack}
        eyebrow={`STEP ${mode === 'ai' && stage >= 3 ? stage - 1 : stage} OF ${mode === 'ai' ? 3 : 4}`}
        title={stageTitles[stage]}
        action={<button type="button" className="icon-button" onClick={() => setRoomSettingsOpen(true)} aria-label="방 설정"><Settings size={21} /></button>}
      />

      <div key={stage} className={`room-stage-motion ${transitionDirection}`}>

      {stage === 1 && (
        <section className="room-stage-section">
          <div className="room-stage-copy"><span>MODE READY</span><h2>선택된 모드로 시작할까요?</h2><p>메뉴 결정 모드는 방장이 방 설정에서 변경할 수 있어요.</p></div>
          <div className="configured-mode-card">
            <span className="mode-icon"><Settings2 size={25} /></span>
            <span><small>현재 메뉴 결정 모드</small><strong>{roomModeLabels[mode] || roomModeLabels.ai}</strong><em>{roomBudgetMin.toLocaleString('ko-KR')}원 ~ {roomBudgetMax.toLocaleString('ko-KR')}원</em></span>
            <CheckCircle2 size={21} />
          </div>
          {isOwner && <button type="button" className="change-mode-button" onClick={() => setRoomSettingsOpen(true)}><Settings size={16} /> 방 설정에서 모드 변경</button>}
          <button type="button" className="room-primary-button stage-next" disabled={!isOwner} onClick={startConfiguredMode}>{isOwner ? (mode === 'ai' ? '맞춤 추천 1위로 바로 매장 찾기' : `${roomModeLabels[mode]} 시작하기`) : '방장이 시작하기를 기다리는 중'} <ChevronRight size={18} /></button>
        </section>
      )}

      {stage === 2 && mode === 'ai' && (
        <section className="room-stage-section">
          <div className="ai-recommend-banner"><span><Sparkles size={20} /></span><div><small>선호 음식·못 먹는 음식·알레르기를 분석했어요</small><strong>함께 먹기 좋은 메뉴 3개</strong></div></div>
          <div className="ai-menu-list">
            {menuCandidates.map((menu, index) => (
              <button key={menu.name} type="button" disabled={menu.unavailable} className={selectedMenu === menu.name ? 'selected' : ''} onClick={() => setSelectedMenu(menu.name)}>
                <span className="menu-rank">{index + 1}</span>
                <span className="candidate-copy"><b>{menu.name}</b><small>{menu.reason}</small></span>
                <span className="match-score">{menu.score}%<small>일치</small></span>
              </button>
            ))}
          </div>
          <p className={`prototype-note ${isAllergyFallback ? 'api-warning' : ''}`}>
            {isAllergyFallback ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />} {isAllergyFallback
              ? '일반 후보가 모두 제외되어 저알레르기 대체 메뉴를 무작위로 표시했어요. 실제 재료와 조리 환경은 매장에 반드시 확인해주세요.'
              : `${menuApiMessage} 알레르기와 못 먹는 음식에 해당하는 메뉴는 후보에서 제외했습니다.`}
          </p>
          <button type="button" className="room-primary-button stage-next" onClick={() => moveToStage(3, { selectedMenu })} disabled={!isOwner || !selectedMenu || menuApiStatus === 'loading'}>{!isOwner ? '방장이 메뉴를 결정하고 있어요' : menuApiStatus === 'loading' ? '실제 메뉴 불러오는 중' : `${selectedMenu}으로 결정`} <ChevronRight size={18} /></button>
        </section>
      )}

      {stage === 2 && mode === 'tournament' && (
        <section className="room-stage-section tournament-section">
          {!tournamentComplete && !hasSubmittedTournament ? (
            <>
              <div className="tournament-head"><span>{tournamentRoundLabel}</span><strong>{tournamentMatchIndex + 1}/{tournamentMatchCount}</strong></div>
              <h2>더 먹고 싶은 메뉴를 골라주세요</h2>
              <div className="tournament-pair">
                {tournamentPair.map((menu) => (
                  <button key={menu} type="button" onClick={() => pickTournamentMenu(menu)}>
                    <span className={`tournament-food-image ${tournamentMenuImages[menu] ? '' : 'image-pending'}`} style={tournamentMenuImages[menu] ? { backgroundImage: `url(${tournamentMenuImages[menu]})` } : undefined} role="img" aria-label={`${menu} 예시 사진`}>{!tournamentMenuImages[menu] && <span>🍽️</span>}</span>
                    <strong>{menu}</strong><small>선택하기</small>
                  </button>
                ))}
              </div>
              <p className="prototype-note"><UsersRound size={14} /> 각 선택은 점수로 저장되고 모든 참여자의 결과와 합산됩니다.</p>
            </>
          ) : !tournamentAllComplete ? (
            <div className="tournament-winner tournament-waiting">
              <span><UsersRound size={32} /></span><small>내 결과 제출 완료</small><h2>{tournamentVotes.length}/{memberEntries.length}명 완료</h2><p>모든 참여자가 월드컵을 마치면 총점 1위 메뉴가 결정됩니다.</p>
            </div>
          ) : (
            <div className="tournament-winner">
              <span><Trophy size={32} /></span><small>{memberEntries.length}명 점수 합산 1위</small><h2>{groupTournamentWinner}</h2><p>모든 참여자의 선택 점수를 합산한 최종 메뉴예요.</p>
              <button type="button" className="room-primary-button" disabled={!isOwner} onClick={() => moveToStage(3, { selectedMenu: groupTournamentWinner })}>{isOwner ? '이 메뉴로 매장 찾기' : '방장의 진행을 기다리는 중'} <ChevronRight size={18} /></button>
            </div>
          )}
        </section>
      )}

      {stage === 2 && mode === 'roulette' && (
        <section className="room-stage-section roulette-section">
          <div className="room-stage-copy"><span>SAFE ROULETTE</span><h2>오늘의 메뉴를 돌려볼까요?</h2><p>모든 참여자의 못 먹는 음식과 알레르기 조건을 제외한 후보예요.</p></div>
          <div className="roulette-window">
            <span className="roulette-pointer" aria-hidden="true" />
            <div
              className={`roulette-wheel ${rouletteState}`}
              style={{ '--roulette-angle': `${rouletteAngle}deg`, background: getRouletteGradient(rouletteMenus) }}
              aria-label={`${rouletteMenus.length}개 메뉴 룰렛`}
            >
              {rouletteMenus.map((menu, index) => (
                <span
                  key={menu}
                  className="roulette-label"
                  style={{ '--label-angle': `${(index + .5) * (360 / rouletteMenus.length)}deg` }}
                >{menu}</span>
              ))}
              <span className="roulette-center"><UtensilsCrossed size={28} /></span>
            </div>
          </div>
          {rouletteState === 'stopped' && rouletteResult ? (
            <div className="roulette-result"><small>룰렛 결과</small><strong>{rouletteResult}</strong></div>
          ) : <p className="roulette-guide">{rouletteState === 'spinning' ? '메뉴를 고르는 중이에요…' : '16개의 후보가 준비됐어요.'}</p>}
          {rouletteState === 'idle' && (
            <button type="button" className="room-primary-button roulette-spin-button" disabled={!isOwner} onClick={spinRoulette}><Play size={18} fill="currentColor" /> {isOwner ? '돌리기' : '방장이 룰렛을 돌리는 중'}</button>
          )}
          {rouletteState === 'spinning' && <button type="button" className="room-primary-button roulette-spin-button" disabled><span className="mini-spinner" /> 돌아가는 중</button>}
          {rouletteState === 'stopped' && (
            <div className="roulette-actions">
              <button type="button" className="room-primary-button secondary-share" disabled={!isOwner} onClick={spinRoulette}><RotateCcw size={17} /> 다시 돌리기</button>
              <button type="button" className="room-primary-button" disabled={!isOwner || !rouletteResult} onClick={() => moveToStage(3, { selectedMenu: rouletteResult })}>{rouletteResult || '메뉴'} 선택 <ChevronRight size={17} /></button>
            </div>
          )}
        </section>
      )}

      {stage === 2 && mode === 'competition' && (
        <section className="room-stage-section hot-potato-section">
          <div className="room-stage-copy"><span>HOT POTATO CHALLENGE</span><h2>가장 빠르게 감자를 먹어보세요!</h2><p>시작은 개인별로 진행되며 3·2·1 이후부터 완주까지의 시간을 측정해요.</p></div>
          {!hasFinishedHotPotato && hotPotatoPhase !== 'done' ? (
            <>
              {hotPotatoPhase === 'ready' ? (
                <div className="hot-potato-intro">
                  <span>🥔</span>
                  <ol><li>화면을 연타해 호일 벗기기</li><li>손가락으로 흔들어 감자 식히기</li><li>다시 연타해 가장 먼저 먹기</li></ol>
                  <button type="button" className="room-primary-button" onClick={startHotPotato}><Play size={18} fill="currentColor" /> 내 도전 시작</button>
                </div>
              ) : hotPotatoPhase === 'countdown' ? (
                <div className="hot-potato-countdown"><span>{hotPotatoCountdown}</span><small>준비!</small></div>
              ) : (
                <>
                  <div
                    className={`hot-potato-arena ${hotPotatoPhase}`}
                    style={{
                      '--foil-opacity': Math.max(0, 1 - foilTaps / 12),
                      '--foil-scale': Math.max(.65, 1 - foilTaps * .025),
                      '--foil-rotation': `${foilTaps * 1.5}deg`,
                      '--potato-scale': Math.max(.75, 1 - eatTaps * .015),
                    }}
                    onClick={tapHotPotato}
                    onPointerDown={(event) => {
                      if (hotPotatoPhase !== 'cool') return
                      event.currentTarget.setPointerCapture?.(event.pointerId)
                      coolPointer.current = { active: true, x: event.clientX, y: event.clientY }
                    }}
                    onPointerMove={moveCoolingPotato}
                    onPointerUp={() => { coolPointer.current.active = false }}
                    onPointerCancel={() => { coolPointer.current.active = false }}
                  >
                    <div className="hot-potato-visual"><span className="potato-body">🥔</span><span className="foil-layer" /></div>
                    <strong>{hotPotatoPhase === 'foil' ? '연타해서 호일을 벗겨요!' : hotPotatoPhase === 'cool' ? '좌우로 빠르게 흔들어 식혀요!' : '연타해서 감자를 먹어요!'}</strong>
                    <div className="hot-potato-progress"><span style={{ width: `${hotPotatoPhase === 'foil' ? (foilTaps / 12) * 100 : hotPotatoPhase === 'cool' ? coolProgress : (eatTaps / 16) * 100}%` }} /></div>
                  </div>
                  <p className="prototype-note"><Info size={14} /> 경쟁을 시작한 뒤에는 실행 취소로 이전 단계에 돌아갈 수 없어요.</p>
                </>
              )}
            </>
          ) : (
            <div className="hot-potato-results">
              <div className="hot-potato-my-record"><CheckCircle2 size={20} /><span><small>내 완주 기록</small><strong>{((hotPotatoElapsed ?? currentHotPotatoResult?.elapsedMs ?? 0) / 1000).toFixed(2)}초</strong></span></div>
              <div className="hot-potato-leaderboard">
                {hotPotatoResults.map((result, index) => <div key={result.uid}><span>{index + 1}</span><b>{result.playerName || room.memberRecords?.[result.uid]?.name || '참여자'}</b><strong>{(result.elapsedMs / 1000).toFixed(2)}초</strong></div>)}
              </div>
              {!hotPotatoAllComplete ? (
                <p className="hot-potato-waiting">다른 참여자를 기다리는 중 · {hotPotatoResults.length}/{memberEntries.length}명 완료</p>
              ) : hotPotatoChoice ? (
                <div className="hot-potato-winner"><Trophy size={25} /><small>{hotPotatoChoice.winnerName}님의 선택</small><strong>{hotPotatoChoice.menu}</strong></div>
              ) : hotPotatoWinner?.uid === currentUser.uid ? (
                <div className="winner-menu-picker">
                  <div><Trophy size={24} /><span><small>최종 우승</small><strong>메뉴를 직접 정해주세요!</strong></span></div>
                  <div className="winner-menu-grid">{safeMenuNames.map((menu) => <button type="button" key={menu} onClick={() => onHotPotatoChoose(menu, hotPotatoSessionId)}>{menu}</button>)}</div>
                </div>
              ) : (
                <div className="hot-potato-winner"><Trophy size={25} /><small>최종 우승</small><strong>{hotPotatoWinner?.playerName || '우승자'}님의 메뉴 선택을 기다려요</strong></div>
              )}
            </div>
          )}
        </section>
      )}

      {stage === 3 && (
        <section className="room-stage-section">
          <div className="selected-menu-banner"><span><CheckCircle2 size={22} /></span><div><small>선택한 메뉴</small><strong>{selectedMenu}</strong></div></div>
          <div className="location-line"><Navigation size={16} /><span>{userLocation ? '내 현재 위치 기준 거리' : '현재 위치 확인 전'}</span><small>{userLocation ? `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : '위치 권한 필요'}</small></div>
          {userLocation && <p className={`data-range-note ${restaurantSource}`}><Info size={13} /> {currentArea && <strong>{currentArea}</strong>} {restaurantMessage || '현재 위치를 식당 검색과 거리 계산에 반영하고 있어요.'}</p>}
          <NaverRestaurantMap restaurants={restaurantOptions} selectedRestaurant={selectedRestaurant} userLocation={userLocation} />
          <div className="restaurant-list">
            {restaurantOptions.map((restaurant, index) => {
              const isOpen = expandedRestaurant === restaurant.id
              const isSelected = selectedRestaurant?.id === restaurant.id
              const meters = distanceInMeters(userLocation, restaurant)
              const distance = restaurant.distance || formatDistance(meters)
              const walk = restaurant.walk || (Number.isFinite(meters) ? `도보 약 ${Math.max(1, Math.round(meters / 80))}분` : '도보 시간 계산 전')
              return (
                <article key={restaurant.id} className={`restaurant-card ${isSelected ? 'selected' : ''}`}>
                  <button type="button" className="restaurant-main" onClick={() => { setExpandedRestaurant(isOpen ? null : restaurant.id); setSelectedRestaurant({ ...restaurant, distance, walk }) }}>
                    <span className="restaurant-order">{index + 1}</span>
                    <span><b>{restaurant.name}</b><small><Star size={12} fill={restaurant.rating ? 'currentColor' : 'none'} /> {restaurant.rating ? restaurant.rating.toFixed(1) : '별점 없음'} · {distance} · {walk}</small></span>
                    <ChevronDown size={18} className={isOpen ? 'rotated' : ''} />
                  </button>
                  {isOpen && (
                    <div className="restaurant-details">
                      <p><MapPin size={15} /> {restaurant.address}</p>
                      {restaurant.phone && <p>전화 {restaurant.phone}</p>}
                      <p>{restaurantSource === 'naver' ? '네이버 지역 검색 결과이며 평점은 제공되지 않아요.' : '현재 위치 주변 식당을 불러오는 중이에요.'}</p>
                      <a href={`https://map.naver.com/p/search/${encodeURIComponent(restaurant.name)}`} target="_blank" rel="noreferrer">네이버 지도에서 자세히 보기 <ExternalLink size={14} /></a>
                    </div>
                  )}
                </article>
              )
            })}
            {!restaurantOptions.length && restaurantSource === 'loading' && <div className="restaurant-empty"><span className="mini-spinner" /> 주변 식당을 불러오는 중이에요.</div>}
            {!restaurantOptions.length && restaurantSource === 'error' && <div className="restaurant-empty error"><AlertTriangle size={18} /><span>{restaurantMessage}<small>네이버 Maps의 Reverse Geocoding과 NAVER API HUB 지역 검색 설정을 확인해주세요.</small></span></div>}
          </div>
          <p className="prototype-note"><Info size={14} /> 네이버 지역 검색 API는 별점을 제공하지 않아 별점 없음으로 표시합니다.</p>
          <button type="button" className="room-primary-button stage-next" disabled={!isOwner || !selectedRestaurant} onClick={() => moveToStage(4, { selectedRestaurant, completedAt: Date.now() })}>{!isOwner ? '방장이 매장을 결정하고 있어요' : selectedRestaurant ? `${selectedRestaurant.name}으로 결정` : '매장을 선택해주세요'} <ChevronRight size={18} /></button>
        </section>
      )}

      {stage === 4 && (
        <section className="room-stage-section finish-section">
          <span className="finish-icon"><Flag size={30} /></span>
          <small>모든 결정이 끝났어요</small>
          <h2>맛있게 먹고 만나요!</h2>
          <div className="finish-summary">
            <div><span>메뉴</span><strong>{selectedMenu}</strong></div>
            <div><span>매장</span><strong>{selectedRestaurant?.name}</strong></div>
            <div><span>이동</span><strong>{selectedRestaurant?.walk}</strong></div>
          </div>
          <div className="finish-route-map">
            <div><Navigation size={15} /><span>현재 위치에서 매장까지</span><small>{selectedRestaurant?.distance || selectedRestaurant?.walk}</small></div>
            <NaverRestaurantMap restaurants={selectedRestaurant ? [selectedRestaurant] : []} selectedRestaurant={selectedRestaurant} userLocation={userLocation} showRoute />
            {selectedRestaurant?.name && <a href={`https://map.naver.com/p/search/${encodeURIComponent(selectedRestaurant.name)}`} target="_blank" rel="noreferrer">네이버 지도에서 매장·길찾기 열기 <ExternalLink size={13} /></a>}
          </div>
          {!confirmDelete ? (
            <button type="button" className="room-primary-button danger-button" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /> 식사 완료 · 방 종료</button>
          ) : (
            <div className="delete-confirm">
              <p>방을 종료하면 목록에서 삭제돼요.</p>
              <button type="button" onClick={onDelete}>방 종료하고 삭제하기</button>
              <button type="button" onClick={onKeep}>방 유지하고 메인으로</button>
            </div>
          )}
          {isOwner && memberEntries.length > 1 && <button type="button" className="finish-transfer-button" onClick={() => setRoomSettingsOpen(true)}><Crown size={16} /> 방장 양도하기</button>}
        </section>
      )}
      </div>

      {pullBack.distance > 4 && (
        <div className={`room-pull-indicator ${pullBack.armed ? 'armed' : ''}`} style={{ '--pull-distance': `${pullBack.distance}px` }}>
          <RotateCcw size={16} />
          <span>{pullBack.armed ? '이전으로 갈까요?' : '조금 더 위로 당겨주세요'}</span>
        </div>
      )}
      {isOwner && !(mode === 'competition' && stage >= 2) && <button type="button" className="room-undo-button" onClick={undoStage} aria-label="이전 단계로 돌아가기"><RotateCcw size={17} /> 실행 취소</button>}
      {roomSettingsOpen && <RoomSettingsModal room={room} currentUser={currentUser} onClose={() => setRoomSettingsOpen(false)} onLeave={onLeave} onDelete={onDelete} onTransfer={onTransfer} onChangeMode={changeRoomMode} onChangeBudget={changeRoomBudget} />}
    </main>
  )
}

function ProfileScreen({ profile, focusTarget, onOpenSettings, onEditProfile, onEditTaste }) {
  const menuHistory = [...(profile.menuHistory || [])]
    .sort((a, b) => Number(b.completedAt || 0) - Number(a.completedAt || 0))
    .slice(0, 5)
  useEffect(() => {
    if (!focusTarget) return undefined
    const frame = requestAnimationFrame(() => {
      document.getElementById(`profile-${focusTarget}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusTarget])
  return (
    <>
      <Header
        eyebrow="MY PROFILE"
        title="내 정보"
        action={(
          <button type="button" className="icon-button" onClick={onOpenSettings} aria-label="설정">
            <Settings size={21} />
          </button>
        )}
      />

      <section className="profile-card">
        <div className="profile-photo-wrap">
          <img src={profile.image} alt="프로필" className="profile-photo" />
          <span className="photo-badge"><Camera size={14} /></span>
        </div>
        <div className="profile-identity">
          <span>PROFILE</span>
          <h2>{profile.name}</h2>
          <p>내 취향과 식사 기록을 관리해요.</p>
        </div>
        <button type="button" className="edit-profile-button" onClick={onEditProfile}>
          <Pencil size={15} /> 수정
        </button>
      </section>

      <section className="profile-section" id="profile-taste">
        <div className="profile-section-heading">
          <div><span>TASTE</span><h2>내 음식 취향</h2></div>
          <button type="button" className="section-edit" onClick={onEditTaste}><Pencil size={14} /> 편집</button>
        </div>
        <div className="taste-card">
          <TasteRow icon={<Heart size={17} />} label="선호하는 음식 종류" values={profile.cuisine} />
          <TasteRow icon={<UtensilsCrossed size={17} />} label="선호하는 음식 형태" values={profile.form} />
          <TasteRow icon={<Sparkles size={17} />} label="선호하는 조리 방식" values={profile.cooking} />
          <TasteRow icon={<UtensilsCrossed size={17} />} label="못 먹는 음식" values={profile.avoided} />
          <TasteRow icon={<AlertTriangle size={17} />} label="알레르기" values={profile.allergies} warning />
        </div>
        <p className="allergy-note">알레르기 정보는 실제 조리 환경과 다를 수 있으니 매장에 다시 확인해주세요.</p>
      </section>

      <section className="profile-section history-section" id="profile-history">
        <div className="profile-section-heading">
          <div><span>HISTORY</span><h2>메뉴 기록</h2></div>
          <History size={20} />
        </div>
        <div className="simple-menu-history" aria-label="최근 먹은 메뉴">
          {menuHistory.length ? menuHistory.map((item, index) => (
            <div className="simple-history-item" key={`${item.roomId}-${item.completedAt}`}>
              <span>{index + 1}</span>
              <div><strong>{item.menu}</strong><small>{item.restaurant || item.roomName || '모임에서 결정한 메뉴'}</small></div>
            </div>
          )) : <div className="empty-menu-history">아직 결정한 메뉴가 없어요.</div>}
        </div>
      </section>
    </>
  )
}

function TasteRow({ icon, label, values, warning }) {
  return (
    <div className={`taste-row ${warning ? 'warning' : ''}`}>
      <span className="taste-row-icon">{icon}</span>
      <div><small>{label}</small><p>{values.length ? values.join(' · ') : '설정 없음'}</p></div>
    </div>
  )
}

function SettingsScreen({ settings, onBack, onChange, onAction, onLogout }) {
  return (
    <>
      <Header
        back
        onBack={onBack}
        eyebrow="SETTINGS"
        title="설정"
        action={<span />}
      />

      <section className="settings-section">
        <div className="settings-section-title"><span>DISPLAY</span><h2>테마</h2></div>
        <div className="theme-selector">
          {[
            ['light', '라이트'],
            ['dark', '다크'],
            ['system', '기기 설정'],
          ].map(([value, label]) => (
            <button key={value} type="button" className={settings.theme === value ? 'selected' : ''} onClick={() => onChange('theme', value)}>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><span>NOTIFICATIONS</span><h2>알림 설정</h2></div>
        <div className="settings-list">
          <SettingToggle icon={<Trophy size={18} />} title="메뉴 투표 마감" description="투표 마감과 결과 알림" checked={settings.voteNotifications} onChange={(value) => onChange('voteNotifications', value)} />
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><span>PRIVACY</span><h2>개인정보 설정</h2></div>
        <div className="privacy-card privacy-coming-soon" aria-disabled="true">
          <span className="setting-leading"><Lock size={18} /></span>
          <span><strong>커뮤니티와 함께 만나요</strong><small>프로필 공개 기능은 커뮤니티 오픈 후 제공됩니다.</small></span>
          <em>준비 중</em>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><span>ACCOUNT</span><h2>계정 관리</h2></div>
        <div className="settings-list action-list">
          <button type="button" onClick={onLogout}><span className="setting-leading"><LogOut size={18} /></span><span>로그아웃</span><ChevronRight size={18} /></button>
        </div>
      </section>

      <section className="settings-section settings-last-section">
        <div className="settings-section-title"><span>ABOUT</span><h2>앱 정보·문의하기</h2></div>
        <div className="settings-list action-list">
          <div className="settings-info-row"><span className="setting-leading"><Info size={18} /></span><span>앱 버전</span><small>0.1.0</small></div>
          <button type="button" onClick={() => onAction('문의하기 기능은 준비 중이에요')}><span className="setting-leading"><MessageCircleMore size={18} /></span><span>문의하기</span><ChevronRight size={18} /></button>
        </div>
      </section>
    </>
  )
}

function SettingToggle({ icon, title, description, checked, onChange }) {
  return (
    <div className="setting-row">
      <span className="setting-leading">{icon}</span>
      <span className="setting-copy"><strong>{title}</strong><small>{description}</small></span>
      <button type="button" className={`toggle-switch ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} aria-label={`${title} ${checked ? '끄기' : '켜기'}`} onClick={() => onChange(!checked)}><span /></button>
    </div>
  )
}

function ProfileEditSheet({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name)
  const [image, setImage] = useState(profile.image)

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet profile-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <h2 id="profile-edit-title">프로필 수정</h2>
        <div className="photo-editor">
          <img src={image} alt="프로필 미리보기" />
          <label className="photo-change-button"><Camera size={16} /> 사진 변경<input type="file" accept="image/*" onChange={chooseImage} /></label>
        </div>
        <label className="field-label">닉네임<input value={name} onChange={(event) => setName(event.target.value)} placeholder="고유 닉네임을 입력해주세요" maxLength={20} /></label>
        <button type="button" className="sheet-submit" onClick={() => onSave({ ...profile, name: name.trim() || profile.name || '사용자', image })}>저장하기</button>
      </section>
    </div>
  )
}

function TasteEditSheet({ profile, onClose, onSave }) {
  const options = {
    cuisine: ['한식', '중식', '일식', '양식', '동남아 음식', '인도·중동 음식', '분식', '패스트푸드', '기타'],
    form: ['밥류', '면류', '빵류', '고기류', '해산물류', '채소류', '떡류'],
    cooking: ['국물', '볶음', '구이', '튀김', '찜', '조림', '비빔', '생식 (회·육회 등)'],
    allergies: ['난류(가금류)', '우유', '메밀', '땅콩', '대두(콩류)', '밀', '잣', '호두', '갑각류', '게', '새우', '오징어', '고등어', '조개류(굴·전복·홍합)', '복숭아', '토마토', '닭고기', '돼지고기', '쇠고기', '아황산류'],
  }
  const [selected, setSelected] = useState({
    cuisine: [...profile.cuisine],
    form: [...profile.form],
    cooking: [...profile.cooking],
    allergies: [...profile.allergies],
  })
  const [avoidedText, setAvoidedText] = useState(profile.avoided.join(', '))
  const toggle = (group, item) => {
    setSelected((current) => ({
      ...current,
      [group]: current[group].includes(item)
        ? current[group].filter((value) => value !== item)
        : [...current[group], item],
    }))
  }

  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet taste-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="taste-edit-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <h2 id="taste-edit-title">음식 취향 설정</h2>
        <p>해당하는 항목을 모두 선택해주세요.</p>
        <div className="chip-group allergy-first-group">
          <strong>1. 알레르기</strong>
          <div>{options.allergies.map((item) => <button type="button" key={item} className={selected.allergies.includes(item) ? 'selected' : ''} onClick={() => toggle('allergies', item)}>{item}</button>)}</div>
        </div>
        {[
          ['cuisine', '2. 선호하는 음식 종류'],
          ['form', '3. 선호하는 음식 형태'],
          ['cooking', '4. 선호하는 조리 방식'],
        ].map(([group, label]) => (
          <div className="chip-group" key={group}>
            <strong>{label}</strong>
            <div>{options[group].map((item) => <button type="button" key={item} className={selected[group].includes(item) ? 'selected' : ''} onClick={() => toggle(group, item)}>{item}</button>)}</div>
          </div>
        ))}
        <label className="subjective-field">
          <strong>5. 못 먹는 음식</strong>
          <textarea value={avoidedText} onChange={(event) => setAvoidedText(event.target.value)} placeholder="예: 가지, 고수, 오이" rows={3} />
          <small>여러 음식은 쉼표 또는 줄바꿈으로 구분해주세요.</small>
        </label>
        <button type="button" className="sheet-submit" onClick={() => onSave({
          ...profile,
          ...selected,
          avoided: avoidedText.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
        })}>저장하기</button>
      </section>
    </div>
  )
}

function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => onChange(id)}>
          <span className="nav-icon"><Icon size={22} strokeWidth={active === id ? 2.6 : 2} /></span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function RoomSettingsModal({ room, currentUser, onClose, onLeave, onDelete, onTransfer, onChangeMode, onChangeBudget }) {
  const isOwner = room.ownerId === currentUser.uid
  const otherMembers = Object.entries(room.memberRecords || {}).filter(([uid]) => uid !== currentUser.uid)
  const [nextOwnerId, setNextOwnerId] = useState(otherMembers[0]?.[0] || '')
  const [busy, setBusy] = useState(false)
  const [budgetMin, setBudgetMin] = useState(String(room.flow?.budgetMin ?? 8000))
  const [budgetMax, setBudgetMax] = useState(String(room.flow?.budgetMax ?? 20000))
  const budgetIsValid = Number(budgetMin) >= 0 && Number(budgetMax) >= Number(budgetMin) && Number(budgetMax) > 0

  const run = async (action) => {
    setBusy(true)
    try {
      await action()
      onClose()
    } catch {
      // 상위 핸들러의 토스트 메시지를 유지합니다.
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet room-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="room-settings-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon"><Settings size={24} /></span>
        <h2 id="room-settings-title">방 설정</h2>
        <p>{room.name} · 코드 {room.code}</p>

        {isOwner && (
          <div className="room-budget-setting">
            <strong>1인당 예산 범위</strong>
            <p>{Number(room.flow?.stage || 0) > 1 ? '진행 중에는 예산을 변경할 수 없어요.' : '맞춤 메뉴 추천에서 예상 가격을 비교할 때 사용해요.'}</p>
            <div className="budget-range-inputs">
              <label><span>최소</span><input type="number" min="0" step="1000" inputMode="numeric" value={budgetMin} disabled={busy || Number(room.flow?.stage || 0) > 1} onChange={(event) => setBudgetMin(event.target.value)} /><em>원</em></label>
              <b>~</b>
              <label><span>최대</span><input type="number" min="1000" step="1000" inputMode="numeric" value={budgetMax} disabled={busy || Number(room.flow?.stage || 0) > 1} onChange={(event) => setBudgetMax(event.target.value)} /><em>원</em></label>
            </div>
            <button type="button" className="budget-save-button" disabled={busy || !budgetIsValid || Number(room.flow?.stage || 0) > 1} onClick={() => run(() => onChangeBudget(budgetMin, budgetMax))}>예산 저장</button>
          </div>
        )}

        {isOwner && (
          <div className="room-mode-setting">
            <strong>메뉴 결정 모드</strong>
            <p>{Number(room.flow?.stage || 0) > 1 ? '진행 중에는 모드를 변경할 수 없어요.' : '방장이 사용할 모드를 선택해주세요.'}</p>
            <div>
              {Object.entries(roomModeLabels).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={(room.flow?.mode || 'ai') === value ? 'selected' : ''}
                  disabled={busy || Number(room.flow?.stage || 0) > 1}
                  onClick={() => run(() => onChangeMode(value))}
                >
                  <span>{value === 'ai' ? '추천' : value === 'tournament' ? 'VS' : value === 'roulette' ? '↻' : '🔥'}</span>
                  <b>{label}</b>
                  <CheckCircle2 size={16} />
                </button>
              ))}
            </div>
          </div>
        )}

        {isOwner && otherMembers.length > 0 && (
          <div className="owner-transfer-block">
            <strong>방장 양도</strong>
            <p>새 방장을 선택하면 현재 방장은 일반 멤버가 됩니다.</p>
            <div className="member-choice-list">
              {otherMembers.map(([uid, member]) => (
                <button type="button" key={uid} className={nextOwnerId === uid ? 'selected' : ''} onClick={() => setNextOwnerId(uid)}>
                  <span>{member.name?.slice(0, 1) || '?'}</span><b>{member.name || '참여자'}</b><CheckCircle2 size={17} />
                </button>
              ))}
            </div>
            <button type="button" className="sheet-submit secondary-submit" disabled={!nextOwnerId || busy} onClick={() => run(() => onTransfer(nextOwnerId))}>선택한 멤버에게 방장 양도</button>
          </div>
        )}

        <div className="room-danger-actions">
          {isOwner && otherMembers.length === 0 ? (
            <button type="button" disabled={busy} onClick={() => run(onDelete)}><Trash2 size={18} /> 방 삭제하고 나가기</button>
          ) : (
            <button type="button" disabled={busy || (isOwner && !nextOwnerId)} onClick={() => run(() => onLeave(isOwner ? nextOwnerId : null))}><LogOut size={18} /> {isOwner ? '방장 양도 후 나가기' : '방 나가기'}</button>
          )}
          {isOwner && <button type="button" className="delete-room-button" disabled={busy} onClick={() => run(onDelete)}><Trash2 size={18} /> 모든 멤버에게서 방 삭제</button>}
        </div>
      </section>
    </div>
  )
}

function FriendInviteSheet({ room, friends, onClose, onAddFriend, onInvite }) {
  const [nickname, setNickname] = useState('')
  const [busy, setBusy] = useState(false)
  const add = async () => {
    setBusy(true)
    const success = await onAddFriend(nickname)
    if (success) setNickname('')
    setBusy(false)
  }
  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet friend-invite-sheet" role="dialog" aria-modal="true" aria-labelledby="friend-invite-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon"><UsersRound size={24} /></span>
        <h2 id="friend-invite-title">친구 초대</h2>
        <p>고유 닉네임으로 친구를 찾고 방에 바로 초대할 수 있어요.</p>
        <div className="friend-add-row">
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="친구 닉네임" type="text" maxLength={20} />
          <button type="button" disabled={!nickname.trim() || busy} onClick={add}><Plus size={17} /> 추가</button>
        </div>
        <div className="friend-list">
          {friends.length ? friends.map((friend) => {
            const joined = Boolean(room.memberRecords?.[friend.uid])
            return (
              <div key={friend.uid}>
                <img src={friend.image || '/assets/default-profile.svg'} alt="" />
                <span><b>{friend.name}</b><small>@{friend.nicknameNormalized || normalizeNickname(friend.name)}</small></span>
                <button type="button" disabled={joined} onClick={() => onInvite(friend)}>{joined ? '참여 중' : '초대'}</button>
              </div>
            )
          }) : <div className="empty-friend-list">추가한 친구가 없어요.</div>}
        </div>
      </section>
    </div>
  )
}

function ShareModal({ room, onClose, onToast }) {
  const [qrImage, setQrImage] = useState('')
  const inviteUrl = `${window.location.origin}/join/${encodeURIComponent(room.code)}`
  useEffect(() => {
    QRCode.toDataURL(inviteUrl, { width: 280, margin: 1, color: { dark: '#171717', light: '#ffffff' } })
      .then(setQrImage)
      .catch(() => setQrImage(''))
  }, [inviteUrl])
  const copy = async () => {
    try { await navigator.clipboard.writeText(room.code) } catch { /* preview fallback */ }
    onToast('코드를 복사했어요')
  }
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon"><QrCode size={25} /></span>
        <p className="modal-kicker">ROOM INVITATION</p>
        <h2 id="share-title" className="share-code-title">{room.code}</h2>
        <p className="modal-description">QR을 보여주거나 코드를 공유해<br />친구를 모임에 초대하세요.</p>
        <div className="qr-placeholder" aria-label="방 초대 QR 코드">{qrImage ? <img src={qrImage} alt={`${room.name} 초대 QR 코드`} /> : <span>QR</span>}</div>
        <button type="button" className="code-box" onClick={copy}>
          <span><small>방 접속 코드</small><strong>{room.code}</strong></span><Copy size={19} />
        </button>
        <p className="hold-tip">방 카드를 길게 누르면 언제든 다시 볼 수 있어요.</p>
      </section>
    </div>
  )
}

function ActionSheet({ type, initialCode = '', onClose, onCreate, onJoin }) {
  const [roomName, setRoomName] = useState('')
  const [code, setCode] = useState(initialCode)
  const isCreate = type === 'create'
  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon">{isCreate ? <Plus size={25} /> : <LogIn size={25} />}</span>
        <h2 id="sheet-title">{isCreate ? '새 방 만들기' : '방에 접속하기'}</h2>
        <p>{isCreate ? '모임 이름을 정하고 친구들을 초대해보세요.' : '공유받은 초대 코드를 입력해주세요.'}</p>
        <label className="field-label">
          {isCreate ? '방 이름' : '초대 코드'}
          <input
            autoFocus
            value={isCreate ? roomName : code}
            onChange={(event) => isCreate ? setRoomName(event.target.value) : setCode(event.target.value)}
            placeholder={isCreate ? '예: 금요일 저녁팟' : '예: A1B2C3'}
          />
        </label>
        <button type="button" className="sheet-submit" disabled={isCreate ? !roomName.trim() : !code.trim()} onClick={() => isCreate ? onCreate(roomName) : onJoin(code)}>
          {isCreate ? '방 만들기' : '접속하기'}
        </button>
      </section>
    </div>
  )
}

function PlaceholderScreen({ type }) {
  const isCommunity = type === 'community'
  return (
    <>
      <Header eyebrow={isCommunity ? 'COMMUNITY' : 'MY'} title={isCommunity ? '커뮤니티' : '내 정보'} />
      <section className="placeholder-card">
        <span>{isCommunity ? <MessageCircleMore size={30} /> : <CircleUserRound size={30} />}</span>
        <h2>아직 준비 중이에요</h2>
        <p>{isCommunity ? '다른 모임이 최근 고른 메뉴를 구경하는 공간이 열릴 예정이에요.' : '내 취향과 참여 기록을 관리하는 화면이 들어갈 예정이에요.'}</p>
      </section>
    </>
  )
}

function Toast({ children }) {
  return <div className="toast" role="status">{children}</div>
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
)
