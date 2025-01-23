export interface Contest {
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds: number;
  }
  
  export interface ContestMember {
    handle: string;
    name?: string;
  }
  
  export interface ContestParty {
    contestId: number;
    members: ContestMember[];
    participantType: string;
    teamId?: number;
    teamName?: string;
    ghost: boolean;
    room?: number;
    startTimeSeconds: number;
  }
  
  export interface ProblemResult {
    points: number;
    rejectedAttemptCount: number;
    type: string;
    bestSubmissionTimeSeconds?: number;
  }
  
  export interface ContestStanding {
    party: ContestParty;
    rank: number;
    points: number;
    penalty: number;
    successfulHackCount: number;
    unsuccessfulHackCount: number;
    problemResults: ProblemResult[];
  }