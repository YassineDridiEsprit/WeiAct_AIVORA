// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Sprout, Mail, Lock, User, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// export default function SignUp() {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [metamaskAddress, setMetamaskAddress] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   // Function to connect MetaMask and fetch address
//   const connectMetaMask = async () => {
//     setError('');
//     if (!window.ethereum) {
//       setError('MetaMask is not installed. Please install it to continue.');
//       return;
//     }

//     try {
//       // Request access to MetaMask accounts
//       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//       if (accounts.length > 0) {
//         setMetamaskAddress(accounts[0]);
//       } else {
//         setError('No accounts found in MetaMask.');
//       }
//     } catch (err: any) {
//       console.error('MetaMask connection error:', err);
//       setError('Failed to connect to MetaMask. Please try again.');
//     }
//   };

//   // Check for MetaMask and attempt to auto-connect on mount
//   useEffect(() => {
//     if (window.ethereum) {
//       // Check if MetaMask is already connected
//       window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
//         if (accounts.length > 0) {
//           setMetamaskAddress(accounts[0]);
//         }
//       }).catch((err: any) => {
//         console.error('MetaMask auto-connect error:', err);
//       });
//     }
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess(false);

//     // Client-side validation
//     if (!fullName.trim()) {
//       setError('Full name is required');
//       return;
//     }
//     if (!email.includes('@') || !email.includes('.')) {
//       setError('Please enter a valid email address');
//       return;
//     }
//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }
//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }
//     if (!metamaskAddress) {
//       setError('Please connect your MetaMask wallet.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const [firstName, ...lastNameParts] = fullName.trim().split(' ');
//       const lastName = lastNameParts.join(' ') || '';

//       await register({
//         email,
//         password,
//         first_name: firstName,
//         last_name: lastName,
//         role: 'farmer',
//         metamask_address: metamaskAddress
//       });

//       setSuccess(true);
//       setTimeout(() => navigate('/dashboard'), 2000);
//     } catch (error: any) {
//       console.error('Registration error:', error.response?.data);
//       const errorMsg = error.response?.data?.error ||
//         error.response?.data?.errors?.map((e: any) => e.msg).join(', ') ||
//         error.message;
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
//       <div className="max-w-md w-full">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-3 rounded-2xl shadow-lg">
//               <Sprout className="h-10 w-10 text-white" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Join AgriHer</h1>
//           <p className="text-gray-600">Create your account and start growing</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {success && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
//                 <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-green-700">Account created successfully! Redirecting...</p>
//               </div>
//             )}

//             <div>
//               <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="fullName"
//                   type="text"
//                   required
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
//                   placeholder="Enter your full name"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="email"
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
//                   placeholder="Create a password"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="confirmPassword"
//                   type="password"
//                   required
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
//                   placeholder="Confirm your password"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="metamaskAddress" className="block text-sm font-medium text-gray-700 mb-2">
//                 Metamask Address
//               </label>
//               <div className="relative">
//                 <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="metamaskAddress"
//                   type="text"
//                   value={metamaskAddress}
//                   readOnly
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
//                   placeholder="Connect MetaMask to fill address"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={connectMetaMask}
//                 className="mt-2 w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-all font-medium"
//               >
//                 Connect MetaMask
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-rose-600 to-rose-600 text-white py-3 rounded-lg hover:from-rose-700 hover:to-rose-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//             >
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-600">
//               Already have an account?{' '}
//               <Link to="/signin" className="text-rose-600 hover:text-rose-700 font-medium">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>

//         <div className="text-center mt-6">
//           <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
//             ← Back to home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, User, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'transporter' | 'pressing' | 'onh'>('farmer');
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metaMaskConnecting, setMetaMaskConnecting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  console.log('SignUp.tsx loaded'); // Debugging log

  const roles: ('farmer' | 'transporter' | 'pressing' | 'onh')[] = ['farmer', 'transporter', 'pressing', 'onh'];

  const connectMetaMask = async () => {
    if (metaMaskConnecting) return;
    setError('');
    setMetaMaskConnecting(true);

    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      setMetaMaskConnecting(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setMetamaskAddress(accounts[0]);
      } else {
        setError('No accounts found in MetaMask.');
      }
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      if (err.code === -32002) {
        setError('A MetaMask connection request is already pending. Please check your MetaMask extension.');
      } else {
        setError('Failed to connect to MetaMask. Please try again.');
      }
    } finally {
      setMetaMaskConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum && !metamaskAddress) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setMetamaskAddress(accounts[0]);
          }
        })
        .catch((err: any) => {
          console.error('MetaMask auto-connect error:', err);
        });
    }
  }, [metamaskAddress]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setMetamaskAddress(accounts[0]);
        } else {
          setMetamaskAddress('');
          setError('MetaMask account disconnected.');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!metamaskAddress) {
      setError('Please connect your MetaMask wallet.');
      return;
    }
    if (!roles.includes(role)) {
      setError('Please select a valid role');
      return;
    }
    if (metamaskAddress && !/^0x[a-fA-F0-9]{40}$/.test(metamaskAddress)) {
      setError('Invalid MetaMask address');
      return;
    }

    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName; // Use firstName if lastName is empty

      const payload = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        metamask_address: metamaskAddress
      };
      console.log('Signup payload:', payload); // Log payload
      await register(payload);

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Registration error:', error.response?.data, error.response?.status, error.message);
      const errorMsg = error.response?.data?.error ||
        error.response?.data?.errors?.map((e: any) => e.msg).join(', ') ||
        (error.response?.status === 400 ? 'Invalid registration data. Please check your inputs.' : error.message);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Sprout className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Zitounti</h1>
          <p className="text-gray-600">Create your account and start growing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Account created successfully! Redirecting...</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'farmer' | 'transporter' | 'pressing' | 'onh')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all appearance-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="metamaskAddress" className="block text-sm font-medium text-gray-700 mb-2">
                MetaMask Address
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="metamaskAddress"
                  type="text"
                  value={metamaskAddress}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  placeholder="Connect MetaMask to fill address"
                />
              </div>
              <button
                type="button"
                onClick={connectMetaMask}
                disabled={metaMaskConnecting || !!metamaskAddress}
                className="mt-2 w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {metaMaskConnecting ? 'Connecting...' : metamaskAddress ? 'MetaMask Connected' : 'Connect MetaMask'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-600 text-white py-3 rounded-lg hover:from-rose-700 hover:to-rose-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-rose-600 hover:text-rose-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}