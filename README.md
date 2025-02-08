# Leaderboard Pro Lite

A Codeforces leaderboard application for Ingenuity, The CP club at IIT Bhilai, built with React, TypeScript, and Supabase. Track contest performance, manage competitions, and gamify the competitive programming experience.

## Features

- 🏆 Real-time Codeforces contest tracking
- 👑 Custom leaderboard creation and management
- 🔐 Admin dashboard for contest management
- 📊 Detailed performance analytics
- 🎮 Gamification elements
- 🌐 Supabase-powered backend

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase
- **Build Tool**: Vite
- **API Integration**: Codeforces API

## Project Structure

```
amaydixit11-leaderboard-pro-lite/
├── src/                      # Source code
│   ├── components/           # Reusable React components
│   │   ├── contests/        # Contest-related components
│   │   ├── AdminRoute.tsx   # Admin authentication wrapper
│   │   └── LeaderboardModal.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useCodeforces.ts # Codeforces API hook
│   ├── lib/                 # Utility functions and configurations
│   │   ├── codeforces.ts    # Codeforces API client
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── types.ts         # Shared type definitions
│   ├── pages/               # Page components
│   └── types/               # TypeScript type definitions
├── supabase/                # Supabase configurations
│   └── migrations/          # Database migrations
└── [config files]           # Various configuration files
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leaderboard-pro-lite.git
cd leaderboard-pro-lite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run development server:
```bash
npm run dev
```

## Database Migrations

To run migrations:

```bash
npx supabase migration up
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
