import React from 'react';
import type { Contest } from '../../types/codeforces';

interface ContestCardProps {
  contest: Contest;
  onViewStandings: (contest: Contest) => void;
  loading: boolean;
}

export function ContestCard({ contest, onViewStandings, loading }: ContestCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-md">
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900">{contest.name}</h3>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            Start: {new Date(contest.startTimeSeconds * 1000).toLocaleString()}
          </p>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
            {contest.type}
          </span>
        </div>
      </div>
      <button
        onClick={() => onViewStandings(contest)}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 
                 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          'View Standings'
        )}
      </button>
    </div>
  );
}