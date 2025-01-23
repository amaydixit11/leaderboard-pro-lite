// import type { User } from './user';

// export interface Achievement {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   tier: 'bronze' | 'silver' | 'gold' | 'platinum';
//   points: number;
// }

// export interface Badge {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   rarity: 'common' | 'rare' | 'epic' | 'legendary';
// }

// export interface UserAchievement {
//   id: string;
//   user_id: string;
//   achievement_id: string;
//   achieved_at: string;
//   achievement?: Achievement;
// }

// export interface UserBadge {
//   id: string;
//   user_id: string;
//   badge_id: string;
//   earned_at: string;
//   badge?: Badge;
// }

// export interface UserStats {
//   total_problems_solved: number;
//   current_streak: number;
//   longest_streak: number;
//   institute_rank: number;
//   global_rank: number;
//   rating: number;
//   contests_participated: number;
//   achievements_count: number;
//   badges_count: number;
// }

// export interface UserProfile extends User {
//   stats: UserStats;
//   achievements: UserAchievement[];
//   badges: UserBadge[];
//   recent_activity: Array<{
//     id: string;
//     type: 'problem_solved' | 'achievement_earned' | 'badge_earned' | 'contest_participated';
//     timestamp: string;
//     data: Record<string, any>;
//   }>;
// }