import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Close when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // We add a tiny timeout so the toggle button itself doesn't trigger this immediately
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus) return; // already read
    
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-zinc-200 rounded-3xl shadow-2xl shadow-zinc-900/10 overflow-hidden z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
        <h3 className="text-zinc-900 font-black tracking-tight">Signals</h3>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-5 h-5 border-2 border-zinc-100 border-t-zinc-400 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-400 font-medium text-sm">No new signals detected.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(notification => (
              <div 
                key={notification._id}
                onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                className={`group p-5 border-b border-zinc-50 hover:bg-zinc-50 transition-luxury block cursor-pointer
                  ${!notification.isRead ? 'bg-zinc-50/50' : 'bg-transparent'}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm ${!notification.isRead ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                      <span className="font-bold text-zinc-900">{notification.sender?.name || 'Explorer'}</span>
                      {notification.type === 'LIKE' && ' liked your post '}
                      {notification.type === 'COMMENT' && ' left a thought on '}
                      {notification.type === 'FOLLOW' && ' started tracking your signals'}
                    </p>
                    {notification.post && (
                      <Link 
                        to={`/post/${notification.post._id}`}
                        className="block mt-1 text-xs text-blue-600 hover:text-blue-500 font-medium truncate max-w-[250px]"
                      >
                        {notification.post.title}
                      </Link>
                    )}
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-3">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
