import React from 'react';
import { motion } from 'framer-motion';

export const MatchShareCard = ({ mvpName, undercoverName, foolName, roomCode = 'PARTY', onClose }) => {
  const shareUrl = `https://soulundercover.app/join?code=${roomCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SouL Undercover Match Results',
          text: `شوف شكون ربح معانا f-SouL Undercover! MVP: ${mvpName || 'البطل'}`,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share canceled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('الرابط تنسخ! تقدر تبارطاجيه f-Instagram ولا TikTok');
      } catch (err) {
        alert(shareUrl);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <div className="bg-gradient-to-b from-gray-900 to-purple-950 border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <h2 className="text-2xl font-black text-amber-400 mb-1">ملخص الجولة 🎭</h2>
        <p className="text-xs text-gray-400 mb-4">SouL Undercover Party</p>

        {/* Highlights */}
        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 mb-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">🏆 MVP الجولة:</span>
            <span className="font-bold text-amber-300">{mvpName || 'لا يوجد'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">🕵️ الجاسوس:</span>
            <span className="font-bold text-red-400">{undercoverName || 'مخفي'}</span>
          </div>
          {foolName && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">🤡 المهرج (Fool):</span>
              <span className="font-bold text-pink-400">{foolName}</span>
            </div>
          )}
        </div>

        {/* QR Code section */}
        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl w-32 h-32 mx-auto mb-4">
          <img src={qrCodeUrl} alt="Room QR Code" className="w-full h-full object-contain" />
        </div>
        <p className="text-[10px] text-gray-400 mb-5">سكانّي باه تلعب معانا | Room: <span className="text-amber-400 font-mono font-bold">{roomCode}</span></p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-2.5 rounded-xl text-sm shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            بارطاجي f-Story 🚀
          </button>
          <button 
            onClick={onClose}
            className="px-4 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchShareCard;
