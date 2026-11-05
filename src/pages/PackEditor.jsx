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
  Target,
  Zap,
  Shield,
  Eye,
  Flame,
  Dices,
  Globe,
  Puzzle,
  Sparkles,
  Cpu,
  Crosshair,
  Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { usePackStore } from '../store/packStore';
import { DEFAULT_PACKS } from '../data/defaultPacks';
import Footer from '../components/Footer';

// ─── Pack icon picker ─────────────────────────────────────────────────────────
const PACK_ICONS = [
  { id: 'package', icon: Package },
  { id: 'target', icon: Target },
  { id: 'zap', icon: Zap },
  { id: 'shield', icon: Shield },
  { id: 'eye', icon: Eye },
  { id: 'flame', icon: Flame },
  { id: 'dices', icon: Dices },
  { id: 'globe', icon: Globe },
  { id: 'puzzle', icon: Puzzle },
  { id: 'sparkles', icon: Sparkles },
  { id: 'cpu', icon: Cpu },
  { id: 'crosshair', icon: Crosshair },
];

function PackInsignia({ icon, className = 'w-5 h-5 text-red-500' }) {
  const emojiMap = {
    '\uD83D\uDCE6': Package,
    '\uD83C\uDFAF': Target,
    '\u26A1': Zap,
    '\uD83D\uDEE1\uFE0F': Shield,
    '\uD83D\uDC41\uFE0F': Eye,
    '\uD83D\uDD25': Flame,
    '\uD83C\uDFB2': Dices,
    '\uD83C\uDF10': Globe,
    '\uD83E\uDDE9': Puzzle,
    '\uD83D\uDE80': Sparkles,
    '\uD83D\uDC8E': Sparkles,
    '\uD83C\uDFAD': Eye,
  };

  const matched = PACK_ICONS.find((item) => item.id === icon);
  const IconComp = matched?.icon || emojiMap[icon] || Package;

  return (
    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
      <IconComp className={className} />
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PACK_ICONS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
            value === id
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Icon className="w-4 h-4" />
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
        <Plus size={14} /> Add Word
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
        <p className="text-white text-xs font-bold">New Word Entry</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-zinc-500 hover:text-white text-xs cursor-pointer"
        >
          Close
        </button>
      </div>
      <div>
        <input
          ref={inputRef}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. قهوة / Coffee"
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white
                     text-xs focus:outline-none focus:border-red-600 placeholder-zinc-600 transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleAdd} disabled={!word.trim()} size="sm">
          Add Word
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
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
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen size={18} className="text-red-500" />
            <span>Word Cipher Packs</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono">Create &amp; manage custom word sets</p>
        </div>
        <CloudStatusBadge status={cloudStatus} />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={Upload}>
          Import
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
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 gap-1">
        {[
          { id: 'custom', label: `Custom (${customPacks.length})` },
          { id: 'cloud', label: `Cloud (${cloudPacks.length})` },
          { id: 'builtin', label: `Built-in (${DEFAULT_PACKS.length})` },
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
              <p className="font-semibold text-xs text-zinc-400">No custom packs yet</p>
              <p className="text-[11px] font-mono">Create your first pack or import one from JSON.</p>
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
                    <PackInsignia icon={pack.icon} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{pack.name}</p>
                      <p className="text-zinc-500 font-mono text-[10px]">{getPackWords(pack).length} words</p>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePublish(pack.id); }}
                        disabled={ps?.state === 'loading'}
                        title="Publish to Cloud"
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
                        title="Export"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${pack.name}"?`)) {
                            deletePack(pack.id);
                            if (selectedPackId === pack.id) setSelectedPackId(null);
                          }
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors"
                        title="Delete"
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
            Create New Cipher Pack
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
                  <PackInsignia icon={pack.icon} />
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
                <PackInsignia icon={pack.icon} />
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
              <div className="flex items-center gap-3">
                <PackInsignia icon={selectedPack.icon} />
                <div>
                  <h3 className="text-white font-bold text-sm">
                    {selectedPack.name}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-mono">
                    {getPackWords(selectedPack).length} words in this set
                  </p>
                </div>
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
      <Modal isOpen={showNewPackModal} onClose={() => setShowNewPackModal(false)} title="Create Cipher Pack">
        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 text-xs uppercase font-mono block mb-1.5">Pack Name</label>
            <input
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
              placeholder="e.g. Office Edition"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-xs
                         placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="text-zinc-400 text-xs uppercase font-mono block mb-1.5">Icon</label>
            <IconPicker value={newPackIcon} onChange={setNewPackIcon} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleCreatePack} disabled={!newPackName.trim()} fullWidth>
              Create Pack
            </Button>
            <Button variant="ghost" onClick={() => setShowNewPackModal(false)}>Cancel</Button>
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
