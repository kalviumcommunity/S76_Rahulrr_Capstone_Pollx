import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShare, FaCopy, FaWhatsapp, FaTwitter, FaInstagram, FaCheck } from 'react-icons/fa';

const ShareButton = ({ pollId, pollQuestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const pollUrl = `${baseUrl}/polls?highlight=${pollId}`;

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? FaCheck : FaCopy,
      color: 'text-gray-400 hover:text-gray-200',
      action: () => copyToClipboard(pollUrl)
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'text-green-500 hover:text-green-400',
      action: () => shareToWhatsApp(pollUrl, pollQuestion)
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'text-blue-500 hover:text-blue-400',
      action: () => shareToTwitter(pollUrl, pollQuestion)
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      color: 'text-pink-500 hover:text-pink-400',
      action: () => shareToInstagram(pollUrl, pollQuestion)
    }
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = (url, question) => {
    const text = `Check out this poll: "${question}" ${url}?src=whatsapp`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToTwitter = (url, question) => {
    const text = `What do you think? "${question}"`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url + '?src=twitter')}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToInstagram = (url, question) => {
    // Instagram doesn't have a direct URL sharing scheme like WhatsApp or Twitter
    // We'll copy the content to clipboard and provide instructions
    const text = `Check out this poll: "${question}" ${url}?src=instagram`;
    
    // Copy to clipboard first
    copyToClipboard(text);
    
    // Try to detect if user is on mobile for better Instagram experience
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, try to open Instagram app
      const instagramUrl = `instagram://app`;
      window.location.href = instagramUrl;
      
      // Fallback to Instagram web if app doesn't open
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1000);
    } else {
      // On desktop, open Instagram web
      window.open('https://www.instagram.com/', '_blank');
    }
    
    // Show instruction with better UX
    setTimeout(() => {
      alert('📋 Poll link copied to clipboard!\n\nYou can now paste it in your Instagram story, post, or bio. Instagram will automatically detect and format the link.');
    }, 800);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-xs font-medium text-blue-400 border border-blue-400/30 rounded-md hover:bg-blue-400/10 hover:border-blue-400/50 transition-all duration-200"
        title="Share Poll"
      >
        <FaShare className="mr-1.5 text-xs" />
        Share
      </motion.button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute bottom-full right-0 mb-2 bg-[#2B2B2B] border border-gray-600 rounded-lg shadow-xl z-20 min-w-[180px]"
          >
            <div className="py-2">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => {
                    option.action();
                    if (option.name !== 'Copy Link') {
                      setIsOpen(false);
                    }
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <option.icon className={`mr-3 text-base ${option.color}`} />
                  {option.name}
                  {option.name === 'Copy Link' && copied && (
                    <span className="ml-auto text-xs text-green-400">Copied!</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
