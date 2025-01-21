import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Trophy, Calendar, CheckCircle2, XCircle, LogIn, Code2, Target, Flame, ExternalLink, Github, Heart, Instagram, Linkedin } from 'lucide-react';
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
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Ingenuity POTD Tracker
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                {user.email && ['ingenuity@iitbhilai.ac.in', 'amayd@iitbhilai.ac.in', 'priyanshuk@iitbhilai.ac.in'].includes(user.email) && (
                  <Link 
                    to="/admin"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
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
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Today's Challenge</h2>
                <p className="text-gray-500">{format(new Date(), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : currentProblem ? (
              <div className="space-y-4">
                <a 
                  href={currentProblem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
                >
                  <Code2 className="w-5 h-5" />
                  Solve Today's Problem
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-500">
                  Complete the challenge to earn points and climb the leaderboard!
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No problem has been set for today.</p>
                <p className="text-sm text-gray-500 mt-2">Check back later!</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Top Performers</h2>
                  <p className="text-gray-500">Leading competitive programmers</p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {users.slice(0, 5).map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700' :
                      index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700' :
                      index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700' :
                      'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700'
                    } font-bold text-lg`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <a
                        href={`https://codeforces.com/profile/${user.codeforces_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        @{user.codeforces_handle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-lg">{user.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-indigo-100 p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Recent Submissions</h2>
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {submission.solved ? (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{submission.user?.name}</span>
                      <div className="text-sm text-gray-500">
                        {format(new Date(submission.submitted_at), 'PPp')}
                      </div>
                    </div>
                  </div>
                  {submission.problem && (
                    <a
                      href={submission.problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      View Problem
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No submissions yet.</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to solve today's problem!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-gray-600">by</span>
              <a 
                href="https://github.com/amaydixit11/" 
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Amay Dixit
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/ingenuity_iit_bh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/ingenuity-iit-bhilai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Connect with us on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/amaydixit11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

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