import React from 'react';
import { XCircle, ExternalLink, Medal } from 'lucide-react';
import type { Contest, ContestStanding } from '../../types/codeforces';

interface ContestStandingsModalProps {
  contest: Contest;
  standings: ContestStanding[];
  onClose: () => void;
  loading: boolean;
  error?: string;
}

export function ContestStandingsModal({ 
  contest, 
  standings, 
  onClose, 
  loading, 
  error 
}: ContestStandingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{contest.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Started {new Date(contest.startTimeSeconds * 1000).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Loading standings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : standings.length > 0 ? (
            <div className="p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-900">Rank</th>
                      <th className="px-6 py-4 font-medium text-gray-900">Participant</th>
                      <th className="px-6 py-4 font-medium text-gray-900">Points</th>
                      <th className="px-6 py-4 font-medium text-gray-900">Hacks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {standings.map((row, index) => (
                      <tr 
                        key={index} 
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 flex items-center gap-2">
                          {index < 3 && (
                            <Medal className={`w-5 h-5 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-500'
                            }`} />
                          )}
                          <span className={`font-medium ${
                            index < 3 ? 'text-indigo-600' : 'text-gray-900'
                          }`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://codeforces.com/profile/${row.party.members[0].handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700"
                          >
                            {row.party.members[0].handle}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {row.points}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-green-600">+{row.successfulHackCount}</span>
                            <span className="text-red-600">-{row.unsuccessfulHackCount}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No standings available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}