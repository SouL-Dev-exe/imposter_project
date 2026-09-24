/**
 * PackEditor.jsx — Full CRUD UI for custom word packs.
 * Create, edit, delete packs and word pairs.
 * Export packs as JSON, import JSON files from friends.
 * Publish to Supabase cloud so all players see them globally.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { usePackStore } from '../store/packStore';
import { DEFAULT_PACKS } from '../data/defaultPacks';

// ─── Pack icon picker ─────────────────────────────────────────────────────────
const ICONS = ['📦', '🎮', '🌟', '🔥', '🎯', '🧩', '🎪', '🦄', '🍀', '🎭', '🚀', '💎'];

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICONS.map((icon) => (
        <button
          key={icon}
          onClick={() => onChange(icon)}
          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
            ${value === icon
              ? 'bg-violet-600 scale-110 shadow-lg shadow-violet-900/50'
              : 'bg-white/10 hover:bg-white/20'
            }
          `}
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
      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 transition-colors select-none group"
    >
      <span>{word}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(word);
          }}
          className="text-white/40 hover:text-red-400 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-xs transition-colors ml-0.5"
          title="Remove word"
        >
          ×
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
        className="w-full py-3 rounded-xl border border-dashed border-violet-500/40
                   text-violet-400 text-sm font-bold hover:bg-violet-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>+</span> Add Word
      </button>
    );
  }

  return (
    <motion.div
      className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-violet-300 text-sm font-bold">New Word</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-white/40 hover:text-white text-xs cursor-pointer"
        >
          Close
        </button>
      </div>
      <div>
        <label className="text-white/60 text-xs mb-1 block">Word</label>
        <input
          ref={inputRef}
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. قهوة / Coffee"
          autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white
                     text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 placeholder-white/30"
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
    loading: { text: 'Syncing…', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    synced:  { text: '☁️ Cloud Synced', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    offline: { text: '📴 Offline Mode', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    error:   { text: '⚠️ Sync Error', cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
    idle:    { text: '', cls: '' },
  }[status] || { text: '', cls: '' };

  if (!cfg.text) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.text}</span>
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
      return pack.pairs.flatMap((p) => [p.wordA, p.wordB]).filter(Boolean);
    }
    return [];
  };

  const [selectedPackId, setSelectedPackId] = useState(null);
  const [showNewPackModal, setShowNewPackModal] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackIcon, setNewPackIcon] = useState('📦');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [publishStatus, setPublishStatus] = useState({}); // { [packId]: 'loading'|'success'|'error', message }
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'cloud' | 'builtin'

  // Delete cloud pack state
  const [deleteCloudTarget, setDeleteCloudTarget] = useState(null); // { supabaseId, packName }
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
    setNewPackIcon('📦');
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
      setPublishStatus((s) => ({ ...s, [packId]: { state: 'success', message: '☁️ Published!' } }));
      setTimeout(() => setPublishStatus((s) => ({ ...s, [packId]: null })), 3000);
    } else {
      setPublishStatus((s) => ({ ...s, [packId]: { state: 'error', message: result.error } }));
      setTimeout(() => setPublishStatus((s) => ({ ...s, [packId]: null })), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-2xl">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">📦 Word Packs</h1>
          <p className="text-white/40 text-xs">Create & manage your custom word sets</p>
        </div>
        {/* Cloud status */}
        <CloudStatusBadge status={cloudStatus} />
        {/* Import button */}
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon="⬆️">
          Import
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* Feedback messages */}
      <AnimatePresence>
        {importSuccess && (
          <motion.div
            className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✅ {importSuccess}
          </motion.div>
        )}
        {importError && (
          <motion.div
            className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ❌ {importError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        {[
          { id: 'custom', label: `My Packs (${customPacks.length})` },
          { id: 'cloud', label: `☁️ Cloud (${cloudPacks.length})` },
          { id: 'builtin', label: `Built-in (${DEFAULT_PACKS.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedPackId(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── My Packs tab ── */}
      {activeTab === 'custom' && (
        <div className="space-y-3">
          {customPacks.length === 0 ? (
            <div className="text-center py-12 text-white/30 space-y-2">
              <div className="text-5xl">📭</div>
              <p className="font-bold">No custom packs yet</p>
              <p className="text-xs">Create your first pack or import one!</p>
            </div>
          ) : (
            customPacks.map((pack) => {
              const ps = publishStatus[pack.id];
              return (
                <Card
                  key={pack.id}
                  className={`p-4 cursor-pointer transition-all
                    ${selectedPackId === pack.id ? 'border-violet-500 bg-violet-600/10' : ''}
                  `}
                  onClick={() => setSelectedPackId(selectedPackId === pack.id ? null : pack.id)}
                  animate={false}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold">{pack.name}</p>
                      <p className="text-white/40 text-xs">{getPackWords(pack).length} words</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* Publish to cloud */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePublish(pack.id); }}
                        disabled={ps?.state === 'loading'}
                        title="Publish to Cloud"
                        className={`text-sm transition-all px-2 py-0.5 rounded-lg border
                          ${ps?.state === 'success'
                            ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                            : ps?.state === 'error'
                            ? 'text-red-400 border-red-500/40 bg-red-500/10'
                            : 'text-blue-400 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20'
                          }
                          ${ps?.state === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {ps?.state === 'loading' ? '⏳' : ps?.state === 'success' ? '✅' : ps?.state === 'error' ? '❌' : '☁️'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); exportPack(pack.id); }}
                        className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
                        title="Export"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${pack.name}"?`)) { deletePack(pack.id); if (selectedPackId === pack.id) setSelectedPackId(null); } }}
                        className="text-white/30 hover:text-red-400 transition-colors text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {/* Publish feedback inline */}
                  {ps?.message && (
                    <p className={`text-xs mt-1.5 font-medium ${ps.state === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ps.message}
                    </p>
                  )}
                </Card>
              );
            })
          )}

          {/* Create new pack */}
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => setShowNewPackModal(true)}
            icon="+"
          >
            Create New Pack
          </Button>
        </div>
      )}

      {/* ── Cloud Packs tab ── */}
      {activeTab === 'cloud' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">Global packs created by all players</p>
            <button
              onClick={() => syncCloudPacks()}
              disabled={cloudStatus === 'loading'}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {cloudStatus === 'loading' ? '⏳ Syncing…' : '🔄 Refresh'}
            </button>
          </div>

          {cloudStatus === 'loading' && cloudPacks.length === 0 ? (
            <div className="text-center py-12 text-white/30 space-y-2">
              <div className="text-5xl animate-pulse">☁️</div>
              <p className="font-bold">Loading cloud packs…</p>
            </div>
          ) : cloudPacks.length === 0 ? (
            <div className="text-center py-12 text-white/30 space-y-2">
              <div className="text-5xl">☁️</div>
              <p className="font-bold">No cloud packs yet</p>
              <p className="text-xs">
                {cloudStatus === 'offline'
                  ? 'No internet connection. Showing cached data.'
                  : 'Publish your own packs to see them here!'}
              </p>
            </div>
          ) : (
            cloudPacks.map((pack) => (
              <Card
                key={pack.id}
                className={`p-4 cursor-pointer ${selectedPackId === pack.id ? 'border-blue-500 bg-blue-600/10' : ''}`}
                onClick={() => setSelectedPackId(selectedPackId === pack.id ? null : pack.id)}
                animate={false}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{pack.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold">{pack.name}</p>
                    <p className="text-white/40 text-xs">{getPackWords(pack).length} words · Cloud</p>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">☁️ Global</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCloudTarget({ supabaseId: pack.supabaseId, packName: pack.name });
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    title="Delete Cloud Pack (Admin)"
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>
                <AnimatePresence>
                  {selectedPackId === pack.id && (
                    <motion.div
                      className="mt-3 space-y-1.5"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                        {getPackWords(pack).map((w, idx) => (
                          <span
                            key={idx}
                            className="bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-lg border border-white/5"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Built-in tab ── */}
      {activeTab === 'builtin' && (
        <div className="space-y-3">
          {DEFAULT_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`p-4 cursor-pointer ${selectedPackId === pack.id ? 'border-violet-500 bg-violet-600/10' : ''}`}
              onClick={() => setSelectedPackId(selectedPackId === pack.id ? null : pack.id)}
              animate={false}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{pack.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-bold">{pack.name}</p>
                  <p className="text-white/40 text-xs">
                    {getPackWords(pack).length} words · Read-only
                  </p>
                </div>
                <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">Built-in</span>
              </div>
              <AnimatePresence>
                {selectedPackId === pack.id && (
                  <motion.div
                    className="mt-3 space-y-1.5"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                      {getPackWords(pack).map((w, idx) => (
                        <span
                          key={idx}
                          className="bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-lg border border-white/5"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pack word editor (custom tab only) ── */}
      <AnimatePresence>
        {selectedPack && activeTab === 'custom' && (
          <motion.div
            className="bg-white/5 border border-violet-500/30 rounded-2xl p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {selectedPack.icon} {selectedPack.name}
                </h3>
                <p className="text-white/40 text-xs">
                  {getPackWords(selectedPack).length} words in this pack
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => exportPack(selectedPack.id)} icon="⬇️">
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePublish(selectedPack.id)}
                  disabled={publishStatus[selectedPack.id]?.state === 'loading'}
                  icon="☁️"
                >
                  Publish
                </Button>
              </div>
            </div>

            {/* Words tag list */}
            <div className="space-y-3">
              {getPackWords(selectedPack).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-white/40 text-sm">No words yet in this pack.</p>
                  <p className="text-white/20 text-xs mt-1">Add words using the button below</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-black/20 border border-white/10 rounded-xl min-h-[60px] max-h-64 overflow-y-auto">
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
      <Modal isOpen={showNewPackModal} onClose={() => setShowNewPackModal(false)} title="Create New Pack">
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Pack Name</label>
            <input
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
              placeholder="e.g. Office Edition"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                         placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              autoFocus
            />
          </div>
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Icon</label>
            <IconPicker value={newPackIcon} onChange={setNewPackIcon} />
          </div>
          <div className="flex gap-3 pt-2">
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
        title="🔒 Delete Cloud Pack"
      >
        <div className="space-y-4">
          <p className="text-white/70 text-sm">
            You are deleting <span className="font-bold text-white">"{deleteCloudTarget?.packName}"</span> from the global cloud database.
          </p>
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Admin Password Required</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteCloudPack()}
              placeholder="Enter admin password..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                         placeholder-white/30 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-sm"
              autoFocus
            />
          </div>

          {deleteError && (
            <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
              ⚠️ {deleteError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleDeleteCloudPack}
              disabled={!deletePassword.trim() || isDeletingCloud}
              className="!bg-red-600 hover:!bg-red-700"
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
    </div>
  );
}
