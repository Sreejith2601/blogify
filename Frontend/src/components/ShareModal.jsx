import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, shareUrl, title }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied! Share it on Instagram Stories.');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Share this story</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-2">
                <WhatsappShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center hover:scale-110 transition-transform text-green-600">
                    <WhatsappIcon size={48} round />
                  </div>
                </WhatsappShareButton>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</span>
              </div>

              {/* X / Twitter */}
              <div className="flex flex-col items-center gap-2">
                <TwitterShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:scale-110 transition-transform">
                    <TwitterIcon size={48} round />
                  </div>
                </TwitterShareButton>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">X</span>
              </div>

              {/* Facebook */}
              <div className="flex flex-col items-center gap-2">
                <FacebookShareButton url={shareUrl} quote={title}>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center hover:scale-110 transition-transform">
                    <FacebookIcon size={48} round />
                  </div>
                </FacebookShareButton>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook</span>
              </div>

              {/* Instagram Fallback */}
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={handleInstagram}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-100"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram</span>
              </div>
            </div>

            {/* Copy Link Input */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-2 flex items-center gap-3">
              <div className="flex-1 min-w-0 pl-3">
                <p className="text-xs text-gray-400 truncate font-medium">{shareUrl}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-700 transition-all flex-shrink-0"
              >
                Copy Link
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Modal Outer Div */}
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
