/**
 * MatchShareCard.jsx — Tactical post-match story card for social sharing.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion } from 'framer-motion';
import { Trophy, Eye, Smile, Share2, X, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useLanguageStore } from '../../store/languageStore';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

export const MatchShareCard = ({ mvpName, undercoverName, foolName, roomCode = 'PARTY', onClose }) => {
  const { isRTL, t } = useLanguageStore();
  const shareUrl = `https://soulundercover.app/join?code=${roomCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Undercover Match Recap',
          text: `Check out our match recap! MVP: ${mvpName || 'Operative'}`,
          url: shareUrl,
        });
      } catch {
        // Canceled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={spring}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-center relative overflow-hidden space-y-4 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 end-3.5 w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-red-500 font-semibold">
            {isRTL ? 'ملخص إيجاز المهمة' : 'Mission Dossier Recap'}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {t('share.title') || (isRTL ? 'بطاقة التقرير التكتيكي' : 'Match Highlights')}
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            {isRTL ? `رمز الغرفة: #${roomCode}` : `Room Code: #${roomCode}`}
          </p>
        </div>

        {/* Highlights */}
        <div className="space-y-2 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-850 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Trophy size={13} className="text-amber-400" />
              <span>{t('victory.mvp') || (isRTL ? 'العميل الأفضل:' : 'MVP Operative:')}</span>
            </span>
            <span className="font-bold text-white">{mvpName || (isRTL ? 'سري' : 'Classified')}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Eye size={13} className="text-red-400" />
              <span>{t('roles.undercover') || (isRTL ? 'العميل المندس:' : 'Hostile Infiltrator:')}</span>
            </span>
            <span className="font-bold text-red-400">{undercoverName || (isRTL ? 'سري' : 'Covert')}</span>
          </div>

          {foolName && (
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Smile size={13} className="text-pink-400" />
                <span>{t('roles.mrwhite') || (isRTL ? 'العميل المضلل:' : 'Decoy Operative:')}</span>
              </span>
              <span className="font-bold text-zinc-300">{foolName}</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white p-2.5 rounded-xl inline-block mx-auto border border-zinc-200">
          <img src={qrCodeUrl} alt="Room QR" className="w-24 h-24 object-contain" />
        </div>
        <p className="text-[10px] text-zinc-500 font-mono">
          {t('share.scanToJoin') || (isRTL ? 'امسح للانضمام للتردد' : 'Scan to Join Frequency')}
        </p>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>
              {copied
                ? (t('share.copied') || (isRTL ? 'تم النسخ للحافظة' : 'Link Copied to Clipboard'))
                : (t('share.shareStory') || (isRTL ? 'مشاركة الإيجاز / نسخ الرابط' : 'Share Story / Copy Link'))}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchShareCard;
