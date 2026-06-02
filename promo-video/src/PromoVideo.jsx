import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

/* ── Exact GasAja! Color Tokens ── */
const C = {
  green: "#00FF9F",
  orange: "#FF4D00",
  dark: "#121212",
  darker: "#0a0a0a",
  card: "#1e1e1e",
  white: "#FFFFFF",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

/* ── SVG Icons (matching Lucide icons used in app) ── */
const HeartIcon = ({ filled, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? C.orange : "none"} stroke={filled ? C.orange : C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);
const BookmarkIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const PlusIcon = ({ size = 16, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const RefreshIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const HomeIcon = ({ size = 24, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? C.green : C.gray500} strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CompassIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);
const BellIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const UserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const FlameIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
const MapPinIcon = ({ size = 14, color = C.orange }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ClockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ── Avatar Component ── */
const Avatar = ({ name, size = 40, ring = C.green }) => (
  <div style={{
    width: size, height: size, borderRadius: size / 2,
    background: `linear-gradient(135deg, ${C.green}, ${C.orange})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4, fontWeight: 900, color: C.darker,
    border: `3px solid ${ring}33`, flexShrink: 0,
  }}>{name[0]}</div>
);

/* ── Cursor ── */
const Cursor = ({ x, y, clicking }) => (
  <div style={{ position: 'absolute', left: x, top: y, zIndex: 999, transform: `scale(${clicking ? 0.7 : 1})`, transition: 'transform 0.08s', pointerEvents: 'none' }}>
    <svg width="60" height="60" viewBox="0 0 24 24"><path d="M4 4l5.5 16.5 3-7 7-3L4 4z" fill="white" stroke="#000" strokeWidth="1"/></svg>
    {clicking && <div style={{ position: 'absolute', top: 10, left: 10, width: 40, height: 40, borderRadius: 20, background: 'rgba(0,255,159,0.3)', animation: 'none' }}/>}
  </div>
);

/* ── Bottom Navigation Bar (exact copy) ── */
const BottomNav = ({ activeTab = 'home' }) => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60 }}>
    <div style={{ height: 24, background: `linear-gradient(to top, ${C.darker}, transparent)` }}/>
    <div style={{ background: `${C.darker}f2`, backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 8px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
        {activeTab === 'home' && <div style={{ position: 'absolute', top: -2, width: 20, height: 3, borderRadius: 2, background: C.green }}/>}
        <HomeIcon active={activeTab === 'home'} />
        <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === 'home' ? C.green : C.gray600 }}>Home</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CompassIcon />
        <span style={{ fontSize: 10, fontWeight: 600, color: C.gray600 }}>Explore</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,255,159,0.4)', border: `3px solid ${C.darker}` }}>
          <PlusIcon size={28} color={C.darker} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <BellIcon />
        <span style={{ fontSize: 10, fontWeight: 600, color: C.gray600 }}>Notif</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <UserIcon />
        <span style={{ fontSize: 10, fontWeight: 600, color: C.gray600 }}>Profile</span>
      </div>
    </div>
  </div>
);

/* ── Phone Frame ── */
const PhoneFrame = ({ children }) => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 860, height: 1760, background: C.darker, borderRadius: 70, border: '12px solid #333', overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 60px rgba(0,255,159,0.15)' }}>
    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 220, height: 50, background: '#333', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, zIndex: 100 }}/>
    {children}
  </div>
);

/* ── App Header (exact copy of Home.jsx header) ── */
const AppHeader = () => (
  <div style={{ position: 'sticky', top: 0, zIndex: 50, background: `${C.darker}e6`, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '70px 32px 16px' }}>
      <span style={{ fontSize: 48, fontWeight: 900, fontStyle: 'italic', letterSpacing: -3, color: C.white }}>Gas<span style={{ color: C.green }}>Aja!</span></span>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: C.card, border: `1px solid ${C.gray800}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshIcon /></div>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: C.card, border: `1px solid ${C.gray800}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusIcon /></div>
      </div>
    </div>
    <div style={{ padding: '0 32px 20px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><SearchIcon /></div>
        <div style={{ width: '100%', padding: '14px 14px 14px 42px', border: `1px solid ${C.gray800}`, borderRadius: 14, background: `${C.card}99`, fontSize: 16, color: C.gray600, fontWeight: 500 }}>Cari plan, post, teman...</div>
      </div>
    </div>
  </div>
);

/* ── Stories Row (exact copy) ── */
const StoriesRow = () => {
  const names = ['Rina', 'Dimas', 'Ayu', 'Bagus', 'Sari'];
  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 32px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${C.green}80` }}><PlusIcon size={20} /></div>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.gray500 }}>Story</span>
      </div>
      {names.map((name, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, padding: 2, background: `linear-gradient(135deg, ${C.orange}, ${C.green})` }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 28, background: `linear-gradient(135deg, ${C.green}40, ${C.orange}40)`, border: `2px solid ${C.darker}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: C.white }}>{name[0]}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.gray400 }}>{name}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Feed Tabs (exact copy) ── */
const FeedTabs = ({ active = 'all' }) => (
  <div style={{ display: 'flex', gap: 8, padding: '0 32px 20px' }}>
    {[
      { id: 'all', label: 'For You', icon: FlameIcon },
      { id: 'plans', label: 'Plans', icon: () => <MapPinIcon size={14} color={active === 'plans' ? C.darker : C.gray500} /> },
      { id: 'posts', label: 'Posts', icon: () => <CommentIcon size={14} /> },
    ].map(tab => (
      <div key={tab.id} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 14, fontSize: 14, fontWeight: 700,
        background: active === tab.id ? C.green : `${C.card}80`,
        color: active === tab.id ? C.darker : C.gray500,
        border: active === tab.id ? 'none' : `1px solid ${C.gray800}80`,
        boxShadow: active === tab.id ? '0 0 12px rgba(0,255,159,0.2)' : 'none',
      }}>
        <tab.icon />{tab.label}
      </div>
    ))}
  </div>
);

/* ── Plan Card (exact copy of PlanCard from Home.jsx) ── */
const PlanCardUI = ({ title, creator, location, date, time, vibe, vibeEmoji, likes, comments, participants, maxP, tags, joined, hoverScale = 1 }) => (
  <div style={{ margin: '0 16px 16px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', background: `${C.card}66`, transform: `scale(${hoverScale})` }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
      <Avatar name={creator} size={40} ring={C.orange} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{creator}</span>
          <span style={{ fontSize: 10, color: C.gray600 }}>@{creator.toLowerCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.gray500 }}>
          <MapPinIcon size={12} /><span>{location}</span>
        </div>
      </div>
      <span style={{ fontSize: 10, background: `${C.orange}33`, color: C.orange, padding: '3px 10px', borderRadius: 50, fontWeight: 700 }}>{vibeEmoji} PLAN</span>
    </div>
    {/* Cover Image */}
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: `linear-gradient(135deg, #1a1a2e, #16213e)` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16 }}>
        <h4 style={{ fontSize: 28, fontWeight: 900, color: C.white, margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 8, color: C.green, fontWeight: 700 }}>
            <ClockIcon />{date} • {time}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 8, color: C.green, fontWeight: 700 }}>
            <UsersIcon />{participants}/{maxP}
          </span>
        </div>
      </div>
    </div>
    {/* Tags */}
    {tags && tags.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 16px 0' }}>
        {tags.map(t => <span key={t} style={{ fontSize: 10, background: `${C.green}1a`, color: C.green, padding: '3px 10px', borderRadius: 50, fontWeight: 700 }}>{t}</span>)}
      </div>
    )}
    {/* Actions */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HeartIcon filled={false} size={20}/><span style={{ fontSize: 12, fontWeight: 700, color: C.gray400 }}>{likes}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CommentIcon size={20}/><span style={{ fontSize: 12, fontWeight: 700, color: C.gray400 }}>{comments}</span></div>
        <BookmarkIcon size={20}/>
        <ShareIcon size={20}/>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, padding: '8px 20px', borderRadius: 50,
        background: joined ? C.card : `${C.green}1a`, color: joined ? C.white : C.green,
        border: joined ? `1px solid ${C.gray700}` : 'none',
      }}>
        {joined ? 'Joined ✓' : 'Ikutan 🚀'}
      </div>
    </div>
  </div>
);

/* ── Post Card (exact copy of PostCard from Home.jsx) ── */
const PostCardUI = ({ name, content, time, likes, comments }) => (
  <div style={{ margin: '0 16px 16px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', background: `${C.card}66` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
      <Avatar name={name} size={40} ring={C.green} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{name}</span>
          <span style={{ fontSize: 10, color: C.gray600 }}>@{name.toLowerCase().replace(' ','')}</span>
        </div>
        <span style={{ fontSize: 11, color: C.gray500, fontWeight: 500 }}>{time} lalu</span>
      </div>
      <span style={{ fontSize: 10, background: 'rgba(168,85,247,0.2)', color: '#a855f7', padding: '3px 10px', borderRadius: 50, fontWeight: 700 }}>POST</span>
    </div>
    <p style={{ padding: '0 16px', fontSize: 13, color: '#e5e7eb', lineHeight: 1.6, margin: '0 0 12px' }}>{content}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HeartIcon filled={false} size={20}/><span style={{ fontSize: 12, fontWeight: 700, color: C.gray400 }}>{likes}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CommentIcon size={20}/><span style={{ fontSize: 12, fontWeight: 700, color: C.gray400 }}>{comments}</span></div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   SCENES
   ══════════════════════════════════════════ */

// SCENE 1: HOOK (0 - 150 frames / 5s)
const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame, config: { damping: 12 } });
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const slideUp = interpolate(frame, [10, 40], [60, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.darker, justifyContent: 'center', alignItems: 'center', padding: 80 }}>
      <div style={{ opacity: fade, transform: `translateY(${slideUp}px) scale(${s})`, textAlign: 'center' }}>
        <div style={{ fontSize: 120, marginBottom: 40 }}>😩</div>
        <h1 style={{ fontSize: 80, fontWeight: 900, color: C.white, lineHeight: 1.2, margin: 0 }}>
          Bingung Mau<br/><span style={{ color: C.orange }}>Hangout</span><br/>Kemana?
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2: INTRO (150 - 300 / 5s)
const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame, config: { damping: 10 } });
  const glow = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.darker, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `scale(${s})`, textAlign: 'center' }}>
        <span style={{ fontSize: 160, fontWeight: 900, fontStyle: 'italic', letterSpacing: -8, color: C.white, textShadow: `0 0 ${glow * 80}px rgba(0,255,159,0.5)` }}>
          Gas<span style={{ color: C.green }}>Aja!</span>
        </span>
      </div>
      <p style={{ fontSize: 40, color: C.gray300, marginTop: 40, opacity: glow, textAlign: 'center', fontWeight: 600 }}>Cari Teman Sehobi.<br/>Bikin Rencana Bareng.</p>
    </AbsoluteFill>
  );
};

// SCENE 3: EXPLORE FEED (300 - 510 / 7s)
const ExploreScene = () => {
  const frame = useCurrentFrame();
  const scrollY = interpolate(frame, [30, 150], [0, -500], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const phoneIn = interpolate(frame, [0, 20], [100, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.darker }}>
      <div style={{ transform: `translateY(${phoneIn}px)` }}>
        <PhoneFrame>
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <AppHeader />
            <div style={{ transform: `translateY(${scrollY}px)` }}>
              <StoriesRow />
              <FeedTabs active="all" />
              <PlanCardUI title="Konser Musik Indie" creator="Rina" location="GBK Senayan" date="Sabtu" time="19:00" vibe="music" vibeEmoji="🎵" likes={12} comments={3} participants={4} maxP={10} tags={['Outdoor', 'Malam']} />
              <PostCardUI name="Dimas" content="Ada yang mau ikut nonton bareng weekend ini? Drop komentar ya! 🎬" time="2j" likes={8} comments={5} />
              <PlanCardUI title="Ngopi Chill & Boardgame" creator="Ayu" location="Kemang Raya" date="Minggu" time="15:00" vibe="chill" vibeEmoji="☕" likes={7} comments={2} participants={3} maxP={8} tags={['Indoor', 'Weekend']} />
            </div>
          </div>
          <BottomNav activeTab="home" />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 4: INTERACT / JOIN (510 - 720 / 7s)
const InteractScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cursorX = interpolate(frame, [0, 50], [400, 670], { extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 50], [700, 560], { extrapolateRight: 'clamp' });
  const clicking = frame >= 55 && frame <= 65;
  const joined = frame > 60;

  const toastProg = spring({ fps, frame: Math.max(0, frame - 70), config: { damping: 14 } });
  const toastFade = frame > 70 ? interpolate(frame, [70, 80, 160, 180], [0, 1, 1, 0], { extrapolateRight: 'clamp' }) : 0;

  return (
    <AbsoluteFill style={{ background: C.darker }}>
      <PhoneFrame>
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <AppHeader />
          <div style={{ transform: 'translateY(-500px)' }}>
            <StoriesRow />
            <FeedTabs active="all" />
            <PlanCardUI title="Konser Musik Indie" creator="Rina" location="GBK Senayan" date="Sabtu" time="19:00" vibe="music" vibeEmoji="🎵" likes={12} comments={3} participants={4} maxP={10} tags={['Outdoor', 'Malam']} />
            <PostCardUI name="Dimas" content="Ada yang mau ikut nonton bareng weekend ini? Drop komentar ya! 🎬" time="2j" likes={8} comments={5} />
            <PlanCardUI title="Ngopi Chill & Boardgame" creator="Ayu" location="Kemang Raya" date="Minggu" time="15:00" vibe="chill" vibeEmoji="☕" likes={7} comments={2} participants={joined ? 4 : 3} maxP={8} tags={['Indoor', 'Weekend']} joined={joined} hoverScale={clicking ? 0.97 : 1} />
          </div>
        </div>
        <BottomNav activeTab="home" />

        {/* Toast notification */}
        <div style={{
          position: 'absolute', bottom: 120, left: '50%', transform: `translateX(-50%) translateY(${(1 - toastProg) * 50}px)`,
          background: C.green, color: C.darker, padding: '14px 30px', borderRadius: 50,
          fontSize: 22, fontWeight: 700, opacity: toastFade, whiteSpace: 'nowrap',
          boxShadow: '0 8px 30px rgba(0,255,159,0.4)',
        }}>
          Berhasil ikutan! 🚀
        </div>

        <Cursor x={cursorX} y={cursorY} clicking={clicking} />
      </PhoneFrame>
    </AbsoluteFill>
  );
};

// SCENE 5: CREATE PLAN (720 - 960 / 8s)
const CreateScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fullText = "Nonton Avatar 3 Bareng";
  const chars = Math.floor(interpolate(frame, [30, 100], [0, fullText.length], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }));
  const typed = fullText.slice(0, chars);

  const cursorX = interpolate(frame, [110, 140, 180, 200], [400, 430, 430, 430], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const cursorY = interpolate(frame, [110, 140, 180, 200], [800, 1200, 1200, 1200], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const clicking = frame >= 145 && frame <= 155;
  const showSuccess = frame > 170;
  const successScale = spring({ fps, frame: Math.max(0, frame - 170), config: { damping: 12 } });

  // Step progress
  const stepProg = frame < 30 ? 1 : 1;

  return (
    <AbsoluteFill style={{ background: C.darker }}>
      <PhoneFrame>
        <div style={{ height: '100%', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: `${C.darker}e6`, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '70px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: C.card, border: `2px solid ${C.gray700}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <span style={{ fontSize: 28, fontWeight: 900, fontStyle: 'italic', color: C.white }}>Buat Plan Baru</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.gray500, background: C.card, padding: '6px 14px', borderRadius: 50 }}>Step 1/3</span>
          </div>

          {/* Progress Bar */}
          <div style={{ padding: '16px 32px 24px', display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.green }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.gray800 }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.gray800 }} />
          </div>

          {/* Form */}
          <div style={{ padding: '0 32px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.gray500, marginBottom: 10 }}>Mau ngapain?</p>
            <div style={{ borderBottom: `4px solid ${chars > 0 ? C.green : C.gray800}`, paddingBottom: 16, marginBottom: 30 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: chars > 0 ? C.white : C.gray600 }}>
                {chars > 0 ? typed : 'Contoh: Nongkrong di cafe baru'}
                {chars > 0 && <span style={{ opacity: frame % 15 > 7 ? 1 : 0 }}>|</span>}
              </span>
            </div>

            <p style={{ fontSize: 14, fontWeight: 700, color: C.gray500, marginBottom: 12 }}>✨ Vibe-nya gimana?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 30 }}>
              {[
                { icon: '☕', label: 'Chill' }, { icon: '✨', label: 'Aesthetic' }, { icon: '🎉', label: 'Party' },
                { icon: '🍔', label: 'Foodie' }, { icon: '📚', label: 'Study' },
              ].map((v, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 14, borderRadius: 16,
                  border: `2px solid ${i === 0 ? C.green : C.gray800}`,
                  background: i === 0 ? `${C.green}1a` : C.card,
                  boxShadow: i === 0 ? '0 0 15px rgba(0,255,159,0.15)' : 'none',
                }}>
                  <span style={{ fontSize: 28 }}>{v.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.gray300 }}>{v.label}</span>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div style={{
              width: '100%', background: C.green, color: C.darker, padding: '22px 0', borderRadius: 16,
              fontSize: 24, fontWeight: 900, textAlign: 'center', marginTop: 20,
              transform: `scale(${clicking ? 0.95 : 1})`,
              boxShadow: '0 6px 0 #00c077',
            }}>
              Lanjut →
            </div>
          </div>
        </div>

        {/* Success Overlay */}
        {showSuccess && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 200, transform: `scale(${successScale})` }}>
            <div style={{ fontSize: 120 }}>🎉</div>
            <h2 style={{ fontSize: 50, color: C.white, fontWeight: 900, marginTop: 20 }}>Plan Dibuat!</h2>
            <p style={{ fontSize: 24, color: C.gray400, marginTop: 10 }}>Sekarang tinggal tunggu teman join</p>
          </div>
        )}

        <Cursor x={cursorX} y={cursorY} clicking={clicking} />
      </PhoneFrame>
    </AbsoluteFill>
  );
};

// SCENE 6: OUTRO (960 - 1200 / 8s)
const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ fps, frame, config: { damping: 10 } });
  const fade = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const taglineIn = interpolate(frame, [30, 60], [40, 0], { extrapolateRight: 'clamp' });
  const btnIn = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.darker, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
        <span style={{ fontSize: 140, fontWeight: 900, fontStyle: 'italic', letterSpacing: -6, color: C.white }}>
          Gas<span style={{ color: C.green }}>Aja!</span>
        </span>
      </div>
      <p style={{ fontSize: 36, color: C.gray300, marginTop: 30, opacity: fade, transform: `translateY(${taglineIn}px)`, textAlign: 'center', fontWeight: 600, lineHeight: 1.5 }}>
        Cari Teman. Bikin Rencana.<br/>Langsung Jalan!
      </p>
      <div style={{ display: 'flex', gap: 20, marginTop: 60, opacity: btnIn }}>
        <div style={{ background: C.white, color: C.darker, padding: '18px 40px', borderRadius: 16, fontSize: 28, fontWeight: 800 }}>App Store</div>
        <div style={{ background: C.white, color: C.darker, padding: '18px 40px', borderRadius: 16, fontSize: 28, fontWeight: 800 }}>Google Play</div>
      </div>
    </AbsoluteFill>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPOSITION
   ══════════════════════════════════════════ */
export const PromoVideo = () => (
  <AbsoluteFill style={{ background: C.darker }}>
    <Sequence from={0} durationInFrames={150}><HookScene /><Audio src={staticFile("hook.mp3")} /></Sequence>
    <Sequence from={150} durationInFrames={150}><IntroScene /><Audio src={staticFile("intro.mp3")} /></Sequence>
    <Sequence from={300} durationInFrames={210}><ExploreScene /><Audio src={staticFile("explore.mp3")} /></Sequence>
    <Sequence from={510} durationInFrames={210}><InteractScene /><Audio src={staticFile("interact.mp3")} /></Sequence>
    <Sequence from={720} durationInFrames={240}><CreateScene /><Audio src={staticFile("create.mp3")} /></Sequence>
    <Sequence from={960} durationInFrames={240}><OutroScene /><Audio src={staticFile("outro.mp3")} /></Sequence>
  </AbsoluteFill>
);
