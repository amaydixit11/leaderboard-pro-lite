import React, { useState } from 'react';
import { Contest, ContestStanding } from '../../types/codeforces';
import { ContestCard } from './ContestCard';
import { ContestStandingsModal } from './ContestStandingsModal';
import { useCodeforces } from '../../hooks/useCodeforces';

interface ContestsSectionProps {
  contests: Contest[];
  userHandles: string[];
}

export function ContestsSection({ contests, userHandles }: ContestsSectionProps) {
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [standings, setStandings] = useState<ContestStanding[]>([]);
  const [customContestId, setCustomContestId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { 
    fetchStandingsWithRetry, 
    loadingStandings, 
    standingsError 
  } = useCodeforces();

  const handleViewStandings = async (contest: Contest) => {
    setSelectedContest(contest);
    setStandings([]);
    
    if (!userHandles.length) {
      return;
    }

    const newStandings = await fetchStandingsWithRetry(contest.id, userHandles);
    setStandings(newStandings);
  };

  const handleCustomContestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customContestId) return;

    const contestId = parseInt(customContestId);
    if (isNaN(contestId)) {
      alert('Please enter a valid contest ID');
      return;
    }

    setSelectedContest({ 
      id: contestId, 
      name: `Contest #${contestId}`,
      type: 'CUSTOM',
      phase: 'FINISHED',
      frozen: false,
      durationSeconds: 0,
      startTimeSeconds: Date.now() / 1000,
      relativeTimeSeconds: 0
    });

    const newStandings = await fetchStandingsWithRetry(contestId, userHandles);
    setStandings(newStandings);
    setShowCustomInput(false);
    setCustomContestId('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Contests</h2>
          <p className="text-sm text-gray-500 mt-1">View standings for recent Codeforces contests</p>
        </div>
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 
                   border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          {showCustomInput ? 'Hide' : 'View Custom Contest'}
        </button>
      </div>

      {showCustomInput && (
        <form onSubmit={handleCustomContestSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={customContestId}
              onChange={(e) => setCustomContestId(e.target.value)}
              placeholder="Enter Contest ID (e.g., 1234)"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loadingStandings}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                       disabled:opacity-50 transition-colors"
            >
              {loadingStandings ? 'Loading...' : 'View Standings'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {contests.map((contest) => (
          <ContestCard
            key={contest.id}
            contest={contest}
            onViewStandings={handleViewStandings}
            loading={loadingStandings}
          />
        ))}
      </div>

      {selectedContest && (
        <ContestStandingsModal
          contest={selectedContest}
          standings={standings}
          onClose={() => {
            setSelectedContest(null);
            setStandings([]);
          }}
          loading={loadingStandings}
          error={standingsError}
        />
      )}
    </div>
  );
}