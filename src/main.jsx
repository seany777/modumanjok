import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
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
  WalletCards,
  X,
} from 'lucide-react'
import './styles.css'

const initialRooms = [
  {
    id: 1,
    name: '금요일 저녁팟',
    subtitle: '오늘 18:30 · 학교 정문',
    members: ['나', '민지', '준호', '수빈', '현우'],
    status: '의견 모으는 중',
    color: 'lime',
  },
  {
    id: 2,
    name: '동아리 회식',
    subtitle: '10월 29일 · 신촌역',
    members: ['나', '예은', '도윤', '지후'],
    status: '투표 중',
    color: 'coral',
  },
  {
    id: 3,
    name: '가족 외식',
    subtitle: '11월 2일 · 연남동',
    members: ['나', '엄마', '아빠', '동생'],
    status: '결정 완료',
    color: 'sky',
  },
]

const menuSummary = [
  { icon: WalletCards, label: '예산', value: '1.5만원 이하', color: 'lime' },
  { icon: UtensilsCrossed, label: '선호 메뉴', value: '한식 · 일식', color: 'coral' },
  { icon: UsersRound, label: '참여 인원', value: '5명 중 4명', color: 'sky' },
]

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

const sampleRestaurants = [
  { id: 1, name: '오늘의 식탁', distance: '320m', rating: 4.8, walk: '도보 5분', address: '학교 정문 앞 1번 골목' },
  { id: 2, name: '한상 가득', distance: '580m', rating: 4.6, walk: '도보 8분', address: '대학로 42길 7' },
  { id: 3, name: '모두의 키친', distance: '850m', rating: 4.5, walk: '도보 12분', address: '중앙로 18번길 3' },
]

const navItems = [
  { id: 'home', label: '메인', icon: Home },
  { id: 'rooms', label: '방 접속', icon: LogIn },
  { id: 'community', label: '커뮤', icon: MessageCircleMore },
  { id: 'profile', label: '내 정보', icon: CircleUserRound },
]

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [rooms, setRooms] = useState(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [shareRoom, setShareRoom] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileSheet, setProfileSheet] = useState(null)
  const [appSettings, setAppSettings] = useState({
    theme: 'system',
    voteNotifications: true,
    profileVisibility: 'friends',
  })
  const [userProfile, setUserProfile] = useState({
    name: '<이름>',
    image: '/assets/profile-example-color.png',
    cuisine: ['한식', '일식'],
    form: ['밥류', '면류'],
    cooking: ['국물', '볶음'],
    avoided: ['가지', '고수'],
    allergies: ['갑각류'],
  })

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme = appSettings.theme === 'system'
        ? (media.matches ? 'dark' : 'light')
        : appSettings.theme
      document.documentElement.dataset.theme = resolvedTheme
    }
    applyTheme()
    media.addEventListener?.('change', applyTheme)
    return () => media.removeEventListener?.('change', applyTheme)
  }, [appSettings.theme])

  const addRoom = (name) => {
    const newRoom = {
      id: Date.now(),
      name: name || '새로운 모임',
      subtitle: '일정 미정 · 장소 미정',
      members: ['나'],
      status: '방금 생성',
      color: 'lime',
    }
    setRooms((current) => [newRoom, ...current])
    setSheet(null)
    setToast('새 방을 만들었어요')
  }

  const joinRoom = () => {
    const joinedRoom = {
      id: Date.now(),
      name: '코드로 참여한 모임',
      subtitle: '일정 확인 중 · 장소 미정',
      members: ['방장', '나'],
      status: '방금 참여',
      color: 'sky',
    }
    setRooms((current) => [joinedRoom, ...current])
    setSheet(null)
    setToast('방에 참여했어요')
  }

  if (selectedRoom) {
    return (
      <AppFrame>
        <RoomDetail
          room={selectedRoom}
          onBack={() => setSelectedRoom(null)}
          onShare={() => setShareRoom(selectedRoom)}
          onDelete={() => {
            setRooms((current) => current.filter((item) => item.id !== selectedRoom.id))
            setSelectedRoom(null)
            setActiveTab('rooms')
            setToast('방을 종료하고 삭제했어요')
          }}
        />
        {shareRoom && <ShareModal room={shareRoom} onClose={() => setShareRoom(null)} onToast={setToast} />}
        {toast && <Toast>{toast}</Toast>}
      </AppFrame>
    )
  }

  return (
    <AppFrame>
      <main className={`page ${activeTab === 'rooms' ? 'rooms-page' : ''}`}>
        {activeTab === 'home' && (
          <HomeScreen
            rooms={rooms}
            onOpenRoom={setSelectedRoom}
            onGoRooms={() => setActiveTab('rooms')}
            onOpenCreate={() => setSheet('create')}
          />
        )}
        {activeTab === 'rooms' && (
          <RoomsScreen
            rooms={rooms}
            profileName={userProfile.name}
            onOpenRoom={setSelectedRoom}
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
            onBack={() => setSettingsOpen(false)}
            onChange={(key, value) => setAppSettings((current) => ({ ...current, [key]: value }))}
            onAction={setToast}
          />
        ) : (
          <ProfileScreen
            profile={userProfile}
            onOpenSettings={() => setSettingsOpen(true)}
            onEditProfile={() => setProfileSheet('profile')}
            onEditTaste={() => setProfileSheet('taste')}
          />
        ))}
      </main>

      <BottomNav
        active={activeTab}
        onChange={(nextTab) => {
          setActiveTab(nextTab)
          if (nextTab !== 'profile') setSettingsOpen(false)
        }}
      />
      {shareRoom && <ShareModal room={shareRoom} onClose={() => setShareRoom(null)} onToast={setToast} />}
      {sheet && (
        <ActionSheet
          type={sheet}
          onClose={() => setSheet(null)}
          onCreate={addRoom}
          onJoin={joinRoom}
        />
      )}
      {profileSheet === 'profile' && (
        <ProfileEditSheet
          profile={userProfile}
          onClose={() => setProfileSheet(null)}
          onSave={(nextProfile) => {
            setUserProfile(nextProfile)
            setProfileSheet(null)
            setToast('프로필을 저장했어요')
          }}
        />
      )}
      {profileSheet === 'taste' && (
        <TasteEditSheet
          profile={userProfile}
          onClose={() => setProfileSheet(null)}
          onSave={(nextProfile) => {
            setUserProfile(nextProfile)
            setProfileSheet(null)
            setToast('음식 취향을 저장했어요')
          }}
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

function HomeScreen({ rooms, onOpenRoom, onGoRooms, onOpenCreate }) {
  const recentRoom = rooms[0]
  return (
    <>
      <Header eyebrow="반가워요 👋" title="오늘은 뭐 먹을까요?" />
      <section className="hero-card">
        <div className="hero-copy">
          <span className="pill light"><Sparkles size={13} /> 함께 정하면 더 쉬워요</span>
          <h2>모두의 취향을 모아<br />딱 맞는 메뉴 찾기</h2>
          <p>방을 만들고 친구들을 초대해보세요.</p>
          <button type="button" className="dark-button" onClick={onOpenCreate}>새 모임 시작하기 <ChevronRight size={17} /></button>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="plate"><UtensilsCrossed size={48} /></div>
          <span className="food-orbit orbit-one"><Coffee size={22} /></span>
          <span className="food-orbit orbit-two"><UsersRound size={22} /></span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RECENT ROOM</span>
            <h2>최근 참여한 방</h2>
          </div>
          <button type="button" className="text-button" onClick={onGoRooms}>전체보기 <ChevronRight size={16} /></button>
        </div>
        <button type="button" className="recent-room" onClick={() => onOpenRoom(recentRoom)}>
          <div className="recent-top">
            <div>
              <h3>{recentRoom.name}</h3>
            </div>
            <div className="round-arrow"><ChevronRight size={21} /></div>
          </div>
          <div className="summary-grid">
            {menuSummary.map(({ icon: Icon, label, value, color }) => (
              <div className="summary-item" key={label}>
                <span className={`summary-icon ${color}`}><Icon size={18} /></span>
                <span><small>{label}</small><strong>{value}</strong></span>
              </div>
            ))}
          </div>
        </button>
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

function RoomsScreen({ rooms, profileName, onOpenRoom, onShareRoom, onCreate, onJoin }) {
  const [query, setQuery] = useState('')
  const filtered = rooms.filter((room) => room.name.includes(query))
  return (
    <div className="rooms-screen">
      <div className="rooms-fixed-area">
        <Header eyebrow="ROOMS" title="내가 참여한 방" action={<span />} />
        <div className="room-account-bar" aria-label="방 바로가기">
          <button type="button" className="profile-name-button" aria-label={`${profileName} 계정 메뉴`}>
            <span>{profileName}</span>
            <ChevronDown size={18} strokeWidth={2.2} />
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
        <div className="room-list-heading">
          <p>총 <strong>{filtered.length}</strong>개의 방</p>
          <span>길게 눌러 초대 코드 보기</span>
        </div>
        <section className="room-list">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onOpen={() => onOpenRoom(room)} onLongPress={() => onShareRoom(room)} />
          ))}
        </section>
        {filtered.length === 0 && <div className="empty-state"><Search size={28} /><p>검색한 방이 없어요.</p></div>}
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

function RoomDetail({ room, onBack, onShare, onDelete }) {
  const pageRef = useRef(null)
  const [stage, setStage] = useState(0)
  const [mode, setMode] = useState('ai')
  const [selectedMenu, setSelectedMenu] = useState(aiMenuCandidates[0].name)
  const [tournamentRoundMenus, setTournamentRoundMenus] = useState(tournamentMenus)
  const [tournamentRoundWinners, setTournamentRoundWinners] = useState([])
  const [tournamentMatchIndex, setTournamentMatchIndex] = useState(0)
  const [tournamentComplete, setTournamentComplete] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [expandedRestaurant, setExpandedRestaurant] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pullBack, setPullBack] = useState({ distance: 0, armed: false })
  const pullStartY = useRef(null)
  const pullEligible = useRef(false)
  const pullArmed = useRef(false)
  const previousStage = useRef(stage)
  const transitionDirection = stage >= previousStage.current ? 'forward' : 'backward'

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    previousStage.current = stage
  }, [stage])

  const stageTitles = ['대기실', '메뉴 고르기 모드', mode === 'ai' ? 'AI 메뉴 추천' : '메뉴 이상형 월드컵', '주변 매장 찾기', '식사 준비 완료']
  const tournamentPair = tournamentRoundMenus.slice(tournamentMatchIndex * 2, tournamentMatchIndex * 2 + 2)
  const tournamentRoundLabel = tournamentRoundMenus.length === 2 ? '결승' : `${tournamentRoundMenus.length}강`
  const tournamentMatchCount = Math.max(1, tournamentRoundMenus.length / 2)

  const resetTournament = () => {
    setTournamentRoundMenus(tournamentMenus)
    setTournamentRoundWinners([])
    setTournamentMatchIndex(0)
    setTournamentComplete(false)
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setSelectedMenu(nextMode === 'ai' ? aiMenuCandidates[0].name : null)
    resetTournament()
  }

  const pickTournamentMenu = (menu) => {
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
      return
    }

    setTournamentRoundMenus(nextWinners)
    setTournamentRoundWinners([])
    setTournamentMatchIndex(0)
  }

  const undoStage = () => {
    if (stage === 1) setStage(0)
    if (stage === 2) {
      setStage(1)
      resetTournament()
      setSelectedMenu(mode === 'ai' ? aiMenuCandidates[0].name : null)
    }
    if (stage === 3) {
      setStage(2)
      setSelectedRestaurant(null)
      setExpandedRestaurant(null)
    }
    if (stage === 4) {
      setStage(3)
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
          action={<button type="button" className="icon-button" onClick={onShare} aria-label="초대 정보"><QrCode size={21} /></button>}
        />
        <div className={`room-stage-motion ${transitionDirection}`}>
          <section className="room-lobby-hero">
            <span className="status-badge">시작 전</span>
            <h2>모두 모이면<br />메뉴 결정을 시작해요</h2>
            <p>{room.subtitle}</p>
            <div className="lobby-member-grid">
              {room.members.map((member, index) => (
                <div key={member}>
                  <span>{member.slice(0, 1)}</span>
                  <strong>{member}</strong>
                  {index === 0 ? <small><Crown size={11} /> 방장</small> : <small><CheckCircle2 size={11} /> 참여 완료</small>}
                </div>
              ))}
            </div>
          </section>
          <section className="lobby-ready-card">
            <div><UsersRound size={20} /><span><strong>{room.members.length}명 모두 참여했어요</strong><small>방장이 시작하면 1단계로 이동합니다.</small></span></div>
            <button type="button" className="room-primary-button" onClick={() => setStage(1)}><Play size={18} fill="currentColor" /> 시작하기</button>
          </section>
          <button type="button" className="share-wide secondary-share" onClick={onShare}><QrCode size={19} /> 초대 코드 다시 보기</button>
        </div>
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
        action={<button type="button" className="icon-button" onClick={onShare} aria-label="초대 정보"><QrCode size={21} /></button>}
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
          <button type="button" className="room-primary-button stage-next" onClick={() => setStage(2)}>{mode === 'ai' ? 'AI 추천 시작하기' : '이상형 월드컵 시작하기'} <ChevronRight size={18} /></button>
        </section>
      )}

      {stage === 2 && mode === 'ai' && (
        <section className="room-stage-section">
          <div className="ai-recommend-banner"><span><Sparkles size={20} /></span><div><small>모든 멤버의 정보를 분석했어요</small><strong>함께 먹기 좋은 메뉴 3개</strong></div></div>
          <div className="ai-menu-list">
            {aiMenuCandidates.map((menu, index) => (
              <button key={menu.name} type="button" className={selectedMenu === menu.name ? 'selected' : ''} onClick={() => setSelectedMenu(menu.name)}>
                <span className="menu-rank">{index + 1}</span>
                <span className="candidate-copy"><b>{menu.name}</b><small>{menu.reason}</small></span>
                <span className="match-score">{menu.score}%<small>일치</small></span>
              </button>
            ))}
          </div>
          <p className="prototype-note"><Info size={14} /> 현재는 예시 추천이며, 이후 AI API와 연결됩니다.</p>
          <button type="button" className="room-primary-button stage-next" onClick={() => setStage(3)} disabled={!selectedMenu}>{selectedMenu}으로 결정 <ChevronRight size={18} /></button>
        </section>
      )}

      {stage === 2 && mode === 'tournament' && (
        <section className="room-stage-section tournament-section">
          {!tournamentComplete ? (
            <>
              <div className="tournament-head"><span>{tournamentRoundLabel}</span><strong>{tournamentMatchIndex + 1}/{tournamentMatchCount}</strong></div>
              <h2>더 먹고 싶은 메뉴를 골라주세요</h2>
              <div className="tournament-pair">
                {tournamentPair.map((menu) => <button key={menu} type="button" onClick={() => pickTournamentMenu(menu)}><UtensilsCrossed size={28} /><strong>{menu}</strong><small>선택하기</small></button>)}
              </div>
              <p className="prototype-note"><UsersRound size={14} /> 다른 멤버의 선택은 예시 점수로 합산됩니다.</p>
            </>
          ) : (
            <div className="tournament-winner">
              <span><Trophy size={32} /></span><small>모임 합산 1위</small><h2>{selectedMenu}</h2><p>가장 많은 선택을 받은 메뉴예요.</p>
              <button type="button" className="room-primary-button" onClick={() => setStage(3)}>이 메뉴로 매장 찾기 <ChevronRight size={18} /></button>
            </div>
          )}
        </section>
      )}

      {stage === 3 && (
        <section className="room-stage-section">
          <div className="selected-menu-banner"><span><CheckCircle2 size={22} /></span><div><small>선택한 메뉴</small><strong>{selectedMenu}</strong></div></div>
          <div className="location-line"><Navigation size={16} /><span>현재 위치 · 학교 정문 기준</span><small>예시 위치</small></div>
          <div className="restaurant-list">
            {sampleRestaurants.map((restaurant) => {
              const isOpen = expandedRestaurant === restaurant.id
              const isSelected = selectedRestaurant?.id === restaurant.id
              return (
                <article key={restaurant.id} className={`restaurant-card ${isSelected ? 'selected' : ''}`}>
                  <button type="button" className="restaurant-main" onClick={() => { setExpandedRestaurant(isOpen ? null : restaurant.id); setSelectedRestaurant(restaurant) }}>
                    <span className="restaurant-order">{restaurant.id}</span>
                    <span><b>{restaurant.name}</b><small><Star size={12} fill="currentColor" /> {restaurant.rating} · {restaurant.distance} · {restaurant.walk}</small></span>
                    <ChevronDown size={18} className={isOpen ? 'rotated' : ''} />
                  </button>
                  {isOpen && (
                    <div className="restaurant-details">
                      <p><MapPin size={15} /> {restaurant.address}</p>
                      <p>거리와 별점을 함께 고려한 예시 추천입니다.</p>
                      <a href={`https://map.naver.com/p/search/${encodeURIComponent(restaurant.name)}`} target="_blank" rel="noreferrer">자세히 보기 <ExternalLink size={14} /></a>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
          <p className="prototype-note"><Info size={14} /> 실제 거리·별점은 위치 및 매장 API 연결 후 제공됩니다.</p>
          <button type="button" className="room-primary-button stage-next" disabled={!selectedRestaurant} onClick={() => setStage(4)}>{selectedRestaurant ? `${selectedRestaurant.name}으로 결정` : '매장을 선택해주세요'} <ChevronRight size={18} /></button>
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
              <button type="button" onClick={() => setConfirmDelete(false)}>아직 유지하기</button>
            </div>
          )}
        </section>
      )}
      </div>

      {pullBack.distance > 4 && (
        <div className={`room-pull-indicator ${pullBack.armed ? 'armed' : ''}`} style={{ '--pull-distance': `${pullBack.distance}px` }}>
          <RotateCcw size={16} />
          <span>{pullBack.armed ? '이전으로 갈까요?' : '조금 더 위로 당겨주세요'}</span>
        </div>
      )}
      <button type="button" className="room-undo-button" onClick={undoStage} aria-label="이전 단계로 돌아가기"><RotateCcw size={17} /> 실행 취소</button>
    </main>
  )
}

function ProfileScreen({ profile, onOpenSettings, onEditProfile, onEditTaste }) {
  const foodStats = [
    { label: '밥류', count: 9, percent: 41 },
    { label: '면류', count: 7, percent: 32 },
    { label: '국물', count: 4, percent: 18 },
    { label: '구이', count: 2, percent: 9 },
  ]
  const menuHistory = [
    { menu: '제육볶음', count: 8, percent: 82 },
    { menu: '라멘', count: 6, percent: 62 },
    { menu: '피자', count: 5, percent: 52 },
  ]
  const recentMenus = ['제육볶음', '라멘', '피자', '마라탕', '돈까스']

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
          <img src={profile.image} alt="예시 프로필" className="profile-photo" />
          <span className="photo-badge"><Camera size={14} /></span>
        </div>
        <div className="profile-identity">
          <span>PROFILE</span>
          <h2>{profile.name}</h2>
          <p>함께 고른 메뉴가 쌓이고 있어요.</p>
        </div>
        <button type="button" className="edit-profile-button" onClick={onEditProfile}>
          <Pencil size={15} /> 수정
        </button>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading">
          <div><span>STATISTICS</span><h2>지금까지의 메뉴 통계</h2></div>
          <Trophy size={20} />
        </div>
        <div className="menu-record-card stats-menu-chart">
          <div className="menu-record-copy">
            <strong>먹은 메뉴 통계</strong>
            <span>지금까지 어떤 메뉴를 가장 많이 먹었는지 볼 수 있어요.</span>
          </div>
          <div className="menu-bar-chart" aria-label="메뉴별 선택 횟수">
            {menuHistory.map((item) => (
              <div className="menu-bar-item" key={item.menu}>
                <strong>{item.count}회</strong>
                <div className="vertical-bar-track"><span style={{ height: `${item.percent}%` }} /></div>
                <small>{item.menu}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-overview">
          <div><strong>22</strong><span>함께 고른 메뉴</span></div>
          <div><strong>8</strong><span>참여한 모임</span></div>
          <div><strong>밥류</strong><span>가장 자주 선택</span></div>
        </div>
        <div className="food-stats-card">
          {foodStats.map((item) => (
            <div className="food-stat-row" key={item.label}>
              <span className="food-stat-name">{item.label}</span>
              <div className="food-stat-track"><span style={{ width: `${item.percent}%` }} /></div>
              <strong>{item.count}회</strong>
            </div>
          ))}
        </div>
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
          {recentMenus.map((menu) => <div key={menu}>{menu}</div>)}
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

function SettingsScreen({ settings, onBack, onChange, onAction }) {
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
        <div className="privacy-card">
          <div className="setting-row-static"><span className="setting-leading"><Lock size={18} /></span><span><strong>프로필 공개 범위</strong><small>내 프로필을 볼 수 있는 사람</small></span></div>
          <div className="visibility-selector">
            {[
              ['public', '전체'],
              ['friends', '모임원'],
              ['private', '비공개'],
            ].map(([value, label]) => <button key={value} type="button" className={settings.profileVisibility === value ? 'selected' : ''} onClick={() => onChange('profileVisibility', value)}>{label}</button>)}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><span>ACCOUNT</span><h2>계정 관리</h2></div>
        <div className="settings-list action-list">
          <button type="button" onClick={() => onAction('로그인 기능 추가 후 연결할 예정이에요')}><span className="setting-leading"><LogOut size={18} /></span><span>로그아웃</span><ChevronRight size={18} /></button>
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
        <button type="button" className="sheet-submit" onClick={() => onSave({ ...profile, name: name.trim() || '<이름>', image })}>저장하기</button>
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

function ShareModal({ room, onClose, onToast }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText('<testcode>') } catch { /* preview fallback */ }
    onToast('코드를 복사했어요')
  }
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기"><X size={21} /></button>
        <span className="modal-icon"><QrCode size={25} /></span>
        <p className="modal-kicker">ROOM INVITATION</p>
        <h2 id="share-title">{room.name}</h2>
        <p className="modal-description">QR을 보여주거나 코드를 공유해<br />친구를 모임에 초대하세요.</p>
        <div className="qr-placeholder" aria-label="QR 코드 자리표시자">
          <div className="qr-corner top-left" /><div className="qr-corner top-right" /><div className="qr-corner bottom-left" />
          <span>QR</span>
        </div>
        <button type="button" className="code-box" onClick={copy}>
          <span><small>방 접속 코드</small><strong>&lt;testcode&gt;</strong></span><Copy size={19} />
        </button>
        <p className="hold-tip">방 카드를 길게 누르면 언제든 다시 볼 수 있어요.</p>
      </section>
    </div>
  )
}

function ActionSheet({ type, onClose, onCreate, onJoin }) {
  const [roomName, setRoomName] = useState('')
  const [code, setCode] = useState('')
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
            placeholder={isCreate ? '예: 금요일 저녁팟' : '<testcode>'}
          />
        </label>
        <button type="button" className="sheet-submit" onClick={() => isCreate ? onCreate(roomName) : onJoin()}>
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
