/**
 * PackEditor.jsx — Full CRUD UI for custom word packs.
 * Create, edit, delete packs and word pairs.
 * Export packs as JSON, import JSON files from friends.
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

// ─── Pair row ─────────────────────────────────────────────────────────────────
function PairRow({ pair, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ ...pair });

  const handleSave = () => {
    if (!local.wordA.trim() || !local.wordB.trim()) return;
    onUpdate(pair.id, local);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
    >
      {!editing ? (
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="text-sm font-bold text-blue-300 flex-1 truncate">{pair.wordA}</span>
          <span className="text-white/30 text-xs">vs</span>
          <span className="text-sm font-bold text-red-300 flex-1 truncate">{pair.wordB}</span>
          <span className="text-white/30 text-xs mx-1">·</span>
          <span className="text-white/40 text-xs truncate max-w-[70px]">{pair.category}</span>
          <button
            onClick={() => setEditing(true)}
            className="ml-2 text-white/30 hover:text-white transition-colors text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(pair.id)}
            className="text-white/30 hover:text-red-400 transition-colors text-sm"
          >
            🗑️
          </button>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={local.wordA}
              onChange={(e) => setLocal({ ...local, wordA: e.target.value })}
              placeholder="Civilian word"
              className="bg-blue-900/30 border border-blue-500/40 rounded-lg px-3 py-1.5 text-blue-300
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              value={local.wordB}
              onChange={(e) => setLocal({ ...local, wordB: e.target.value })}
              placeholder="Impostor word"
              className="bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-1.5 text-red-300
                         text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>
          <input
            value={local.category}
            onChange={(e) => setLocal({ ...local, category: e.target.value })}
            placeholder="Category (e.g. Hot Drinks)"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white
                       text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40
                         text-emerald-400 text-sm font-bold hover:bg-emerald-600/50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setLocal({ ...pair }); }}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20
                         text-white/60 text-sm hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── New pair form ────────────────────────────────────────────────────────────
function AddPairForm({ onAdd }) {
  const [wordA, setWordA] = useState('');
  const [wordB, setWordB] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!wordA.trim() || !wordB.trim()) return;
    onAdd(wordA.trim(), wordB.trim(), category.trim() || 'Custom');
    setWordA(''); setWordB(''); setCategory('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl border border-dashed border-violet-500/40
                   text-violet-400 text-sm font-bold hover:bg-violet-600/10 transition-colors"
      >
        + Add Word Pair
      </button>
    );
  }

  return (
    <motion.div
      className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
    >
      <p className="text-violet-300 text-sm font-bold">New Word Pair</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-blue-400/60 text-xs mb-1 block">Civilian Word (A)</label>
          <input
            value={wordA}
            onChange={(e) => setWordA(e.target.value)}
            placeholder="e.g. Coffee"
            className="w-full bg-blue-900/30 border border-blue-500/40 rounded-lg px-3 py-2 text-blue-300
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="text-red-400/60 text-xs mb-1 block">Impostor Word (B)</label>
          <input
            value={wordB}
            onChange={(e) => setWordB(e.target.value)}
            placeholder="e.g. Tea"
            className="w-full bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2 text-red-300
                       text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>
      </div>
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (e.g. Hot Drinks)"
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white
                   text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      />
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleAdd} disabled={!wordA.trim() || !wordB.trim()}>
          Add Pair
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PackEditor() {
  const navigate = useNavigate();
  const { customPacks, addPack, updatePack, deletePack, addPair, updatePair, deletePair, exportPack, importPack } = usePackStore();
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [showNewPackModal, setShowNewPackModal] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackIcon, setNewPackIcon] = useState('📦');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'builtin'
  const fileInputRef = useRef(null);

  const selectedPack = customPacks.find((p) => p.id === selectedPackId);

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
      setImportSuccess(`Imported "${imported.name}" with ${imported.pairs.length} pairs!`);
      setSelectedPackId(imported.id);
      setActiveTab('custom');
      setTimeout(() => setImportSuccess(''), 4000);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
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

      {/* Pack list */}
      {activeTab === 'custom' && (
        <div className="space-y-3">
          {customPacks.length === 0 ? (
            <div className="text-center py-12 text-white/30 space-y-2">
              <div className="text-5xl">📭</div>
              <p className="font-bold">No custom packs yet</p>
              <p className="text-xs">Create your first pack or import one!</p>
            </div>
          ) : (
            customPacks.map((pack) => (
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
                    <p className="text-white/40 text-xs">{pack.pairs.length} word pairs</p>
                  </div>
                  <div className="flex gap-2">
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
              </Card>
            ))
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
                  <p className="text-white/40 text-xs">{pack.pairs.length} pairs · Read-only</p>
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
                    {pack.pairs.map((pair) => (
                      <div key={pair.id} className="flex items-center gap-2 text-sm px-2 py-1.5 bg-white/5 rounded-lg">
                        <span className="text-blue-300 font-bold flex-1">{pair.wordA}</span>
                        <span className="text-white/30 text-xs">vs</span>
                        <span className="text-red-300 font-bold flex-1">{pair.wordB}</span>
                        <span className="text-white/30 text-xs">{pair.category}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {/* Pack editor — shown when a custom pack is selected */}
      <AnimatePresence>
        {selectedPack && activeTab === 'custom' && (
          <motion.div
            className="bg-white/5 border border-violet-500/30 rounded-2xl p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                {selectedPack.icon} {selectedPack.name}
              </h3>
              <Button variant="secondary" size="sm" onClick={() => exportPack(selectedPack.id)} icon="⬇️">
                Export
              </Button>
            </div>

            {/* Pairs */}
            <div className="space-y-2">
              {selectedPack.pairs.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No pairs yet. Add some below!</p>
              ) : (
                selectedPack.pairs.map((pair) => (
                  <PairRow
                    key={pair.id}
                    pair={pair}
                    onUpdate={(pairId, updates) => updatePair(selectedPack.id, pairId, updates)}
                    onDelete={(pairId) => deletePair(selectedPack.id, pairId)}
                  />
                ))
              )}
            </div>

            <AddPairForm onAdd={(a, b, cat) => addPair(selectedPack.id, a, b, cat)} />
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
    </div>
  );
}
