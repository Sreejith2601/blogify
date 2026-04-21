import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../services/notificationService';

const Navbar = () => {
  const { user, token, logoutContext } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    // Close mobile menu on route change
    setShowMobileMenu(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    if (token) {
      const fetchCount = async () => {
        try {
          const data = await notificationService.getNotifications();
          setUnreadCount(data.unreadCount || 0);
        } catch {}
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    logoutContext();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const navLinkClass = (path) =>
    `text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-200 pb-0.5 ${
      isActive(path)
        ? 'text-zinc-900 border-b-2 border-brand-accent'
        : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
      isActive(path)
        ? 'bg-zinc-50 text-zinc-900'
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
    }`;

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-zinc-100 shadow-sm">
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-3 sm:py-4">
        <div className="flex items-center justify-between">

          {/* Left — Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {token ? (
              <>
                <Link to="/" className={navLinkClass('/')}>Home</Link>
                <Link to="/profile" className={navLinkClass('/profile')}>My Posts</Link>
                <Link to="/saved" className={navLinkClass('/saved')}>Saved</Link>
                <Link to="/analytics" className={navLinkClass('/analytics')}>Analytics</Link>
                <Link to="/metadata" className={navLinkClass('/metadata')}>Manage Tags</Link>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass('/')}>Home</Link>
              </>
            )}
          </div>

          {/* Mobile: Hamburger + Logo side by side */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Center — Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-zinc-900 hover:text-zinc-900 transition-all uppercase">
              Blogify
            </Link>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {token ? (
              <>
                {/* Write button — hidden on small screens */}
                <Link
                  to="/create"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-wide rounded-lg hover:bg-zinc-800 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Write</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                    className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all relative focus:outline-none rounded-full hover:bg-zinc-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-white shadow-sm"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => {
                      setShowNotifications(false);
                      if (token) {
                        notificationService.getNotifications()
                          .then(data => setUnreadCount(data.unreadCount || 0))
                          .catch(() => {});
                      }
                    }} />
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                    className="flex items-center gap-1.5 focus:outline-none group"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-zinc-200 group-hover:border-zinc-900 transition-all">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500 uppercase">{user?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <svg className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-100 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden ring-1 ring-zinc-900/5">
                      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Authenticated Explorer</p>
                        <p className="text-sm font-black text-zinc-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate font-medium">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <DropdownLink to="/profile" icon="👤" label="My Profile" onClick={() => setShowProfileMenu(false)} />
                        <DropdownLink to="/saved" icon="🔖" label="Saved Library" onClick={() => setShowProfileMenu(false)} />
                        <DropdownLink to="/create" icon="✏️" label="Write a Post" onClick={() => setShowProfileMenu(false)} />
                        <DropdownLink to="/analytics" icon="📊" label="Analytics" onClick={() => setShowProfileMenu(false)} />
                        <DropdownLink to="/metadata" icon="🏷️" label="Manage Tags" onClick={() => setShowProfileMenu(false)} />
                      </div>
                      <div className="border-t border-zinc-100 py-2">
                        <DropdownLink to="/settings" icon="⚙️" label="Edit Profile" onClick={() => setShowProfileMenu(false)} />
                        <DropdownLink to="/change-password" icon="🔒" label="Change Password" onClick={() => setShowProfileMenu(false)} />
                      </div>
                      <div className="border-t border-zinc-100 py-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all duration-200">
                          <span className="text-base">🚪</span>
                          <span>Logout Archive</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-xs sm:text-sm font-semibold shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-zinc-100 bg-white px-4 py-6 space-y-2 shadow-xl">
          {token ? (
            <>
              <p className="px-4 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Navigation Hub</p>
              <Link to="/" className={mobileLinkClass('/')}>🏠 Home</Link>
              <Link to="/profile" className={mobileLinkClass('/profile')}>👤 My Posts</Link>
              <Link to="/saved" className={mobileLinkClass('/saved')}>🔖 Saved Library</Link>
              <Link to="/analytics" className={mobileLinkClass('/analytics')}>📊 Analytics</Link>
              <Link to="/metadata" className={mobileLinkClass('/metadata')}>🏷️ Manage Tags</Link>
              <Link to="/create" className={mobileLinkClass('/create')}>✏️ Write a Post</Link>
              <div className="border-t border-zinc-100 pt-6 mt-4">
                <p className="px-4 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Account Actions</p>
                <Link to="/settings" className={mobileLinkClass('/settings')}>⚙️ Edit Profile</Link>
                <Link to="/change-password" className={mobileLinkClass('/change-password')}>🔒 Change Password</Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all mt-2">
                  🚪 Terminate Session
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className={mobileLinkClass('/')}>🏠 Home</Link>
              <Link to="/login" className={mobileLinkClass('/login')}>🔑 Sign In</Link>
              <Link to="/register" className={mobileLinkClass('/register')}>✨ Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const DropdownLink = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors duration-150">
    <span className="text-base">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;
