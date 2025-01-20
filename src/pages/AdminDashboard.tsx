import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfDay, isAfter } from 'date-fns';
import { supabase } from '../lib/supabase';
import { validateCodeforcesHandle, getProblemIdFromUrl, checkSubmission } from '../lib/codeforces';
import type { User, Problem, Submission } from '../lib/types';
import { Users, Calendar, CheckCircle2, XCircle, Upload, RefreshCw, ExternalLink, Search } from 'lucide-react';

export function AdminDashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [newProblem, setNewProblem] = useState({ link: '' });
  const [newUser, setNewUser] = useState({ name: '', codeforces_handle: '' });
  const [loading, setLoading] = useState(false);
  const [bulkUsersText, setBulkUsersText] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingSubmissions, setCheckingSubmissions] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchProblems();
    fetchUsers();
    fetchSubmissions();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      if (data) setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, user:users(*), problem:problems(*)')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      if (data) setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);
    setValidationError('');

    try {
      const problemId = await getProblemIdFromUrl(newProblem.link);
      if (!problemId) {
        setValidationError('Invalid Codeforces problem URL');
        return;
      }

      const { error } = await supabase
        .from('problems')
        .insert([{
          link: newProblem.link,
          date: format(selectedDate, 'yyyy-MM-dd')
        }]);

      if (error) {
        if (error.code === '23505') {
          setValidationError('Problem already exists for this date');
        } else {
          throw error;
        }
        return;
      }

      setNewProblem({ link: '' });
      fetchProblems();
    } catch (error) {
      console.error('Error adding problem:', error);
      setValidationError('Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationError('');

    try {
      const isValid = await validateCodeforcesHandle(newUser.codeforces_handle);
      if (!isValid) {
        setValidationError('Invalid Codeforces handle');
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert([{
          name: newUser.name,
          codeforces_handle: newUser.codeforces_handle,
          points: 0
        }]);

      if (error) {
        if (error.code === '23505') {
          setValidationError('User already exists');
        } else {
          throw error;
        }
        return;
      }

      setNewUser({ name: '', codeforces_handle: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setValidationError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationError('');

    try {
      const userLines = bulkUsersText.split('\n');
      const users = [];
      
      for (const line of userLines) {
        const [name, handle] = line.split(',').map(s => s.trim());
        if (name && handle) {
          const isValid = await validateCodeforcesHandle(handle);
          if (isValid) {
            users.push({ 
              name, 
              codeforces_handle: handle, 
              points: 0 
            });
          }
        }
      }

      if (users.length === 0) {
        setValidationError('No valid users found');
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert(users);

      if (error) {
        throw error;
      }

      setBulkUsersText('');
      setShowBulkAdd(false);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk adding users:', error);
      setValidationError('Failed to add users');
    } finally {
      setLoading(false);
    }
  };

  const checkAllSubmissions = async () => {
    setCheckingSubmissions(true);
    try {
      for (const problem of problems) {
        const problemDate = startOfDay(new Date(problem.date));
        const now = new Date();
        
        if (!isAfter(now, problemDate)) continue;

        const problemId = await getProblemIdFromUrl(problem.link);
        if (!problemId) continue;

        for (const user of users) {
          const solved = await checkSubmission(
            user.codeforces_handle,
            problemId,
            Math.floor(problemDate.getTime() / 1000)
          );

          if (solved) {
            const { error } = await supabase
              .from('submissions')
              .upsert([{
                user_id: user.id,
                problem_id: problem.id,
                solved: true,
                submitted_at: new Date().toISOString()
              }], {
                onConflict: 'user_id,problem_id'
              });

            if (error) {
              console.error('Error updating submission:', error);
            }
          }
        }
      }
      
      await fetchSubmissions();
      await fetchUsers(); // Refresh users to get updated points
    } catch (error) {
      console.error('Error checking submissions:', error);
    } finally {
      setCheckingSubmissions(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.codeforces_handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={checkAllSubmissions}
          disabled={checkingSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checkingSubmissions ? 'animate-spin' : ''}`} />
          Check Submissions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add POTD Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Add Problem of the Day</h2>
          </div>
          <form onSubmit={handleAddProblem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Problem Link</label>
              <input
                type="url"
                value={newProblem.link}
                onChange={e => setNewProblem(prev => ({ ...prev, link: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="https://codeforces.com/problemset/problem/..."
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Add Problem
            </button>
          </form>
        </div>

        {/* Add User Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">Add User</h2>
            </div>
            <button
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
            >
              <Upload className="w-4 h-4" />
              {showBulkAdd ? 'Single Add' : 'Bulk Add'}
            </button>
          </div>
          
          {showBulkAdd ? (
            <form onSubmit={handleBulkAddUsers} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paste users (Name,Codeforces Handle) (comma separated values)
                </label>
                <textarea
                  value={bulkUsersText}
                  onChange={e => setBulkUsersText(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-48"
                  placeholder="Mohd Adil&#9;Alpha_CoderA&#10;Dhruv Saini&#9;roseagain"
                  required
                />
                {validationError && (
                  <p className="mt-1 text-sm text-red-600">{validationError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Add Users
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Codeforces Handle</label>
                <input
                  type="text"
                  value={newUser.codeforces_handle}
                  onChange={e => setNewUser(prev => ({ ...prev, codeforces_handle: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {validationError && (
                  <p className="mt-1 text-sm text-red-600">{validationError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Add User
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Users ({filteredUsers.length})</h2>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codeforces Handle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.codeforces_handle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://codeforces.com/profile/${user.codeforces_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problems List */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Problems</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solved By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map((problem) => {
                const solvedCount = submissions.filter(
                  s => s.problem_id === problem.id && s.solved
                ).length;
                
                return (
                  <tr key={problem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(problem.date), 'PP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        {problem.link.split('/').pop()}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {solvedCount} users
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}