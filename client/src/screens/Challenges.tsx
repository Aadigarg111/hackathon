import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  dueDate?: string;
  categories: string[];
  participants: number;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  stakeAmount: number;
  status: 'active' | 'completed' | 'failed';
  peerGroup?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface PeerGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  members: number;
}

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Build a Todo App with React',
    description: 'Create a simple todo application with React, featuring add, edit, delete, and mark complete functionality.',
    difficulty: 'easy',
    points: 50,
    dueDate: '2023-12-31',
    categories: ['Frontend', 'React'],
    participants: 24
  },
  {
    id: '2',
    title: 'RESTful API with Node.js',
    description: 'Build a RESTful API with Node.js, Express, and MongoDB for a blogging platform.',
    difficulty: 'medium',
    points: 75,
    dueDate: '2023-12-15',
    categories: ['Backend', 'Node.js', 'API'],
    participants: 18
  },
  {
    id: '3',
    title: 'Full-Stack E-commerce Site',
    description: 'Create a complete e-commerce site with user authentication, product listing, cart, and checkout.',
    difficulty: 'hard',
    points: 150,
    dueDate: '2024-01-15',
    categories: ['Full-Stack', 'E-commerce'],
    participants: 12
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
};

const Challenges: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [peerGroups, setPeerGroups] = useState<PeerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeerGroup, setSelectedPeerGroup] = useState('');

  // Debug functions
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugVisible, setDebugVisible] = useState(false);
  const [healthCheck, setHealthCheck] = useState<any>(null);

  const fetchDebugInfo = async () => {
    try {
      // Check auth status
      const response = await fetch('http://localhost:5000/api/auth/debug', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      setDebugInfo({ error: (error as Error).message });
    }
  };

  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setHealthCheck({
        status: response.status,
        ok: response.ok,
        data
      });
    } catch (error) {
      console.error('Error checking server health:', error);
      setHealthCheck({ error: (error as Error).message });
    }
  };

  // Fetch health check on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // For now we're using mock data, but in a real application,
  // you would fetch challenges from the backend here
  useEffect(() => {
    // Simulate filtering (in a real app, this would be a server call)
    if (filter === 'all') {
      setChallenges(mockChallenges);
    } else {
      const filtered = mockChallenges.filter(
        challenge => challenge.difficulty === filter
      );
      setChallenges(filtered);
    }
  }, [filter]);

  // Fetch user's goals
  useEffect(() => {
    if (user) {
      fetchUserGoals();
      fetchPeerGroups();
    }
  }, [user]);

  const fetchUserGoals = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching user goals with credentials');
      const response = await fetch('http://localhost:5000/api/goals', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      // Check authentication status
      if (response.status === 401) {
        console.error('Unauthorized: Authentication failed when fetching goals');
        setErrorMessage('Authentication error. Please log in again.');
        if (user) {
          // We have a user in state but the server doesn't recognize our auth
          // This might indicate a stale token
          alert('Your session has expired. Please log in again.');
          // In a real application, you might want to redirect to the login page
          // or trigger a token refresh
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Goals fetched successfully:', data.length);
      setUserGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setErrorMessage(`Failed to load your goals: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeerGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/peer-groups/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch peer groups');
      }

      const data = await response.json();
      setPeerGroups(data);
    } catch (error) {
      console.error('Error fetching peer groups:', error);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Validate form
      if (!goalTitle || !goalDescription || !goalDeadline || !stakeAmount) {
        setErrorMessage('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create the goal
      const payload = {
        title: goalTitle,
        description: goalDescription,
        deadline: goalDeadline,
        stakeAmount: parseFloat(stakeAmount),
        peerGroupId: selectedPeerGroup || undefined,
      };

      console.log('Sending goal creation request with payload:', payload);

      // Check if we're authenticated first
      try {
        console.log('Checking authentication before goal creation');
        const authCheck = await fetch('http://localhost:5000/api/auth/debug', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        
        if (!authCheck.ok) {
          console.error('Auth check failed with status:', authCheck.status);
          throw new Error(`Authentication check failed (${authCheck.status}). Please log in again.`);
        }
        
        const authData = await authCheck.json();
        console.log('Auth check before goal creation:', authData);
        
        if (!authData.user || authData.user === 'missing') {
          console.error('No user found in auth debug data');
          throw new Error('Not authenticated. Please log in again.');
        }
        
        // Check for cookies
        if (!authData.cookies || !authData.cookies.token) {
          console.error('No auth token cookie found');
          throw new Error('Authentication token missing. Please log in again.');
        }
        
        console.log('Authentication verified, proceeding with goal creation');
      } catch (authError) {
        console.error('Auth check error:', authError);
        throw new Error(`Authentication error: ${(authError as Error).message}`);
      }

      // Now create the goal
      const response = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      // Get the response content
      let responseText;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Error getting response text:', textError);
        throw new Error('Could not read server response');
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing response as JSON:', jsonError);
        console.error('Raw response:', responseText);
        throw new Error(`Server returned invalid JSON. Status: ${response.status} ${response.statusText}`);
      }

      // Handle non-success HTTP status
      if (!response.ok) {
        console.error('Error response from server:', data);
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Success
      console.log('Goal created successfully:', data);
      
      // Reset form and close modal
      setGoalTitle('');
      setGoalDescription('');
      setGoalDeadline('');
      setStakeAmount('');
      setSelectedPeerGroup('');
      setShowCreateModal(false);
      
      // Refresh goals list
      fetchUserGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      setErrorMessage((error as Error).message || 'Failed to create goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Coding Challenges</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Welcome, {user?.displayName || user?.username}
            </span>
            <Button onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User's Goals Section */}
        <div className="px-4 py-6 mb-8 bg-white shadow rounded-lg sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Goals</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              Create New Goal
            </Button>
          </div>
          
          {userGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGoals.map((goal) => (
                <Card key={goal._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <Badge className={
                        goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="text-sm text-gray-500 mt-1">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{goal.description}</p>
                    {goal.peerGroup && (
                      <Badge variant="outline" className="mb-3">
                        Group: {goal.peerGroup.name}
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 flex justify-between items-center">
                    <div className="font-bold text-purple-600">{goal.stakeAmount} CRYPTO</div>
                    <Button 
                      variant={goal.status === 'active' ? 'default' : 'outline'}
                      disabled={goal.status !== 'active'}
                    >
                      {goal.status === 'active' ? 'Update Progress' : 'Completed'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? (
                <p>Loading your goals...</p>
              ) : (
                <>
                  <p className="mb-4">You haven't created any goals yet.</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create Your First Goal
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Challenges Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Featured Challenges</h2>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'easy' ? 'default' : 'outline'} 
                onClick={() => setFilter('easy')}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Easy
              </Button>
              <Button 
                variant={filter === 'medium' ? 'default' : 'outline'} 
                onClick={() => setFilter('medium')}
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Medium
              </Button>
              <Button 
                variant={filter === 'hard' ? 'default' : 'outline'} 
                onClick={() => setFilter('hard')}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Hard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {challenge.dueDate && (
                      <div className="text-sm text-gray-500 mt-1">
                        Due: {new Date(challenge.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{challenge.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {challenge.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {challenge.participants} participants
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-between items-center">
                  <div className="font-bold text-purple-600">{challenge.points} points</div>
                  <Button onClick={() => {
                    setGoalTitle(`Challenge: ${challenge.title}`);
                    setGoalDescription(challenge.description);
                    setShowCreateModal(true);
                  }}>Join Challenge</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Debug Section */}
        {debugVisible && (
          <div className="px-4 py-5 bg-white shadow sm:rounded-lg sm:px-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Debug Information</h3>
            <div className="mt-3 space-y-4">
              <div>
                <h4 className="font-medium">Server Health</h4>
                <Button onClick={checkServerHealth} className="mt-2 mb-2">Check Server Health</Button>
                <pre className="mt-1 bg-gray-100 p-4 rounded overflow-auto max-h-40 text-xs">
                  {healthCheck ? JSON.stringify(healthCheck, null, 2) : 'No health data'}
                </pre>
              </div>

              <div>
                <h4 className="font-medium">Authentication Status</h4>
                <Button onClick={fetchDebugInfo} className="mt-2 mb-2">Check Auth Status</Button>
                <pre className="mt-1 bg-gray-100 p-4 rounded overflow-auto max-h-40 text-xs">
                  {debugInfo ? JSON.stringify(debugInfo, null, 2) : 'No auth data'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleCreateGoal}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title*
                  </label>
                  <Input
                    value={goalTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Leetcode 30 days challenge"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <Textarea
                    value={goalDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoalDescription(e.target.value)}
                    placeholder="Describe your goal and what you want to achieve"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline*
                  </label>
                  <Input
                    type="date"
                    value={goalDeadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Stake (CRYPTO)*
                  </label>
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStakeAmount(e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This amount will be staked on your goal completion. You'll earn it back plus rewards if you succeed.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join a Peer Group (Optional)
                  </label>
                  <Select value={selectedPeerGroup} onValueChange={setSelectedPeerGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a peer group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Peer Group</SelectItem>
                      {peerGroups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Joining a peer group will help you stay accountable and connect with other coders.
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Goal'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges; 