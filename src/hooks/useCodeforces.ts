import { useState } from 'react';
import type { Contest, ContestStanding } from '../types/codeforces';

export function useCodeforces() {
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [standingsError, setStandingsError] = useState('');

  const fetchContests = async (): Promise<Contest[]> => {
    try {
      const response = await fetch('https://codeforces.com/api/contest.list?gym=false');
      const data = await response.json();
      if (data.status !== 'OK') throw new Error('Failed to fetch contests');
      return data.result
        .filter((contest: Contest) => contest.relativeTimeSeconds > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching contests:', error);
      return [];
    }
  };

  const fetchContestStandings = async (contestId: number, handles: string[]): Promise<ContestStanding[]> => {
    if (!handles?.length) {
      throw new Error('No valid handles provided');
    }

    const response = await fetch(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}&handles=${handles.join(';')}`
    );
    const data = await response.json();
    
    if (data.status === 'FAILED') {
      throw new Error(data.comment || 'Failed to fetch standings');
    }
    
    if (!data.result?.rows) {
      throw new Error('Invalid response format');
    }

    return data.result.rows;
  };

  const fetchStandingsWithRetry = async (contestId: number, handles: string[]): Promise<ContestStanding[]> => {
    setLoadingStandings(true);
    setStandingsError('');
    let validHandles = [...handles];
    let standings: ContestStanding[] = [];
  
    while (validHandles.length > 0) {
      try {
        standings = await fetchContestStandings(contestId, validHandles);
        break;
      } catch (error) {
        if (error instanceof Error && error.message.includes('handle')) {
          const invalidHandle = error.message.match(/handle (\w+) not found/)?.[1];
          if (invalidHandle) {
            validHandles = validHandles.filter(h => h !== invalidHandle);
            continue;
          }
        }
        setStandingsError('Failed to fetch contest standings. Please try again later.');
        break;
      }
    }
    
    setLoadingStandings(false);
    return standings;
  };

  return {
    fetchContests,
    fetchStandingsWithRetry,
    loadingStandings,
    standingsError
  };
}