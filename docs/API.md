# Data Schema & API Guide

GasAja! uses **Firebase Realtime Database (RTDB)** as its primary datastore to facilitate real-time updates and low-latency interaction.

---

## 1. Database Schema Overview

```
gasaja-rtdb/
├── users/
│   └── [uid]/
│       ├── displayName: string
│       ├── email: string
│       ├── username: string
│       ├── avatar: string
│       ├── bio: string
│       ├── followers: number
│       ├── following: number
│       ├── createdAt: timestamp
│       └── savedPlans/
│           └── [planId]: boolean
│
├── usernames/
│   └── [username]: uid  (Fast reverse lookup table)
│
├── plans/
│   └── [planId]/
│       ├── title: string
│       ├── description: string
│       ├── date: string
│       ├── time: string
│       ├── location: string
│       ├── locationCoords/
│       │   ├── lat: number
│       │   └── lng: number
│       ├── vibe: string
│       ├── maxParticipants: number
│       ├── coverImage: string
│       ├── tags: Array<string>
│       ├── slug: string
│       ├── creatorId: string
│       ├── creatorUsername: string
│       ├── creatorName: string
│       ├── creatorAvatar: string
│       ├── participants: Array<uid>
│       ├── likes: Array<uid>
│       ├── commentsList/
│       │   └── [commentId]/
│       │       ├── userId: string
│       │       ├── userName: string
│       │       ├── userAvatar: string
│       │       ├── text: string
│       │       └── createdAt: timestamp
│       └── createdAt: timestamp
│
├── posts/
│   └── [postId]/
│       ├── userId: string
│       ├── userName: string
│       ├── username: string
│       ├── userAvatar: string
│       ├── content: string
│       ├── image: string | null
│       ├── likes: Array<uid>
│       ├── comments/
│       │   └── [commentId]/
│       │       ├── userId: string
│       │       ├── userName: string
│       │       ├── userAvatar: string
│       │       ├── text: string
│       │       └── createdAt: timestamp
│       └── createdAt: timestamp
│
└── notifications/
    └── [uid]/
        └── [notificationId]/
            ├── type: 'like' | 'comment' | 'join' | 'follow'
            ├── fromName: string
            ├── fromAvatar: string
            ├── text: string
            ├── link: string
            ├── read: boolean
            └── createdAt: timestamp
```

---

## 2. Reverse Lookup Architecture

To support clean profile links like `gasaja.com/budi_gas` instead of `gasaja.com/profile/uid_hash`, we use a dedicated lookup table:

```json
"usernames": {
  "budi_gas": "user_uid_12345"
}
```

When visiting a profile:
1. The router resolves the parameter `username` (`budi_gas`).
2. The page makes a direct request to `usernames/budi_gas.json`.
3. If it exists, it returns `uid_12345`.
4. The client then fetches the profile under `users/user_uid_12345.json`.
5. This index approach avoids massive full-database scans, providing sub-millisecond route loads.

---

## 3. Database Security Rules (`database.rules.json`)

To prevent unauthorized read/writes, the rules ensure:
- Only authenticated users can write data.
- Users can only write/modify their own profiles (`users/$uid`).
- Lookups and feed lists are publicly readable to support quick renders.
