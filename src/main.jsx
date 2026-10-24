import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import QRCode from 'qrcode'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { equalTo, get, onValue, orderByChild, query, ref, serverTimestamp, set, update } from 'firebase/database'
import {
  ArrowLeft,
  AlertTriangle,
  Bell,
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

const tournamentMenus = [
  '제육볶음', '라멘', '피자', '마라탕',
  '김치찌개', '비빔밥', '돈까스', '초밥',
  '떡볶이', '햄버거', '파스타', '쌀국수',
  '치킨', '샤브샤브', '카레', '냉면',
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
]

const allergyFallbackCatalog = [
  { name: '채소죽', cuisine: ['한식'], form: ['밥류', '채소류'], cooking: ['국물'], risks: [] },
  { name: '구운 채소', cuisine: ['한식', '양식'], form: ['채소류'], cooking: ['구이'], risks: [] },
  { name: '감자구이', cuisine: ['양식'], form: ['채소류'], cooking: ['구이'], risks: [] },
  { name: '흰쌀밥과 나물', cuisine: ['한식'], form: ['밥류', '채소류'], cooking: ['비빔'], risks: [] },
  { name: '채소쌀국수', cuisine: ['동남아 음식'], form: ['면류', '채소류'], cooking: ['국물'], risks: [] },
  { name: '채소찜', cuisine: ['한식'], form: ['채소류'], cooking: ['찜'], risks: [] },
]

const normalizeFoodText = (value = '') => value.toLowerCase().replace(/[\s·()]/g, '')

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

function makePreferenceCandidates(memberRecords) {
  const preferences = Object.values(memberRecords || {}).map((member) => member.preferences).filter(Boolean)
  const total = Math.max(1, preferences.length)
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
    return {
      name: menu.name,
      blocked: uniqueBlocked.length > 0,
      score: Math.max(45, Math.min(98, Math.round(62 + preferenceScore / total + (matchedMembers / total) * 8 - recentMenuPenalty))),
      reason: preferences.length
        ? `${preferences.length}명 취향 반영 · ${matchedMembers || 0}명 선호 조건과 일치${recentMatchCount ? ` · 최근 식사 ${recentMatchCount}명 중복 감점` : ''}`
        : '취향을 설정하면 더 정확하게 추천해요',
    }
  })
  const safe = candidates.filter((candidate) => !candidate.blocked).sort((a, b) => b.score - a.score)
  if (!safe.length) {
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
  const dishKeywords = ['제육', '김치찌개', '비빔밥', '냉면', '치킨', '파스타', '햄버거', '카레', '칼국수', '닭갈비', '갈비', '족발', '보쌈', '국밥', '볶음밥']
  const excludedKeywords = ['소주', '맥주', '와인', '막걸리', '음료', '콜라', '사이다', '커피', '에이드', '주스', '케이크', '파이']

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

function NaverRestaurantMap({ restaurants, selectedRestaurant, userLocation }) {
  const mapElement = useRef(null)
  const mapInstance = useRef(null)
  const markerInstances = useRef([])
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
  }, [keyId, restaurants, userLocation])

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
    update(ref(database, `userDirectory/${authUser.uid}`), {
      name: userProfile.name,
      email: authUser.email?.toLowerCase() || '',
      image: userProfile.image || '/assets/default-profile.svg',
      updatedAt: serverTimestamp(),
    }).catch((error) => console.error('User directory sync failed:', error))
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
    setAuthUser(user)
    setAuthBusy(false)
    setAuthError('')

    if (!user) {
      setUserProfile(defaultUserProfile)
      return
    }

    const googleProfile = {
      ...defaultUserProfile,
      name: user.displayName || user.email?.split('@')[0] || '사용자',
      image: user.photoURL || defaultUserProfile.image,
    }
    setUserProfile(googleProfile)

    try {
      const userRef = ref(database, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const saved = snapshot.val()
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setUserProfile(googleProfile)
      }
    } catch (error) {
      console.error('Firebase profile sync failed:', error)
      setUserProfile(googleProfile)
      setToast('로그인은 됐지만 DB 규칙을 확인해주세요')
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
    setUserProfile(nextProfile)
    setProfileSheet(null)

    if (!auth.currentUser) {
      setToast(message)
      return
    }

    try {
      await update(ref(database, `users/${auth.currentUser.uid}`), {
        ...nextProfile,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        profileDataVersion: PROFILE_DATA_VERSION,
        updatedAt: serverTimestamp(),
      })
      setToast(message)
    } catch (error) {
      console.error('Profile save failed:', error)
      setToast('화면에는 저장됐지만 DB 저장에 실패했어요')
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
      [`rooms/${room.id}/flow/mode`]: 'ai',
      [`rooms/${room.id}/flow/selectedMenu`]: null,
      [`rooms/${room.id}/flow/selectedRestaurant`]: null,
      [`rooms/${room.id}/flow/tournamentComplete`]: false,
      [`rooms/${room.id}/flow/tournamentSessionId`]: null,
      [`rooms/${room.id}/flow/completedAt`]: null,
      [`rooms/${room.id}/flow/updatedAt`]: Date.now(),
      [`rooms/${room.id}/tournamentVotes`]: null,
    }
    Object.keys(room.memberRecords || {}).forEach((uid) => {
      changes[`rooms/${room.id}/members/${uid}/tournamentResult`] = null
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

  const addFriend = async (email) => {
    if (!authUser) return false
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || normalizedEmail === authUser.email?.toLowerCase()) {
      setToast('다른 사용자의 이메일을 입력해주세요')
      return false
    }
    try {
      const snapshot = await get(query(ref(database, 'userDirectory'), orderByChild('email'), equalTo(normalizedEmail)))
      if (!snapshot.exists()) {
        setToast('해당 이메일로 가입한 사용자를 찾지 못했어요')
        return false
      }
      const [friendUid, friend] = Object.entries(snapshot.val())[0]
      await set(ref(database, `friends/${authUser.uid}/${friendUid}`), {
        name: friend.name || normalizedEmail.split('@')[0],
        email: friend.email || normalizedEmail,
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

  if (authUser === undefined) {
    return (
      <AppFrame>
        <AuthLoadingScreen />
      </AppFrame>
    )
  }

  if (!authUser) {
    return (
      <AppFrame>
        <LoginScreen onLogin={loginWithGoogle} busy={authBusy} error={authError} />
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
            onOpenSettings={() => navigateTo('/settings')}
            onEditProfile={() => setProfileSheet('profile')}
            onEditTaste={() => setProfileSheet('taste')}
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

function LoginScreen({ onLogin, busy, error }) {
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
      {action || (
        <button type="button" className="icon-button" aria-label="알림">
          <Bell size={21} />
          <span className="notification-dot" />
        </button>
      )}
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

function HomeScreen({ rooms, onOpenRoom, onGoRooms, onOpenCreate }) {
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
          <button type="button" onClick={onGoRooms}><span className="quick-icon"><UsersRound size={22} /></span><b>내 모임</b><small>{rooms.length}개의 방</small></button>
          <button type="button"><span className="quick-icon coral"><UtensilsCrossed size={22} /></span><b>최근 메뉴</b><small>결정 기록</small></button>
          <button type="button"><span className="quick-icon sky"><Coffee size={22} /></span><b>취향 설정</b><small>내 조건 관리</small></button>
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
      <div className="ad-dots">{ads.map((ad, index) => <span key={ad.title} className={activeAd === index ? 'active' : ''} />)}</div>
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

function RoomDetail({ room, currentUser, friends, onBack, onShare, onDelete, onLeave, onTransfer, onOpenFriends, onFlowChange, onTournamentSubmit, onKeep }) {
  const pageRef = useRef(null)
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
  const tournamentSessionId = room.flow?.tournamentSessionId || ''
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

  useEffect(() => {
    const flow = room.flow || {}
    setStage(Number(flow.stage || 0))
    setMode(flow.mode || 'ai')
    if (flow.selectedMenu) setSelectedMenu(flow.selectedMenu)
    if (flow.selectedRestaurant) setSelectedRestaurant(flow.selectedRestaurant)
  }, [room.flow?.stage, room.flow?.mode, room.flow?.selectedMenu, room.flow?.updatedAt])

  useEffect(() => {
    resetTournament()
    setTournamentScores({})
  }, [tournamentSessionId])

  useEffect(() => {
    if (!isOwner || !tournamentAllComplete || !groupTournamentWinner || room.flow?.selectedMenu === groupTournamentWinner) return
    setSelectedMenu(groupTournamentWinner)
    onFlowChange({ selectedMenu: groupTournamentWinner, tournamentComplete: true })
  }, [isOwner, tournamentAllComplete, groupTournamentWinner, room.flow?.selectedMenu])

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    previousStage.current = stage
  }, [stage])

  useEffect(() => {
    const candidates = makePreferenceCandidates(room.memberRecords)
    setMenuCandidates(candidates)
    setMenuApiStatus('ready')
    const preferenceCount = memberEntries.filter(([, member]) => member.preferences).length
    setMenuApiMessage(`${preferenceCount}/${memberEntries.length}명의 취향을 반영했어요.`)
    if (stage <= 2 && !room.flow?.selectedMenu && candidates[0]) setSelectedMenu(candidates[0].unavailable ? null : candidates[0].name)
  }, [preferenceSignature])

  useEffect(() => {
    if (stage !== 3 || !navigator.geolocation) return
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

  const stageTitles = ['대기실', '메뉴 고르기 모드', mode === 'ai' ? 'AI 메뉴 추천' : '메뉴 이상형 월드컵', '주변 매장 찾기', '식사 준비 완료']
  const tournamentPair = tournamentRoundMenus.slice(tournamentMatchIndex * 2, tournamentMatchIndex * 2 + 2)
  const tournamentRoundLabel = tournamentRoundMenus.length === 2 ? '결승' : `${tournamentRoundMenus.length}강`
  const tournamentMatchCount = Math.max(1, tournamentRoundMenus.length / 2)
  const selectedCandidate = menuCandidates.find((candidate) => candidate.name === selectedMenu)
  const isAllergyFallback = menuCandidates.some((candidate) => candidate.fallback)
  const restaurantOptions = naverRestaurants

  const resetTournament = () => {
    setTournamentRoundMenus(tournamentMenus)
    setTournamentRoundWinners([])
    setTournamentMatchIndex(0)
    setTournamentComplete(false)
    setTournamentScores({})
  }

  const selectMode = (nextMode) => {
    if (!isOwner) return
    setMode(nextMode)
    const firstMenu = menuCandidates[0]?.unavailable ? null : menuCandidates[0]?.name
    setSelectedMenu(nextMode === 'ai' ? firstMenu : null)
    resetTournament()
    onFlowChange({ mode: nextMode, selectedMenu: nextMode === 'ai' ? firstMenu || '' : '' })
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

  const undoStage = () => {
    if (!isOwner) return
    if (stage === 1) moveToStage(0)
    if (stage === 2) {
      moveToStage(1, { selectedMenu: mode === 'ai' && !menuCandidates[0]?.unavailable ? menuCandidates[0]?.name : '' })
      resetTournament()
      setSelectedMenu(mode === 'ai' && !menuCandidates[0]?.unavailable ? menuCandidates[0]?.name : null)
    }
    if (stage === 3) {
      moveToStage(2, { selectedRestaurant: null })
      setSelectedRestaurant(null)
      setExpandedRestaurant(null)
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
    if (!page || stage === 0) return
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
            <button type="button" className="room-primary-button" disabled={!isOwner} onClick={() => moveToStage(1, { mode: 'ai', selectedMenu: menuCandidates[0]?.unavailable ? '' : menuCandidates[0]?.name || '' })}><Play size={18} fill="currentColor" /> {isOwner ? '시작하기' : '방장이 시작하기를 기다리는 중'}</button>
          </section>
          <div className="lobby-invite-actions">
            <button type="button" className="share-wide secondary-share" onClick={onShare}><QrCode size={19} /> 초대 코드 보기</button>
            {isOwner && <button type="button" className="share-wide secondary-share" onClick={onOpenFriends}><UsersRound size={19} /> 친구 바로 초대</button>}
          </div>
        </div>
        {roomSettingsOpen && <RoomSettingsModal room={room} currentUser={currentUser} onClose={() => setRoomSettingsOpen(false)} onLeave={onLeave} onDelete={onDelete} onTransfer={onTransfer} />}
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
        eyebrow={`STEP ${stage} OF 4`}
        title={stageTitles[stage]}
        action={<button type="button" className="icon-button" onClick={() => setRoomSettingsOpen(true)} aria-label="방 설정"><Settings size={21} /></button>}
      />

      <div key={stage} className={`room-stage-motion ${transitionDirection}`}>

      {stage === 1 && (
        <section className="room-stage-section">
          <div className="room-stage-copy"><span>MODE SELECT</span><h2>어떻게 메뉴를 정할까요?</h2><p>모드를 고르면 모든 멤버에게 같은 방식이 적용돼요.</p></div>
          <div className="mode-list">
            <button type="button" className={`mode-card sticky-mode ${mode === 'ai' ? 'selected' : ''}`} onClick={() => selectMode('ai')}>
              <span className="mode-icon"><Bot size={24} /></span>
              <span><b>AI 추천</b><small>모두의 예산·취향·제외 음식을 종합해 추천해요</small><em>기본 모드</em></span>
              <CheckCircle2 size={21} />
            </button>
            <button type="button" className={`mode-card ${mode === 'tournament' ? 'selected' : ''}`} onClick={() => selectMode('tournament')}>
              <span className="mode-icon"><Swords size={24} /></span>
              <span><b>메뉴 이상형 월드컵</b><small>각자 고른 결과를 합산해 가장 높은 메뉴를 골라요</small></span>
              <CheckCircle2 size={21} />
            </button>
          </div>
          <button type="button" className="room-primary-button stage-next" disabled={!isOwner} onClick={() => moveToStage(2, { tournamentSessionId: mode === 'tournament' ? `${Date.now()}` : null, tournamentComplete: false })}>{isOwner ? (mode === 'ai' ? 'AI 추천 시작하기' : '이상형 월드컵 시작하기') : '방장이 모드를 선택하고 있어요'} <ChevronRight size={18} /></button>
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
                    <span className="tournament-food-image" style={{ backgroundImage: `url(${tournamentMenuImages[menu]})` }} role="img" aria-label={`${menu} 예시 사진`} />
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
      {isOwner && <button type="button" className="room-undo-button" onClick={undoStage} aria-label="이전 단계로 돌아가기"><RotateCcw size={17} /> 실행 취소</button>}
      {roomSettingsOpen && <RoomSettingsModal room={room} currentUser={currentUser} onClose={() => setRoomSettingsOpen(false)} onLeave={onLeave} onDelete={onDelete} onTransfer={onTransfer} />}
    </main>
  )
}

function ProfileScreen({ profile, onOpenSettings, onEditProfile, onEditTaste }) {
  const menuHistory = [...(profile.menuHistory || [])]
    .sort((a, b) => Number(b.completedAt || 0) - Number(a.completedAt || 0))
    .slice(0, 5)
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

      <section className="profile-section">
        <div className="profile-section-heading">
          <div><span>TASTE</span><h2>내 음식 취향</h2></div>
          <button type="button" className="section-edit" onClick={onEditTaste}><Pencil size={14} /> 편집</button>
        </div>
        <div className="taste-card">
          <TasteRow icon={<Heart size={17} />} label="음식 종류" values={profile.cuisine} />
          <TasteRow icon={<UtensilsCrossed size={17} />} label="음식 형태" values={profile.form} />
          <TasteRow icon={<Sparkles size={17} />} label="조리 방식" values={profile.cooking} />
          <TasteRow icon={<UtensilsCrossed size={17} />} label="못 먹는 음식" values={profile.avoided} />
          <TasteRow icon={<AlertTriangle size={17} />} label="알레르기" values={profile.allergies} warning />
        </div>
        <p className="allergy-note">알레르기 정보는 실제 조리 환경과 다를 수 있으니 매장에 다시 확인해주세요.</p>
      </section>

      <section className="profile-section history-section">
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
          <button type="button" className="danger-row" onClick={() => onAction('회원 탈퇴 기능은 아직 연결되지 않았어요')}><span className="setting-leading"><Trash2 size={18} /></span><span>회원 탈퇴</span><ChevronRight size={18} /></button>
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
        <label className="field-label">이름<input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력해주세요" /></label>
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
        {[
          ['cuisine', '1. 음식 종류'],
          ['form', '2. 음식 형태'],
          ['cooking', '3. 조리 방식'],
        ].map(([group, label]) => (
          <div className="chip-group" key={group}>
            <strong>{label}</strong>
            <div>{options[group].map((item) => <button type="button" key={item} className={selected[group].includes(item) ? 'selected' : ''} onClick={() => toggle(group, item)}>{item}</button>)}</div>
          </div>
        ))}
        <label className="subjective-field">
          <strong>못 먹는 음식</strong>
          <textarea value={avoidedText} onChange={(event) => setAvoidedText(event.target.value)} placeholder="예: 가지, 고수, 오이" rows={3} />
          <small>여러 음식은 쉼표 또는 줄바꿈으로 구분해주세요.</small>
        </label>
        <div className="chip-group">
          <strong>알레르기</strong>
          <div>{options.allergies.map((item) => <button type="button" key={item} className={selected.allergies.includes(item) ? 'selected' : ''} onClick={() => toggle('allergies', item)}>{item}</button>)}</div>
        </div>
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

function RoomSettingsModal({ room, currentUser, onClose, onLeave, onDelete, onTransfer }) {
  const isOwner = room.ownerId === currentUser.uid
  const otherMembers = Object.entries(room.memberRecords || {}).filter(([uid]) => uid !== currentUser.uid)
  const [nextOwnerId, setNextOwnerId] = useState(otherMembers[0]?.[0] || '')
  const [busy, setBusy] = useState(false)

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
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const add = async () => {
    setBusy(true)
    const success = await onAddFriend(email)
    if (success) setEmail('')
    setBusy(false)
  }
  return (
    <div className="overlay sheet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="action-sheet friend-invite-sheet" role="dialog" aria-modal="true" aria-labelledby="friend-invite-title">
        <div className="sheet-handle" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon"><UsersRound size={24} /></span>
        <h2 id="friend-invite-title">친구 초대</h2>
        <p>Google 계정 이메일로 친구를 찾고 방에 바로 초대할 수 있어요.</p>
        <div className="friend-add-row">
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="친구 이메일" type="email" />
          <button type="button" disabled={!email.trim() || busy} onClick={add}><Plus size={17} /> 추가</button>
        </div>
        <div className="friend-list">
          {friends.length ? friends.map((friend) => {
            const joined = Boolean(room.memberRecords?.[friend.uid])
            return (
              <div key={friend.uid}>
                <img src={friend.image || '/assets/default-profile.svg'} alt="" />
                <span><b>{friend.name}</b><small>{friend.email}</small></span>
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
