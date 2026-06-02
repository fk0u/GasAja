const FIREBASE_DB_URL = "https://sevenlution-50d27-default-rtdb.asia-southeast1.firebasedatabase.app";

const users = {
  "user_1": {
    displayName: "Bima Satria", email: "bima@gasaja.id",
    username: "bimasatria",
    avatar: "https://i.pravatar.cc/150?u=bima",
    bio: "Suka nongkrong dan mabar MLBB tier Mythic. DM buat ngopi! ☕🎮",
    location: "Banjarmasin", followers: 458, following: 321, hasActivePlan: true, createdAt: Date.now() - 86400000 * 30
  },
  "user_2": {
    displayName: "Alya Maharani", email: "alya@gasaja.id",
    username: "alyamaharani",
    avatar: "https://i.pravatar.cc/150?u=alya",
    bio: "Cafe hopper & aesthetic enthusiast ✨ Always looking for hidden gems!",
    location: "Banjarmasin", followers: 1200, following: 450, hasActivePlan: true, createdAt: Date.now() - 86400000 * 25
  },
  "user_3": {
    displayName: "Rizky Firmansyah", email: "rizky@gasaja.id",
    username: "rizkyfirmansyah",
    avatar: "https://i.pravatar.cc/150?u=rizky",
    bio: "Photographer 📸 | Street & portrait | Yuk hunting foto bareng!",
    location: "Banjarbaru", followers: 890, following: 234, hasActivePlan: true, createdAt: Date.now() - 86400000 * 20
  },
  "user_4": {
    displayName: "Nisa Aulia", email: "nisa@gasaja.id",
    username: "nisaaulia",
    avatar: "https://i.pravatar.cc/150?u=nisa",
    bio: "Pecinta kucing dan kopi susu 🐱☕ Introvert yang suka adventure.",
    location: "Banjarmasin", followers: 567, following: 189, hasActivePlan: true, createdAt: Date.now() - 86400000 * 15
  },
  "user_5": {
    displayName: "Daffa Pratama", email: "daffa@gasaja.id",
    username: "daffapratama",
    avatar: "https://i.pravatar.cc/150?u=daffa",
    bio: "Skater & music lover 🛹🎵 Punk rock forever.",
    location: "Martapura", followers: 345, following: 278, hasActivePlan: false, createdAt: Date.now() - 86400000 * 10
  },
  "user_6": {
    displayName: "Sari Indah", email: "sari@gasaja.id",
    username: "sariindah",
    avatar: "https://i.pravatar.cc/150?u=sari",
    bio: "Foodie sejati 🍜 Reviewing every warung in Banjarmasin!",
    location: "Banjarmasin", followers: 2100, following: 567, hasActivePlan: true, createdAt: Date.now() - 86400000 * 8
  },
  "user_7": {
    displayName: "Andi Wijaya", email: "andi@gasaja.id",
    username: "andiwijaya",
    avatar: "https://i.pravatar.cc/150?u=andi",
    bio: "Futsal addict ⚽ Cari tim buat mabar tiap weekend.",
    location: "Banjarmasin", followers: 234, following: 156, hasActivePlan: true, createdAt: Date.now() - 86400000 * 5
  },
  "user_8": {
    displayName: "Maya Putri", email: "maya@gasaja.id",
    username: "mayaputri",
    avatar: "https://i.pravatar.cc/150?u=maya",
    bio: "Art student 🎨 Suka nongkrong di museum & gallery.",
    location: "Banjarmasin", followers: 678, following: 432, hasActivePlan: false, createdAt: Date.now() - 86400000 * 3
  }
};

const plans = {
  "plan_1": {
    creatorId: "user_1", creatorName: "Bima Satria", creatorAvatar: "https://i.pravatar.cc/150?u=bima",
    title: "Mabar MLBB + Nongki", description: "Kumpul bareng buat push rank MLBB sambil nongkrong di warkop. Bring your own device! Kita main sampe subuh 🎮",
    date: "2026-05-20", time: "20:00", vibe: "gaming", location: "Warkop 88, Kayutangi",
    locationCoords: { lat: -3.3167, lng: 114.5833 },
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    tags: ["Malam", "Indoor", "Bawa Laptop"],
    maxParticipants: 5, participants: ["user_1", "user_3", "user_5"],
    likes: ["user_2", "user_4", "user_6", "user_7"],
    commentsList: [
      { userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", text: "Gw ikut!! Main apa aja?", createdAt: Date.now() - 50000 },
      { userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa", text: "Rank Epic bisa ikut ga?", createdAt: Date.now() - 30000 }
    ],
    createdAt: Date.now() - 200000
  },
  "plan_2": {
    creatorId: "user_2", creatorName: "Alya Maharani", creatorAvatar: "https://i.pravatar.cc/150?u=alya",
    title: "Nyobain Cafe Baru di Antasan", description: "Ada cafe baru buka di daerah Antasan! Vibes-nya aesthetic banget. Yuk cobain bareng-bareng, kita review dan foto-foto ✨",
    date: "2026-05-18", time: "16:00", vibe: "aesthetic", location: "Kopi Senja, Antasan Besar",
    locationCoords: { lat: -3.3200, lng: 114.5900 },
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    tags: ["Indoor", "Weekend", "Gratis"],
    maxParticipants: 10, participants: ["user_2", "user_4", "user_6"],
    likes: ["user_1", "user_3", "user_5", "user_7", "user_8"],
    commentsList: [
      { userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa", text: "Tempatnya cozy ga? Mau bawa buku", createdAt: Date.now() - 45000 }
    ],
    createdAt: Date.now() - 150000
  },
  "plan_3": {
    creatorId: "user_3", creatorName: "Rizky Firmansyah", creatorAvatar: "https://i.pravatar.cc/150?u=rizky",
    title: "Hunting Street Photography", description: "Kita jalan-jalan keliling Siring sambil hunting foto street photography. Cocok buat yang baru belajar juga!",
    date: "2026-05-25", time: "07:00", vibe: "creative", location: "Siring Menara Pandang",
    locationCoords: { lat: -3.3244, lng: 114.5895 },
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    tags: ["Outdoor", "Pemula OK", "Gratis"],
    maxParticipants: 8, participants: ["user_3", "user_4", "user_8"],
    likes: ["user_1", "user_2", "user_5", "user_6"],
    commentsList: [],
    createdAt: Date.now() - 100000
  },
  "plan_4": {
    creatorId: "user_6", creatorName: "Sari Indah", creatorAvatar: "https://i.pravatar.cc/150?u=sari",
    title: "Food Tour Pasar Lama", description: "Kuliner tour ke Pasar Lama! Cobain soto banjar, nasi kuning, dan jajanan tradisional lainnya 🍜",
    date: "2026-05-22", time: "10:00", vibe: "foodie", location: "Pasar Lama, Banjarmasin",
    locationCoords: { lat: -3.3190, lng: 114.5915 },
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    tags: ["Outdoor", "Family Friendly"],
    maxParticipants: 6, participants: ["user_6", "user_2", "user_4", "user_8"],
    likes: ["user_1", "user_3", "user_5", "user_7"],
    commentsList: [
      { userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi", text: "Soto yg di pojokan itu enak!", createdAt: Date.now() - 25000 }
    ],
    createdAt: Date.now() - 80000
  },
  "plan_5": {
    creatorId: "user_7", creatorName: "Andi Wijaya", creatorAvatar: "https://i.pravatar.cc/150?u=andi",
    title: "Futsal Weekend Ceria", description: "Cari 2 orang lagi buat lengkapin tim futsal! Level santai aja, yang penting seru dan sehat ⚽",
    date: "2026-05-24", time: "08:00", vibe: "sport", location: "GOR Hasanuddin",
    locationCoords: { lat: -3.3120, lng: 114.5760 },
    coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    tags: ["Outdoor", "Weekend"],
    maxParticipants: 10, participants: ["user_7", "user_1", "user_5"],
    likes: ["user_3", "user_6"],
    commentsList: [],
    createdAt: Date.now() - 60000
  },
  "plan_6": {
    creatorId: "user_4", creatorName: "Nisa Aulia", creatorAvatar: "https://i.pravatar.cc/150?u=nisa",
    title: "Study Session di Perpus", description: "Belajar bareng buat persiapan UAS. Bawa laptop dan buku masing-masing. Ada snack gratis! 📚",
    date: "2026-05-21", time: "09:00", vibe: "study", location: "Perpustakaan Daerah Kalsel",
    locationCoords: { lat: -3.3140, lng: 114.5850 },
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    tags: ["Indoor", "Bawa Laptop", "Gratis"],
    maxParticipants: 15, participants: ["user_4", "user_2", "user_8"],
    likes: ["user_1", "user_3", "user_6"],
    commentsList: [],
    createdAt: Date.now() - 40000
  },
  "plan_7": {
    creatorId: "user_5", creatorName: "Daffa Pratama", creatorAvatar: "https://i.pravatar.cc/150?u=daffa",
    title: "Nonton Bareng Konser Lokal", description: "Ada konser band lokal di alun-alun! Free entry. Yuk ramaikan bareng-bareng 🎵🤘",
    date: "2026-05-23", time: "19:00", vibe: "music", location: "Alun-Alun Banjarmasin",
    locationCoords: { lat: -3.3210, lng: 114.5880 },
    coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    tags: ["Outdoor", "Malam", "Gratis"],
    maxParticipants: 20, participants: ["user_5", "user_1", "user_3", "user_7"],
    likes: ["user_2", "user_4", "user_6", "user_8"],
    commentsList: [
      { userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima", text: "Band apa aja yang main?", createdAt: Date.now() - 15000 }
    ],
    createdAt: Date.now() - 20000
  },
  "plan_8": {
    creatorId: "user_8", creatorName: "Maya Putri", creatorAvatar: "https://i.pravatar.cc/150?u=maya",
    title: "Sketching di Taman Kamboja", description: "Bawa sketchbook dan pensil. Kita gambar pemandangan taman sambil ngobrol santai 🎨",
    date: "2026-05-26", time: "15:00", vibe: "creative", location: "Taman Kamboja",
    locationCoords: { lat: -3.3260, lng: 114.5870 },
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    tags: ["Outdoor", "Pemula OK"],
    maxParticipants: 6, participants: ["user_8", "user_3"],
    likes: ["user_2", "user_4"],
    commentsList: [],
    createdAt: Date.now() - 10000
  }
};

const posts = {
  "post_1": {
    userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya",
    content: "Baru nemu cafe hidden gem di daerah Antasan! Kopi nya juara, vibes nya cozy banget. Wajib cobain! ☕✨",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    likes: ["user_1", "user_3", "user_4", "user_6", "user_7"],
    comments: [
      { userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima", text: "Wah keren! Kapan ajak-ajak?", createdAt: Date.now() - 50000 },
      { userId: "user_6", userName: "Sari Indah", userAvatar: "https://i.pravatar.cc/150?u=sari", text: "Makanan nya enak ga?", createdAt: Date.now() - 40000 }
    ],
    createdAt: Date.now() - 3600000
  },
  "post_2": {
    userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky",
    content: "Hasil hunting kemarin di Siring. Golden hour emang ga pernah boong! 📸🌅",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    likes: ["user_1", "user_2", "user_4", "user_5", "user_8"],
    comments: [
      { userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya", text: "Bagus banget Riz! Pake kamera apa?", createdAt: Date.now() - 30000 },
      { userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", text: "Aesthetic parah! 😍", createdAt: Date.now() - 20000 }
    ],
    createdAt: Date.now() - 7200000
  },
  "post_3": {
    userId: "user_6", userName: "Sari Indah", userAvatar: "https://i.pravatar.cc/150?u=sari",
    content: "Soto Banjar terenak se-Banjarmasin menurut gw ada di Pasar Lama. Kuahnya thick, dagingnya empuk. 10/10! 🍜",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    likes: ["user_1", "user_2", "user_4", "user_7"],
    comments: [
      { userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi", text: "Setuju! Yang di pojokan kan?", createdAt: Date.now() - 25000 }
    ],
    createdAt: Date.now() - 10800000
  },
  "post_4": {
    userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima",
    content: "Push rank dari Epic ke Legend dalam semalam! Siapa bilang solo rank susah? 😤🎮 #MLBB #GasAja",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    likes: ["user_3", "user_5", "user_7"],
    comments: [
      { userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa", text: "Gila bro! Pake hero apa?", createdAt: Date.now() - 15000 },
      { userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky", text: "Carry dong ntar malem 🔥", createdAt: Date.now() - 10000 }
    ],
    createdAt: Date.now() - 14400000
  },
  "post_5": {
    userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya",
    content: "Sketch hari ini di Taman Kamboja. Masih belajar watercolor, tapi lumayan lah ya 🎨😅",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    likes: ["user_2", "user_3", "user_4", "user_6"],
    comments: [
      { userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa", text: "Keren banget Maya! Ajarin dong", createdAt: Date.now() - 8000 }
    ],
    createdAt: Date.now() - 18000000
  },
  "post_6": {
    userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa",
    content: "Skate session sore ini di taman. Akhirnya bisa kickflip clean! 🛹🔥",
    image: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80",
    likes: ["user_1", "user_7"],
    comments: [],
    createdAt: Date.now() - 21600000
  },
  "post_7": {
    userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi",
    content: "Tim futsal kita menang 5-3 tadi pagi! Makasih yang udah dateng. Next week lagi ya ⚽💪",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    likes: ["user_1", "user_3", "user_5", "user_6"],
    comments: [
      { userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima", text: "Seru bgt tadi! Gw hattrick 😎", createdAt: Date.now() - 5000 }
    ],
    createdAt: Date.now() - 25200000
  },
  "post_8": {
    userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa",
    content: "Weekend vibes: kucing + kopi susu + buku baru. Perfect combo 🐱☕📖",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    likes: ["user_2", "user_6", "user_8"],
    comments: [{ userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", text: "Goals banget! 😻", createdAt: Date.now() - 3000 }],
    createdAt: Date.now() - 28800000
  },
  "post_9": {
    userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi",
    content: "Gym session done! Pagi-pagi emang paling enak buat workout 💪🔥 Siapa yang mau join besok?",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    likes: ["user_1", "user_5", "user_3"], comments: [],
    createdAt: Date.now() - 32400000
  },
  "post_10": {
    userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya",
    content: "Sunset dari rooftop hotel tadi. Banjarmasin emang cantik banget kalau dilihat dari atas 🌇✨",
    image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80",
    likes: ["user_1", "user_3", "user_4", "user_5", "user_6", "user_7", "user_8"],
    comments: [
      { userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky", text: "Editornya pake apa nih?", createdAt: Date.now() - 2000 },
      { userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya", text: "Ini hotel mana? Pengen kesana!", createdAt: Date.now() - 1500 }
    ],
    createdAt: Date.now() - 36000000
  },
  "post_11": {
    userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa",
    content: "Cobain BMX baru di skatepark. Masih sering jatoh tapi seru banget haha 🚲😂",
    image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80",
    likes: ["user_1", "user_7"], comments: [],
    createdAt: Date.now() - 39600000
  },
  "post_12": {
    userId: "user_6", userName: "Sari Indah", userAvatar: "https://i.pravatar.cc/150?u=sari",
    content: "Resep rahasia soto banjar ala mama finally berhasil! Kuah nya perfect 🍲👩‍🍳 Recipe coming soon di blog!",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    likes: ["user_1", "user_2", "user_3", "user_4", "user_7", "user_8"],
    comments: [
      { userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa", text: "Drop the recipe pleasee! 🙏", createdAt: Date.now() - 1000 }
    ],
    createdAt: Date.now() - 43200000
  },
  "post_13": {
    userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky",
    content: "Night photography challenge: long exposure di jembatan Bakantan. ISO 100, f/8, 30s 📷✨",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    likes: ["user_2", "user_4", "user_8"],
    comments: [{ userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", text: "Ini keren bgt! Ajarin dong Riz 😍", createdAt: Date.now() - 800 }],
    createdAt: Date.now() - 46800000
  },
  "post_14": {
    userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima",
    content: "Setup gaming baru akhirnya complete! RGB everywhere 🌈🎮 Ready for tournament season!",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    likes: ["user_3", "user_5", "user_7", "user_4"],
    comments: [
      { userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa", text: "Monitor nya brand apa bro?", createdAt: Date.now() - 600 },
      { userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi", text: "Sick setup! 🔥🔥", createdAt: Date.now() - 400 }
    ],
    createdAt: Date.now() - 50400000
  },
  "post_15": {
    userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya",
    content: "Museum visit hari ini! Seni rupa Banjar ternyata kaya banget. Dari batik sasirangan sampai lukisan modern 🎨🖼️",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
    likes: ["user_2", "user_4", "user_6", "user_3"],
    comments: [],
    createdAt: Date.now() - 54000000
  },
  "post_16": {
    userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa",
    content: "Study group berasa produktif banget hari ini! 3 chapter kelar dalam 4 jam. Power of collective focus 📚💡",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    likes: ["user_2", "user_3", "user_8"],
    comments: [{ userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya", text: "Next time ajak-ajak yaa!", createdAt: Date.now() - 200 }],
    createdAt: Date.now() - 57600000
  }
};

// Additional plans
const morePlans = {
  "plan_9": {
    creatorId: "user_2", creatorName: "Alya Maharani", creatorAvatar: "https://i.pravatar.cc/150?u=alya",
    title: "Cafe Hopping Marathon", description: "3 cafe dalam 1 hari! Start dari pagi sampe sore, tiap cafe kita review bareng. Siapa yg kuat? ☕☕☕",
    date: "2026-05-28", time: "09:00", vibe: "aesthetic", location: "Start: Kopi Senja, Antasan",
    locationCoords: { lat: -3.3200, lng: 114.5900 },
    coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    tags: ["Indoor", "Weekend", "Gratis"],
    maxParticipants: 8, participants: ["user_2", "user_4", "user_6", "user_8"],
    likes: ["user_1", "user_3", "user_5", "user_7"],
    commentsList: [{ userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa", text: "Cafe ke-3 nya dimana?", createdAt: Date.now() - 10000 }],
    createdAt: Date.now() - 5000
  },
  "plan_10": {
    creatorId: "user_1", creatorName: "Bima Satria", creatorAvatar: "https://i.pravatar.cc/150?u=bima",
    title: "Tournament MLBB 5v5", description: "Mini tournament MLBB antar squad! Best of 3, ada hadiah buat juara. Bring your A-game! 🏆🎮",
    date: "2026-05-30", time: "14:00", vibe: "gaming", location: "Warkop 88, Kayutangi",
    locationCoords: { lat: -3.3167, lng: 114.5833 },
    coverImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
    tags: ["Indoor", "Malam", "18+"],
    maxParticipants: 20, participants: ["user_1", "user_3", "user_5", "user_7"],
    likes: ["user_2", "user_4", "user_6", "user_8"],
    commentsList: [
      { userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa", text: "Hadiahnya apa nih?", createdAt: Date.now() - 8000 },
      { userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky", text: "Gw tank! Cari carry dong", createdAt: Date.now() - 6000 }
    ],
    createdAt: Date.now() - 3000
  },
  "plan_11": {
    creatorId: "user_6", creatorName: "Sari Indah", creatorAvatar: "https://i.pravatar.cc/150?u=sari",
    title: "Cooking Class: Nasi Kuning", description: "Belajar masak nasi kuning dari nol! Bahan udah disiapin, tinggal dateng aja. Cocok buat pemula 👩‍🍳🍚",
    date: "2026-06-01", time: "10:00", vibe: "foodie", location: "Rumah Sari, Banjarmasin Tengah",
    locationCoords: { lat: -3.3230, lng: 114.5890 },
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    tags: ["Indoor", "Pemula OK", "Family Friendly"],
    maxParticipants: 6, participants: ["user_6", "user_2"],
    likes: ["user_4", "user_8", "user_1"],
    commentsList: [],
    createdAt: Date.now() - 1500
  },
  "plan_12": {
    creatorId: "user_3", creatorName: "Rizky Firmansyah", creatorAvatar: "https://i.pravatar.cc/150?u=rizky",
    title: "Workshop Basic Photography", description: "Belajar komposisi, lighting, dan editing dasar. Bawa kamera atau HP aja cukup! 📸",
    date: "2026-06-03", time: "15:00", vibe: "creative", location: "Taman Kamboja",
    locationCoords: { lat: -3.3260, lng: 114.5870 },
    coverImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80",
    tags: ["Outdoor", "Pemula OK", "Gratis"],
    maxParticipants: 12, participants: ["user_3", "user_8", "user_2", "user_4"],
    likes: ["user_1", "user_5", "user_6", "user_7"],
    commentsList: [{ userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", text: "Akhirnya! Gw udah lama mau belajar 📸", createdAt: Date.now() - 4000 }],
    createdAt: Date.now() - 800
  },
  "plan_13": {
    creatorId: "user_5", creatorName: "Daffa Pratama", creatorAvatar: "https://i.pravatar.cc/150?u=daffa",
    title: "Movie Night: Horror Marathon", description: "Nonton 3 film horror terbaru di bioskop! Siapa yang berani? 👻🎬 Bawa selimut sendiri haha",
    date: "2026-06-05", time: "19:00", vibe: "chill", location: "XXI Duta Mall",
    locationCoords: { lat: -3.3174, lng: 114.5910 },
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    tags: ["Indoor", "Malam", "18+"],
    maxParticipants: 8, participants: ["user_5", "user_1", "user_7"],
    likes: ["user_2", "user_3", "user_4"],
    commentsList: [],
    createdAt: Date.now() - 500
  },
  "plan_14": {
    creatorId: "user_4", creatorName: "Nisa Aulia", creatorAvatar: "https://i.pravatar.cc/150?u=nisa",
    title: "Book Club: Diskusi Novel", description: "Diskusi novel 'Laut Bercerita' karya Leila S. Chudori. Bawa buku masing-masing ya! 📖☕",
    date: "2026-06-07", time: "14:00", vibe: "study", location: "Perpustakaan Daerah Kalsel",
    locationCoords: { lat: -3.3140, lng: 114.5850 },
    coverImage: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&q=80",
    tags: ["Indoor", "Gratis", "Pemula OK"],
    maxParticipants: 10, participants: ["user_4", "user_2", "user_8", "user_6"],
    likes: ["user_3", "user_1"],
    commentsList: [{ userId: "user_6", userName: "Sari Indah", userAvatar: "https://i.pravatar.cc/150?u=sari", text: "Novel favoritku ini! Pasti seru", createdAt: Date.now() - 200 }],
    createdAt: Date.now() - 100
  }
};

const stories = {
  "story_1": { userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80", caption: "Morning coffee ☕", type: "image", createdAt: Date.now() - 3600000, expiresAt: Date.now() + 82800000 },
  "story_2": { userId: "user_3", userName: "Rizky Firmansyah", userAvatar: "https://i.pravatar.cc/150?u=rizky", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", caption: "Sunrise vibes 🌅", type: "image", createdAt: Date.now() - 7200000, expiresAt: Date.now() + 79200000 },
  "story_3": { userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", caption: "Gaming setup baru! 🎮", type: "image", createdAt: Date.now() - 1800000, expiresAt: Date.now() + 84600000 },
  "story_4": { userId: "user_6", userName: "Sari Indah", userAvatar: "https://i.pravatar.cc/150?u=sari", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", caption: "Makan siang dulu 🍜", type: "image", createdAt: Date.now() - 5400000, expiresAt: Date.now() + 81000000 },
  "story_5": { userId: "user_8", userName: "Maya Putri", userAvatar: "https://i.pravatar.cc/150?u=maya", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80", caption: "Work in progress 🎨", type: "image", createdAt: Date.now() - 900000, expiresAt: Date.now() + 85500000 },
  "story_6": { userId: "user_5", userName: "Daffa Pratama", userAvatar: "https://i.pravatar.cc/150?u=daffa", image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80", caption: "Skate or die 🛹", type: "image", createdAt: Date.now() - 2700000, expiresAt: Date.now() + 83700000 },
  "story_7": { userId: "user_4", userName: "Nisa Aulia", userAvatar: "https://i.pravatar.cc/150?u=nisa", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80", caption: "Buku baru dateng! 📖✨", type: "image", createdAt: Date.now() - 600000, expiresAt: Date.now() + 85800000 },
  "story_8": { userId: "user_7", userName: "Andi Wijaya", userAvatar: "https://i.pravatar.cc/150?u=andi", image: "https://images.unsplash.com/photo-1461896836934-bd45ba48ab6c?w=800&q=80", caption: "Leg day done ✅💪", type: "image", createdAt: Date.now() - 300000, expiresAt: Date.now() + 86100000 },
  "story_9": { userId: "user_2", userName: "Alya Maharani", userAvatar: "https://i.pravatar.cc/150?u=alya", image: null, caption: "Siapa yg mau nongkrong weekend ini? 😎🔥", type: "text", bgGradient: "from-purple-600 to-pink-500", createdAt: Date.now() - 150000, expiresAt: Date.now() + 86250000 },
  "story_10": { userId: "user_1", userName: "Bima Satria", userAvatar: "https://i.pravatar.cc/150?u=bima", image: null, caption: "Push rank malam ini. Yang mau join DM! 🎮", type: "text", bgGradient: "from-gas-green to-cyan-500", createdAt: Date.now() - 60000, expiresAt: Date.now() + 86340000 }
};

// Slug generator (mirrors src/utils/slug.js)
function generateSlug(title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const rand = Math.random().toString(16).slice(2, 8);
  return `${slug}-${rand}`;
}

// Username → user_id mapping for seed data
const userIdToUsername = {};
for (const [id, u] of Object.entries(users)) {
  if (u.username) userIdToUsername[id] = u.username;
}

async function seed() {
  console.log("🔥 Seeding users...");
  await fetch(`${FIREBASE_DB_URL}/users.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(users) });
  console.log("✅ Users seeded (8)");

  // Build usernames → uid mapping
  const usernamesMap = {};
  for (const [id, u] of Object.entries(users)) {
    if (u.username) usernamesMap[u.username] = id;
  }
  console.log("🔥 Seeding usernames mapping...");
  await fetch(`${FIREBASE_DB_URL}/usernames.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(usernamesMap) });
  console.log("✅ Usernames mapped");

  // Enrich plans with slug + creatorUsername
  const allPlans = { ...plans, ...morePlans };
  for (const plan of Object.values(allPlans)) {
    plan.slug = generateSlug(plan.title);
    plan.creatorUsername = userIdToUsername[plan.creatorId] || '';
  }
  console.log("🔥 Seeding plans...");
  await fetch(`${FIREBASE_DB_URL}/plans.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(allPlans) });
  console.log(`✅ Plans seeded (${Object.keys(allPlans).length})`);

  // Enrich posts with username
  for (const post of Object.values(posts)) {
    post.username = userIdToUsername[post.userId] || '';
  }
  console.log("🔥 Seeding posts...");
  await fetch(`${FIREBASE_DB_URL}/posts.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(posts) });
  console.log(`✅ Posts seeded (${Object.keys(posts).length})`);

  console.log("🔥 Seeding stories...");
  await fetch(`${FIREBASE_DB_URL}/stories.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stories) });
  console.log(`✅ Stories seeded (${Object.keys(stories).length})`);

  console.log("\n🎉 Database seeding complete! All data is live.");
}

seed().catch(console.error);

