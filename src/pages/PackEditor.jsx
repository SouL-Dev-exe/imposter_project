/**
 * PackEditor.jsx — Full CRUD UI for custom word packs.
 * Create, edit, delete packs and word pairs.
 * Export packs as JSON, import JSON files from friends.
 * Publish to Supabase cloud so all players see them globally.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  UploadCloud, 
  Cloud, 
  RotateCcw, 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Lock, 
  Package, 
  Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { usePackStore } from '../store/packStore';
import { useLanguageStore } from '../store/languageStore';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { DEFAULT_PACKS } from '../data/defaultPacks';
import Footer from '../components/Footer';

// ─── Pack icon picker ─────────────────────────────────────────────────────────
const ICONS = ['📦', '🎯', '⚡', '🛡️', '👁️', '🎭', '🔥', '🎲', '🌐', '🧩', '🚀', '💎'];

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-colors cursor-pointer border ${
            value === icon
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// ─── Word tag ─────────────────────────────────────────────────────────────────
function WordTag({ word, onDelete }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 bg-zinc-900 text-zinc-200 text-xs font-medium px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors select-none group"
    >
      <span>{word}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(word);
          }}
          className="text-zinc-500 hover:text-red-400 rounded w-4 h-4 flex items-center justify-center text-xs transition-colors cursor-pointer"
          title="Remove word"
        >
          <X size={12} />
        </button>
      )}
    </motion.span>
  );
}

// ─── New single-word form ─────────────────────────────────────────────────────
function AddWordForm({ onAdd }) {
  const { isRTL } = useLanguageStore();
  const [word, setWord] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const handleAdd = () => {
    const trimmed = word.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setWord('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border border-dashed border-zinc-800
                   text-zinc-400 text-xs font-semibold hover:border-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
      >
        <Plus size={14} /> <span>{isRTL ? 'إضافة كلمة' : 'Add Word'}</span>
      </button>
    );
  }

  return (
    <motion.div
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-3 font-sans"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-white text-xs font-bold">{isRTL ? 'إدخال كلمة جديدة' : 'New Word Entry'}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-zinc-500 hover:text-white text-xs cursor-pointer"
        >
          {isRTL ? 'إغلاق' : 'Close'}
        </button>
      </div>
      <div>
        <input
          ref={inputRef}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRTL ? 'مثال: قهوة / قبعة' : 'e.g. قهوة / Coffee'}
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white
                     text-xs focus:outline-none focus:border-red-600 placeholder-zinc-600 transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleAdd} disabled={!word.trim()} size="sm">
          {isRTL ? 'إضافة' : 'Add Word'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Cloud status badge ───────────────────────────────────────────────────────
function CloudStatusBadge({ status }) {
  const cfg = {
    loading: { text: 'Syncing...', cls: 'bg-zinc-900 text-zinc-400 border-zinc-800' },
    synced:  { text: 'Cloud Synced', cls: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' },
    offline: { text: 'Offline Mode', cls: 'bg-amber-950/40 text-amber-400 border-amber-800/40' },
    error:   { text: 'Sync Error', cls: 'bg-red-950/40 text-red-400 border-red-800/40' },
    idle:    { text: '', cls: '' },
  }[status] || { text: '', cls: '' };

  if (!cfg.text) return null;
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cfg.cls}`}>{cfg.text}</span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PackEditor() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguageStore();
  const {
    customPacks, cloudPacks, cloudStatus,
    addPack, deletePack, addWord, deleteWord,
    exportPack, importPack, publishPackToCloud, syncCloudPacks, deleteCloudPack,
  } = usePackStore();

  const getPackWords = (pack) => {
    if (!pack) return [];
    if (Array.isArray(pack.words) && pack.words.length > 0) return pack.words;
    if (Array.isArray(pack.pairs)) {
      return pack.pairs.flatMap((p) => [p.civilian || p.wordA, p.undercover || p.wordB]).filter(Boolean);
    }
    return [];
  };

  const [selectedPackId, setSelectedPackId] = useState(null);
  const [showNewPackModal, setShowNewPackModal] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackIcon, setNewPackIcon] = useState('package');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [publishStatus, setPublishStatus] = useState({});
  const [activeTab, setActiveTab] = useState('custom');

  // Delete cloud pack state
  const [deleteCloudTarget, setDeleteCloudTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingCloud, setIsDeletingCloud] = useState(false);

  const fileInputRef = useRef(null);
  const selectedPack = customPacks.find((p) => p.id === selectedPackId);

  const handleDeleteCloudPack = async () => {
    if (!deleteCloudTarget) return;
    setIsDeletingCloud(true);
    setDeleteError('');
    const res = await deleteCloudPack(deleteCloudTarget.supabaseId, deleteCloudTarget.packName, deletePassword);
    setIsDeletingCloud(false);
    if (res.success) {
      setDeleteCloudTarget(null);
      setDeletePassword('');
    } else {
      setDeleteError(res.error || 'Failed to delete pack.');
    }
  };

  const handleCreatePack = () => {
    if (!newPackName.trim()) return;
    const id = addPack(newPackName.trim(), newPackIcon);
    setSelectedPackId(id);
    setShowNewPackModal(false);
    setNewPackName('');
    setNewPackIcon('package');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess('');
    try {
      const imported = await importPack(file);
      setImportSuccess(`Imported "${imported.name}" with ${getPackWords(imported).length} words!`);
      setSelectedPackId(imported.id);
      setActiveTab('custom');
      setTimeout(() => setImportSuccess(''), 4000);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  };

  const handlePublish = async (packId) => {
    setPublishStatus((s) => ({ ...s, [packId]: { state: 'loading' } }));
    const result = await publishPackToCloud(packId);
    if (result.success) {
      setPublishStatus((s) => ({ ...s, [packId]: { state: 'success', message: 'Published to Cloud!' } }));
      setTimeout(() => setPublishStatus((s) => ({ ...s, [packId]: null })), 3000);
    } else {
      setPublishStatus((s) => ({ ...s, [packId]: { state: 'error', message: result.error } }));
      setTimeout(() => setPublishStatus((s) => ({ ...s, [packId]: null })), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4 font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
          title={t('nav.back')}
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </button>
        <div className="flex-1 text-start">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen size={18} className="text-red-500" />
            <span>{t('packs.editorTitle')}</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono">{t('packs.editorSubtitle')}</p>
        </div>
        <LanguageToggle variant="chip" />
        <CloudStatusBadge status={cloudStatus} />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={Upload}>
          {t('packs.import')}
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* Feedback messages */}
      <AnimatePresence>
        {importSuccess && (
          <motion.div
            className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-3.5 py-2.5 text-emerald-400 text-xs font-medium flex items-center gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={14} />
            <span>{importSuccess}</span>
          </motion.div>
        )}
        {importError && (
          <motion.div
            className="bg-red-950/30 border border-red-800/40 rounded-xl px-3.5 py-2.5 text-red-400 text-xs font-medium flex items-center gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={14} />
            <span>{importError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 gap-1 font-mono">
        {[
          { id: 'custom', label: `${t('packs.customTab')} (${customPacks.length})` },
          { id: 'cloud', label: `${t('packs.cloudTab')} (${cloudPacks.length})` },
          { id: 'builtin', label: `${t('packs.builtinTab')} (${DEFAULT_PACKS.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setSelectedPackId(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-red-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Packs tab */}
      {activeTab === 'custom' && (
        <div className="space-y-3">
          {customPacks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-1.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <FolderOpen size={32} className="mx-auto text-zinc-600" />
              <p className="font-semibold text-xs text-zinc-400">
                {isRTL ? 'لا توجد حزم مخصصة بعد' : 'No custom packs yet'}
              </p>
              <p className="text-[11px] font-mono">
                {isRTL ? 'أنشئ أول حزمة أو استورد واحدة بصيغة JSON.' : 'Create your first pack or import one from JSON.'}
              </p>
            </div>
          ) : (
            customPacks.map((pack) => {
              const ps = publishStatus[pack.id];
              const isSelected = selectedPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-red-600/70 bg-red-950/20'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750'
                  }`}
                  onClick={() => setSelectedPackId(isSelected ? null : pack.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{pack.name}</p>
                      <p className="text-zinc-500 font-mono text-[10px]">
                        {getPackWords(pack).length} {isRTL ? 'كلمة' : 'words'}
                      </p>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePublish(pack.id); }}
                        disabled={ps?.state === 'loading'}
                        title={isRTL ? 'نشر للسحابة' : 'Publish to Cloud'}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                          ps?.state === 'success'
                            ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30'
                            : ps?.state === 'error'
                            ? 'text-red-400 border-red-800 bg-red-950/30'
                            : 'text-zinc-300 border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                        } ${ps?.state === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {ps?.state === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); exportPack(pack.id); }}
                        className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors"
                        title={isRTL ? 'تصدير' : 'Export'}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(isRTL ? `هل تريد حذف "${pack.name}"؟` : `Delete "${pack.name}"?`)) {
                            deletePack(pack.id);
                            if (selectedPackId === pack.id) setSelectedPackId(null);
                          }
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors"
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {ps?.message && (
                    <p className={`text-[11px] mt-1.5 font-mono ${ps.state === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ps.message}
                    </p>
                  )}
                </div>
              );
            })
          )}

          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => setShowNewPackModal(true)}
            icon={Plus}
          >
            {t('packs.newPack') || (isRTL ? 'إنشاء حزمة كلمات جديدة' : 'Create New Cipher Pack')}
          </Button>
        </div>
      )}

      {/* Cloud Packs tab */}
      {activeTab === 'cloud' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <p className="text-zinc-500">Global community packs</p>
            <button
              type="button"
              onClick={() => syncCloudPacks()}
              disabled={cloudStatus === 'loading'}
              className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          {cloudStatus === 'loading' && cloudPacks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-1.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <Cloud size={32} className="mx-auto text-zinc-600 animate-pulse" />
              <p className="font-semibold text-xs text-zinc-400">Loading cloud packs...</p>
            </div>
          ) : cloudPacks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-1.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <Cloud size={32} className="mx-auto text-zinc-600" />
              <p className="font-semibold text-xs text-zinc-400">No cloud packs found</p>
            </div>
          ) : (
            cloudPacks.map((pack) => (
              <div
                key={pack.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selectedPackId === pack.id
                    ? 'border-red-600/70 bg-red-950/20'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750'
                }`}
                onClick={() => setSelectedPackId(selectedPackId === pack.id ? null : pack.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pack.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{pack.name}</p>
                    <p className="text-zinc-500 font-mono text-[10px]">{getPackWords(pack).length} words · Cloud</p>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                    Global
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCloudTarget({ supabaseId: pack.supabaseId, packName: pack.name });
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    title="Delete Cloud Pack (Admin)"
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Built-in tab */}
      {activeTab === 'builtin' && (
        <div className="space-y-3">
          {DEFAULT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                selectedPackId === pack.id
                  ? 'border-red-600/70 bg-red-950/20'
                  : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
              }`}
              onClick={() => setSelectedPackId(selectedPackId === pack.id ? null : pack.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pack.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{pack.name}</p>
                  <p className="text-zinc-500 font-mono text-[10px]">
                    {getPackWords(pack).length} words · Read-only
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                  Built-in
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pack word editor (custom tab only) */}
      <AnimatePresence>
        {selectedPack && activeTab === 'custom' && (
          <motion.div
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3.5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span>{selectedPack.icon}</span>
                  <span>{selectedPack.name}</span>
                </h3>
                <p className="text-zinc-500 text-[10px] font-mono">
                  {getPackWords(selectedPack).length} words in this set
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => exportPack(selectedPack.id)} icon={Download}>
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePublish(selectedPack.id)}
                  disabled={publishStatus[selectedPack.id]?.state === 'loading'}
                  icon={UploadCloud}
                >
                  Publish
                </Button>
              </div>
            </div>

            {/* Words tag list */}
            <div className="space-y-2.5">
              {getPackWords(selectedPack).length === 0 ? (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-zinc-500 text-xs">No words in this pack yet.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl max-h-56 overflow-y-auto">
                  {getPackWords(selectedPack).map((word, idx) => (
                    <WordTag
                      key={`${word}-${idx}`}
                      word={word}
                      onDelete={() => deleteWord(selectedPack.id, word)}
                    />
                  ))}
                </div>
              )}

              <AddWordForm onAdd={(newWord) => addWord(selectedPack.id, newWord)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Pack Modal */}
      <Modal isOpen={showNewPackModal} onClose={() => setShowNewPackModal(false)} title={isRTL ? 'إنشاء حزمة كلمات' : 'Create Cipher Pack'}>
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-xs uppercase font-mono block mb-1.5">{isRTL ? 'اسم الحزمة' : 'Pack Name'}</label>
            <input
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
              placeholder={isRTL ? 'مثال: نسخة المكتب' : 'e.g. Office Edition'}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-xs
                         placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="text-zinc-400 text-xs uppercase font-mono block mb-1.5">{isRTL ? 'الأيقونة' : 'Icon'}</label>
            <IconPicker value={newPackIcon} onChange={setNewPackIcon} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleCreatePack} disabled={!newPackName.trim()} fullWidth>
              {isRTL ? 'إنشاء الحزمة' : 'Create Pack'}
            </Button>
            <Button variant="ghost" onClick={() => setShowNewPackModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Cloud Pack Password Modal */}
      <Modal
        isOpen={Boolean(deleteCloudTarget)}
        onClose={() => {
          if (!isDeletingCloud) {
            setDeleteCloudTarget(null);
            setDeletePassword('');
            setDeleteError('');
          }
        }}
        title="Delete Cloud Pack"
      >
        <div className="space-y-3.5">
          <p className="text-zinc-400 text-xs">
            Deleting <span className="font-bold text-white">"{deleteCloudTarget?.packName}"</span> from the global cloud database.
          </p>
          <div>
            <label className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Admin Passkey</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteCloudPack()}
              placeholder="Enter admin password..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white
                         placeholder-zinc-600 focus:outline-none focus:border-red-600 text-xs"
              autoFocus
            />
          </div>

          {deleteError && (
            <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>{deleteError}</span>
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="danger"
              onClick={handleDeleteCloudPack}
              disabled={!deletePassword.trim() || isDeletingCloud}
              fullWidth
            >
              {isDeletingCloud ? 'Deleting...' : 'Delete Pack'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteCloudTarget(null);
                setDeletePassword('');
                setDeleteError('');
              }}
              disabled={isDeletingCloud}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Footer className="mt-4" />
    </div>
  );
}
