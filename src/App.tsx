import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Trophy, Calendar, CheckCircle2, XCircle, LogIn } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { User, Problem, Submission } from './lib/types';
import { useAuth } from './hooks/useAuth';
import { Link } from 'react-router-dom';
import { LeaderboardModal } from './components/LeaderboardModal';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    fetchTodaysProblem();
    fetchLeaderboard();
    fetchSubmissions();
  }, []);

  const fetchTodaysProblem = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('date', format(new Date(), 'yyyy-MM-dd'))
        .maybeSingle();

      if (error) throw error;
      setCurrentProblem(data);
    } catch (error) {
      console.error('Error fetching today\'s problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, user:users(*), problem:problems(*)')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Ingenuity POTD Tracker</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                {user.email && ['ingenuity@iitbhilai.ac.in', 'amayd@iitbhilai.ac.in', 'priyanshuk@iitbhilai.ac.in'].includes(user.email) && (
                  <Link 
                    to="/admin"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Problem */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Today's Problem</h2>
            </div>
            {loading ? (
              <p className="text-gray-600">Loading problem...</p>
            ) : currentProblem ? (
              <div>
                <a 
                  href={currentProblem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Solve Problem →
                </a>
              </div>
            ) : (
              <p className="text-gray-600">No problem has been set for today.</p>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Top Performers</h2>
              </div>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.codeforces_handle}</div>
                    </div>
                  </div>
                  <span className="font-semibold">{user.points} points</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Submissions</h2>
          <div className="space-y-3">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    {submission.solved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">{submission.user?.name}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(submission.submitted_at), 'PPp')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No submissions yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          users={users}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

export default App;