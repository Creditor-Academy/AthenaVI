import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Image as ImageIcon, Download, Copy, Check, MessageSquare, Trash2, X, BarChart3, Share2, Printer, Plus, Search, LayoutGrid, List, Heart, ChevronDown, SlidersHorizontal, MoreHorizontal, RotateCcw } from 'lucide-react';
import imageGenService from '../../../services/imageGenService.js';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.jsx';

const START_CHAT_MODES = [
  { id: 'image', label: 'Image', Icon: ImageIcon },
  { id: 'infographic', label: 'Infographic', Icon: BarChart3 },
  { id: 'social', label: 'Social', Icon: Share2 },
  { id: 'printable', label: 'Print', Icon: Printer },
];

const LIBRARY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'infographic', label: 'Infographics' },
  { id: 'social', label: 'Social' },
  { id: 'printable', label: 'Print' },
];

export default function WorkspaceImageLibrary({ workspaceId, onImageClick, onStartChat, hideTitle = false }) {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloadingSelection, setDownloadingSelection] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [category, setCategory] = useState('all');
  const [libraryView, setLibraryView] = useState('library');
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('grid');
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [manageMenuOpen, setManageMenuOpen] = useState(false);
  const [trashMenuId, setTrashMenuId] = useState(null);
  const [confirmPurge, setConfirmPurge] = useState(false);

  const handleDownload = async (event, gen, idx) => {
    event.stopPropagation();
    const key = gen.id || idx;
    if (downloadingId === key) return;
    setDownloadingId(key);
    try {
      if (workspaceId && gen.id) {
        await imageGenService.downloadAndSave(workspaceId, gen.id, 'png');
        return;
      }
      const response = await fetch(gen.url || gen.resultUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `generation_${gen.id || idx}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Library download failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const selected = generations.filter((gen, idx) => selectedIds.includes(gen.id || idx));

  const toggleSelected = (key) => {
    setConfirmDelete(false);
    setSelectedIds((prev) => (prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]));
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setModeMenuOpen(false);
    setConfirmDelete(false);
  };

  const downloadSelected = async () => {
    if (downloadingSelection || !selected.length) return;
    setDownloadingSelection(true);
    const withIds = selected.filter((gen) => gen.id);
    const queue = (workspaceId && withIds.length ? withIds : selected).map((gen, i) => ({
      id: gen.id || i,
      src: gen.url || gen.resultUrl,
      status: 'waiting',
    }));
    if (queue.length > 1) setDownloadProgress(queue);
    const mark = (index, status) => {
      setDownloadProgress((rows) => (Array.isArray(rows) ? rows.map((row, i) => (i === index ? { ...row, status } : row)) : rows));
    };
    try {
      if (workspaceId && withIds.length) {
        for (let i = 0; i < withIds.length; i += 1) {
          if (withIds.length > 1) mark(i, 'downloading');
          const { blob, filename } = await imageGenService.download(workspaceId, withIds[i].id, 'png');
          const safeName = /\.png$/i.test(filename) ? filename : `athena-image-${i + 1}.png`;
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = safeName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
          if (withIds.length > 1) mark(i, 'done');
          if (i < withIds.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }
        setDownloadProgress(null);
        setDownloadNotice('Downloaded');
        setTimeout(() => setDownloadNotice(''), 2500);
        return;
      }
      for (let i = 0; i < selected.length; i += 1) {
        const gen = selected[i];
        if (selected.length > 1) mark(i, 'downloading');
        const response = await fetch(gen.url || gen.resultUrl);
        if (!response.ok) continue;
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `generation_${gen.id || i}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
        if (selected.length > 1) mark(i, 'done');
      }
      setDownloadProgress(null);
      setDownloadNotice('Downloaded');
      setTimeout(() => setDownloadNotice(''), 2500);
    } catch (err) {
      console.error('Library bulk download failed:', err);
    } finally {
      setDownloadingSelection(false);
      setDownloadProgress(null);
    }
  };

  const startChat = (mode) => {
    const images = selected
      .map((gen) => ({
        name: gen.prompt || 'Library image',
        src: gen.url || gen.resultUrl,
        assetId: gen.assetId || null,
      }))
      .filter((img) => img.src);
    setModeMenuOpen(false);
    clearSelection();
    onStartChat?.({ mode, images });
  };

  const deleteSelectedLocally = async () => {
    const drop = new Set(selectedIds);
    const ids = selected.map((gen) => gen.id).filter(Boolean);
    if (workspaceId && ids.length) {
      try {
        await imageGenService.hideGenerations(workspaceId, ids);
      } catch (err) {
        console.error('Library hide failed:', err);
        return;
      }
    }
    setGenerations((rows) => rows.filter((gen, idx) => !drop.has(gen.id || idx)));
    clearSelection();
  };

  const selectedTrashIds = () => selected.map((gen) => gen.id).filter(Boolean);

  const restoreSelected = async (ids) => {
    const unique = [...new Set((ids || selectedTrashIds()).filter(Boolean))];
    if (!workspaceId || !unique.length) return;
    try {
      await imageGenService.restoreGenerations(workspaceId, unique);
    } catch (err) {
      console.error('Library restore failed:', err);
      return;
    }
    const drop = new Set(unique);
    setGenerations((rows) => rows.filter((gen) => !drop.has(gen.id)));
    setTrashMenuId(null);
    clearSelection();
  };

  const purgeSelected = async (ids) => {
    const unique = [...new Set((ids || selectedTrashIds()).filter(Boolean))];
    if (!workspaceId || !unique.length) return;
    try {
      await imageGenService.purgeGenerations(workspaceId, unique);
    } catch (err) {
      console.error('Library purge failed:', err);
      return;
    }
    const drop = new Set(unique);
    setGenerations((rows) => rows.filter((gen) => !drop.has(gen.id)));
    setTrashMenuId(null);
    setConfirmPurge(false);
    clearSelection();
  };

  useEffect(() => {
    if (!newMenuOpen && !modeMenuOpen && !manageMenuOpen && !trashMenuId) return undefined;
    const close = (event) => {
      if (event.target.closest('.library-new-wrap') || event.target.closest('.library-start-wrap') || event.target.closest('.library-manage-wrap') || event.target.closest('.library-trash-menu')) return;
      setNewMenuOpen(false);
      setModeMenuOpen(false);
      setManageMenuOpen(false);
      setTrashMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [newMenuOpen, modeMenuOpen, manageMenuOpen, trashMenuId]);

  useEffect(() => {
    if (!workspaceId) {
      setError("No workspace context provided.");
      setLoading(false);
      return;
    }

    const fetchGenerations = async () => {
      try {
        setLoading(true);
        const results = await imageGenService.listGenerations(workspaceId, {
          take: 100,
          trashed: libraryView === 'trash',
        });
        setGenerations(results || []);
      } catch (err) {
        console.error("Failed to load generations:", err);
        setError("Failed to load workspace images.");
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [workspaceId, libraryView === 'trash']);

  const filteredGenerations = generations.filter((gen) => {
    if (libraryView === 'liked' && gen.feedback !== 'LIKE') return false;
    if (libraryView === 'library' && category !== 'all' && String(gen.mode || 'image').toLowerCase() !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${gen.prompt || ''} ${gen.title || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="workspace-library-container" style={{ padding: '40px 48px', height: '100%', overflowY: 'auto', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .cute-library-card {
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card, #ffffff);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          break-inside: avoid;
          margin-bottom: 28px;
          position: relative;
        }
        .cute-library-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .cute-library-card-img-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: var(--bg-surface, #f3f4f6);
        }
        .cute-library-card-img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s ease;
        }
        .cute-library-card:hover .cute-library-card-img {
          transform: scale(1.05);
        }
        .cute-library-card-info {
        }
        .cute-library-card-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cute-library-card:hover .cute-library-card-actions {
          opacity: 1;
        }
        .library-action-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }
        .library-action-btn:hover {
          transform: scale(1.1);
          background: #fff;
        }
        .cute-library-card.is-selected {
          box-shadow: 0 0 0 2px var(--primary, #2563eb), 0 12px 30px rgba(37, 99, 235, 0.12);
        }
        .library-select-box {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.94);
          color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.16);
          opacity: 0;
          transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
          z-index: 2;
        }
        .cute-library-card:hover .library-select-box,
        .cute-library-card.is-trash .library-select-box,
        .library-select-box.is-on {
          opacity: 1;
        }
        .library-select-box.is-on {
          background: var(--primary, #2563eb);
          border-color: var(--primary, #2563eb);
          color: #fff;
        }
        .library-selection-bar {
          position: fixed;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          max-width: calc(100% - 32px);
          margin: 0;
          padding: 12px 14px 12px 20px;
          border-radius: 999px;
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
        }
        .library-selection-count {
          font-size: 15px;
          font-weight: 700;
          margin-right: 6px;
          white-space: nowrap;
        }
        .library-selection-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: #f3f4f6;
          color: #111827;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 15px;
          font-weight: 650;
          cursor: pointer;
        }
        .library-selection-btn:hover {
          background: color-mix(in srgb, var(--primary, #2563eb) 10%, var(--bg-card, #f3f4f6));
        }
        .library-selection-btn.is-danger {
          background: #dc2626;
          color: #fff;
        }
        .library-selection-btn.is-danger:hover {
          background: #b91c1c;
        }
        .library-selection-icon {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--text-secondary, #64748b);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .library-selection-icon:hover {
          background: var(--bg-card, #f3f4f6);
          color: var(--text-main, #111827);
        }
        .library-mode-pop {
          position: absolute;
          z-index: 30;
          left: 0;
          bottom: calc(100% + 8px);
          min-width: 180px;
          padding: 6px;
          border-radius: 14px;
          background: var(--bg-surface, #fff);
          border: 1px solid var(--border-color, #e5e7eb);
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
        }
        .library-mode-pop button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: var(--text-main, #111827);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }
        .library-mode-pop button:hover {
          background: color-mix(in srgb, var(--primary, #2563eb) 8%, transparent);
        }
        .library-start-wrap {
          position: relative;
        }
        .library-filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 0 0 22px;
          flex-wrap: wrap;
        }
        .library-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 0;
        }
        .library-category {
          border: 1px solid #e6ebf2;
          background: #fff;
          color: #475569;
          font-size: 14px;
          font-weight: 650;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          cursor: pointer;
        }
        .library-category:hover {
          border-color: #cbd5e1;
          color: #111827;
        }
        .library-category.is-on {
          background: var(--primary, #2563eb);
          border-color: var(--primary, #2563eb);
          color: #fff;
          box-shadow: none;
        }
        .library-manage-wrap {
          position: relative;
          z-index: 6;
        }
        .library-manage-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 999px;
          border: 1px solid #e6ebf2;
          background: #fff;
          color: #475569;
          cursor: pointer;
        }
        .library-manage-btn:hover,
        .library-manage-btn.is-on {
          background: #f8fafc;
          color: var(--primary, #2563eb);
          border-color: #dbe4f0;
        }
        .library-manage-menu button.is-on {
          background: #f1f5f9;
          color: var(--primary, #2563eb);
        }
        .library-crumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 4px 0 14px;
          font-size: 18px;
          font-weight: 650;
          color: #0f172a;
        }
        .library-crumb button {
          border: none;
          background: none;
          padding: 0;
          font: inherit;
          color: #64748b;
          cursor: pointer;
        }
        .library-crumb button:hover {
          color: #0f172a;
        }
        .library-crumb span {
          color: #cbd5e1;
          font-weight: 500;
        }
        .library-trash-note {
          margin: 0 0 18px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #f4f7fb;
          color: #475569;
          font-size: 14px;
        }
        .library-days-left {
          position: absolute;
          left: 10px;
          bottom: 10px;
          z-index: 3;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.72);
          color: #fff;
          font-size: 12px;
          font-weight: 650;
        }
        .library-more-wrap {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 3;
        }
        .library-more-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.16);
        }
        .library-trash-pop {
          position: absolute;
          top: 38px;
          right: 0;
          min-width: 190px;
          padding: 6px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e6ebf2;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
          z-index: 5;
        }
        .library-trash-pop button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: none;
          border-radius: 8px;
          padding: 9px 10px;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
        }
        .library-trash-pop button:hover {
          background: #f8fafc;
        }
        .library-trash-pop button.is-danger {
          color: #dc2626;
        }
        .library-head {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .library-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-main, #111827);
        }
        .library-title-mark {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--primary, #2563eb) 10%, transparent);
          color: var(--primary, #2563eb);
        }
        .studio-lib-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          flex: 0 0 auto;
          justify-content: flex-end;
        }
        .library-search {
          width: 280px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #e6ebf2;
          background: #f4f7fb;
          color: #94a3b8;
        }
        .library-search input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text-main, #111827);
          font-size: 14px;
          min-width: 0;
        }
        .library-view-toggle {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          height: 40px;
          padding: 4px;
          border: 1px solid #e6ebf2;
          border-radius: 999px;
          background: #f4f7fb;
        }
        .library-view-toggle button {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .library-view-toggle button.is-on {
          background: #fff;
          color: var(--primary, #2563eb);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }
        .library-new-wrap {
          position: relative;
          z-index: 6;
        }
        .library-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 14px 0 16px;
          border: none;
          border-radius: 999px;
          background: var(--primary, #2563eb);
          color: #fff;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
        }
        .library-new-menu {
          min-width: 220px;
          padding: 8px;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
        }
        .library-new-menu-label {
          padding: 8px 10px 6px;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
        }
        .library-new-menu button {
          gap: 12px;
          padding: 10px 10px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 550;
          color: #1e293b;
        }
        .library-new-menu button svg {
          color: #64748b;
        }
        .library-new-menu button:hover {
          background: #f1f5f9;
        }
        .library-grid.is-list {
          column-count: 1;
          column-width: auto;
        }
        .library-grid.is-list .cute-library-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          padding: 8px 10px;
          border-radius: 14px;
          box-shadow: none;
          border: 1px solid transparent;
        }
        .library-grid.is-list .cute-library-card:hover {
          transform: none;
          border-color: var(--border-color, #e5e7eb);
          box-shadow: none;
          background: color-mix(in srgb, var(--text-main, #111827) 3%, var(--bg-card, #fff));
        }
        .library-grid.is-list .cute-library-card-img-wrapper {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 8px;
        }
        .library-grid.is-list .cute-library-card-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
        }
        .library-grid.is-list .cute-library-card:hover .cute-library-card-img {
          transform: none;
        }
        .library-grid.is-list .cute-library-card-actions,
        .library-grid.is-list .library-select-box {
          display: none;
        }
        .library-list-name {
          flex: 1;
          min-width: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .library-list-check,
        .library-list-actions {
          opacity: 0;
          flex-shrink: 0;
        }
        .library-grid.is-list .cute-library-card:hover .library-list-check,
        .library-grid.is-list .cute-library-card:hover .library-list-actions,
        .library-list-check.is-on,
        .library-grid.is-list .cute-library-card.is-selected .library-list-actions {
          opacity: 1;
        }
        .library-list-check {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1.5px solid var(--border-color, #cbd5e1);
          background: var(--bg-surface, #fff);
          color: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .library-list-check.is-on {
          background: var(--primary, #2563eb);
          border-color: var(--primary, #2563eb);
          color: #fff;
        }
        .library-list-actions {
          display: flex;
          gap: 4px;
        }
        .library-download-toast,
        .library-download-progress {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 40;
          width: 280px;
          margin: 0;
          padding: 16px 18px;
          border-radius: 16px;
          background: var(--bg-surface, #fff);
          color: var(--text-main, #111827);
          border: 1px solid var(--border-color, #e5e7eb);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
          font-size: 15px;
          font-weight: 700;
        }
        .library-download-toast {
          width: fit-content;
          background: #ecfdf3;
          color: #166534;
          border-color: #86efac;
        }
        .library-download-progress span {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          font-weight: 550;
          color: var(--text-secondary, #64748b);
        }
        .library-download-track {
          margin-top: 12px;
          height: 8px;
          border-radius: 999px;
          background: #e8f8ee;
          overflow: hidden;
        }
        .library-download-fill {
          height: 100%;
          border-radius: 999px;
          background: #16a34a;
          transition: width 0.25s ease;
        }
        .library-dl-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }
        .library-dl-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .library-dl-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .library-dl-meta {
          flex: 1;
          min-width: 0;
        }
        .library-dl-meta strong {
          display: block;
          font-size: 13px;
          font-weight: 650;
        }
        .library-dl-meta span {
          margin: 0;
          font-size: 12px;
          font-weight: 500;
        }
        .library-dl-track {
          margin-top: 6px;
          height: 4px;
          border-radius: 999px;
          background: #e8f8ee;
          overflow: hidden;
        }
        .library-dl-track i {
          display: block;
          height: 100%;
          width: 35%;
          border-radius: 999px;
          background: #16a34a;
          animation: library-dl-slide 1s ease-in-out infinite;
        }
        .library-dl-track.is-done i {
          width: 100%;
          animation: none;
        }
        @keyframes library-dl-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
      
      <div className="library-head">
        {!hideTitle && (
          <h2 className="library-title">
            <span className="library-title-mark"><ImageIcon size={18} /></span>
            Workspace Library
          </h2>
        )}
      <div className="studio-lib-controls">
        <label className="library-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search library"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search library"
          />
        </label>
        <div className="library-view-toggle" role="group" aria-label="Library layout">
          <button type="button" className={layout === 'grid' ? 'is-on' : ''} title="Grid" aria-label="Grid" onClick={() => setLayout('grid')}>
            <LayoutGrid size={16} />
          </button>
          <button type="button" className={layout === 'list' ? 'is-on' : ''} title="List" aria-label="List" onClick={() => setLayout('list')}>
            <List size={16} />
          </button>
        </div>
        {libraryView !== 'trash' && <div className="library-new-wrap">
          <button
            type="button"
            className="library-new-btn"
            onClick={() => {
              setManageMenuOpen(false);
              setNewMenuOpen((open) => !open);
            }}
          >
            <Plus size={16} /> New <ChevronDown size={14} />
          </button>
          {newMenuOpen && (
            <div className="library-mode-pop library-new-menu" role="menu" style={{ top: 'calc(100% + 8px)', bottom: 'auto', right: 0, left: 'auto' }}>
              <div className="library-new-menu-label">Create new</div>
              {START_CHAT_MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setNewMenuOpen(false);
                    onStartChat?.({ mode: id, images: [] });
                  }}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>}
        <div className="library-manage-wrap">
          <button
            type="button"
            className={`library-manage-btn${libraryView !== 'library' || manageMenuOpen ? ' is-on' : ''}`}
            aria-label="Manage"
            aria-expanded={manageMenuOpen}
            title="Manage"
            onClick={() => {
              setNewMenuOpen(false);
              setManageMenuOpen((open) => !open);
            }}
          >
            <SlidersHorizontal size={16} />
          </button>
          {manageMenuOpen && (
            <div className="library-mode-pop library-new-menu library-manage-menu" role="menu" style={{ top: 'calc(100% + 8px)', bottom: 'auto', right: 0, left: 'auto' }}>
              <div className="library-new-menu-label">Manage</div>
              <button
                type="button"
                role="menuitem"
                className={libraryView === 'liked' ? 'is-on' : ''}
                onClick={() => {
                  setLibraryView((current) => (current === 'liked' ? 'library' : 'liked'));
                  setManageMenuOpen(false);
                  clearSelection();
                }}
              >
                <Heart size={15} /> Liked images
              </button>
              <button
                type="button"
                role="menuitem"
                className={libraryView === 'trash' ? 'is-on' : ''}
                onClick={() => {
                  setLibraryView((current) => (current === 'trash' ? 'library' : 'trash'));
                  setManageMenuOpen(false);
                  clearSelection();
                }}
              >
                <Trash2 size={15} /> Trash
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {libraryView !== 'library' && (
        <div className="library-crumb">
          <button
            type="button"
            onClick={() => {
              setLibraryView('library');
              clearSelection();
            }}
          >
            Library
          </button>
          <span>›</span>
          {libraryView === 'trash' ? 'Trash' : 'Liked images'}
        </div>
      )}

      {libraryView === 'trash' && (
        <p className="library-trash-note">Restore images you recently deleted. They are deleted forever after 30 days.</p>
      )}

      {libraryView === 'library' && <div className="library-filter-row">
        <div className="library-categories" role="tablist" aria-label="Library categories">
          {LIBRARY_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={category === item.id}
              className={`library-category${category === item.id ? ' is-on' : ''}`}
              onClick={() => {
                setCategory(item.id);
                clearSelection();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px', width: '100%' }}>
          <Loader2 className="spinning" size={28} style={{ color: 'var(--primary, #2563eb)' }} />
        </div>
      ) : error ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px', width: '100%', color: 'var(--text-secondary, #a0a0a0)' }}>
          <div style={{ padding: '16px 24px', background: 'var(--bg-surface, #f9fafb)', borderRadius: '16px', fontSize: '14px' }}>
            {error}
          </div>
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '340px', padding: '40px 0', width: '100%', color: 'var(--text-secondary, #a0a0a0)' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary, #2563eb) 10%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
          }}>
            {libraryView === 'trash' ? (
              <Trash2 size={28} style={{ color: 'var(--primary, #2563eb)' }} />
            ) : libraryView === 'liked' ? (
              <Heart size={28} style={{ color: 'var(--primary, #2563eb)' }} />
            ) : query.trim() ? (
              <Search size={28} style={{ color: 'var(--primary, #2563eb)' }} />
            ) : (
              <Sparkles size={28} style={{ color: 'var(--primary, #2563eb)' }} />
            )}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-main, #111827)', marginBottom: '8px' }}>
            {libraryView === 'trash'
              ? 'Trash is empty'
              : libraryView === 'liked'
              ? 'No liked images yet'
              : query.trim()
              ? 'No matching images'
              : category !== 'all'
              ? `No ${LIBRARY_CATEGORIES.find((c) => c.id === category)?.label || 'images'} yet`
              : "It's quiet in here"}
          </div>
          <div style={{ fontSize: '14px', maxWidth: '320px', textAlign: 'center', lineHeight: '1.5' }}>
            {libraryView === 'trash'
              ? 'Images you delete will show up here for 30 days before being permanently removed.'
              : libraryView === 'liked'
              ? 'Images you like will appear here.'
              : query.trim()
              ? 'Try searching with different keywords.'
              : category !== 'all'
              ? `Images in the ${LIBRARY_CATEGORIES.find((c) => c.id === category)?.label || ''} category will appear here.`
              : 'Images you generate in this workspace will magically appear here.'}
          </div>
          {libraryView !== 'library' ? (
            <button
              type="button"
              onClick={() => {
                setLibraryView('library');
                clearSelection();
              }}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: 'var(--text-main, #111827)',
                fontSize: '13px',
                fontWeight: '550',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
            >
              Back to Library
            </button>
          ) : query.trim() ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: 'var(--text-main, #111827)',
                fontSize: '13px',
                fontWeight: '550',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
            >
              Clear search
            </button>
          ) : category !== 'all' ? (
            <button
              type="button"
              onClick={() => setCategory('all')}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: 'var(--text-main, #111827)',
                fontSize: '13px',
                fontWeight: '550',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
            >
              Show all images
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`library-grid${layout === 'list' ? ' is-list' : ''}`}
          style={{
            columnCount: layout === 'list' ? 1 : 'auto',
            columnWidth: layout === 'list' ? 'auto' : '240px',
            columnGap: '28px',
          }}
        >
          {filteredGenerations.map((gen) => {
            const idx = generations.indexOf(gen);
            const imgUrl = gen.url || gen.resultUrl;
            if (!imgUrl) return null;
            const imageName = String(gen.prompt || gen.title || 'Untitled')
              .replace(/[*#_`]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .split(/[.\n]/)[0]
              .slice(0, 80) || 'Untitled';
            const isSelected = selectedIds.includes(gen.id || idx);
            
            return (
              <div 
                key={gen.id || idx} 
                className={`cute-library-card${isSelected ? ' is-selected' : ''}${libraryView === 'trash' ? ' is-trash' : ''}`}
                onClick={() => libraryView !== 'trash' && onImageClick && gen.threadId && onImageClick(gen.threadId)}
                style={{ cursor: gen.threadId ? 'pointer' : 'default' }}
              >
                {layout === 'list' && (
                  <button
                    type="button"
                    className={`library-list-check${isSelected ? ' is-on' : ''}`}
                    aria-label={isSelected ? 'Unselect image' : 'Select image'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelected(gen.id || idx);
                    }}
                  >
                    <Check size={13} />
                  </button>
                )}
                <div className="cute-library-card-img-wrapper">
                  <img 
                    src={imgUrl} 
                    alt={gen.prompt || "Generated image"} 
                    className="cute-library-card-img"
                    loading="lazy"
                  />
                  {libraryView === 'trash' && (
                    <span className="library-days-left">
                      {(() => {
                        const deleted = gen.deletedAt ? new Date(gen.deletedAt).getTime() : Date.now();
                        const left = Math.max(0, Math.ceil((deleted + 30 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)));
                        return left === 1 ? '1 day left' : `${left} days left`;
                      })()}
                    </span>
                  )}
                  {libraryView === 'trash' ? (
                    <div className="library-more-wrap library-trash-menu">
                      <button
                        type="button"
                        className="library-more-btn"
                        aria-label="Image actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrashMenuId((current) => (current === (gen.id || idx) ? null : (gen.id || idx)));
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {trashMenuId === (gen.id || idx) && (
                        <div className="library-trash-pop" role="menu">
                          <button type="button" onClick={(e) => { e.stopPropagation(); restoreSelected([gen.id]); }}>
                            <RotateCcw size={15} /> Restore
                          </button>
                          <button type="button" className="is-danger" onClick={(e) => { e.stopPropagation(); setConfirmPurge([gen.id]); setTrashMenuId(null); }}>
                            <Trash2 size={15} /> Permanently delete
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className="cute-library-card-actions">
                    <button 
                      className="library-action-btn"
                      onClick={(e) => handleDownload(e, gen, idx)}
                      disabled={downloadingId === (gen.id || idx)}
                      title="Download Image"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      className="library-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(imgUrl);
                      }}
                      title="Copy Image URL"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  )}
                  <button
                    type="button"
                    className={`library-select-box${selectedIds.includes(gen.id || idx) ? ' is-on' : ''}`}
                    aria-label={selectedIds.includes(gen.id || idx) ? 'Unselect image' : 'Select image'}
                    aria-pressed={selectedIds.includes(gen.id || idx)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelected(gen.id || idx);
                    }}
                  >
                    <Check size={14} />
                  </button>
                </div>
                {layout === 'list' && (
                  <>
                    <div className="library-list-name" title={imageName}>{imageName}</div>
                    {libraryView !== 'trash' && <div className="library-list-actions">
                      <button
                        type="button"
                        className="library-action-btn"
                        title="Download"
                        onClick={(e) => handleDownload(e, gen, idx)}
                      >
                        <Download size={15} />
                      </button>
                      <button
                        type="button"
                        className="library-action-btn"
                        title="Copy image URL"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(imgUrl);
                        }}
                      >
                        <Copy size={15} />
                      </button>
                    </div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      {Array.isArray(downloadProgress) && downloadProgress.length > 0 && (
        <div className="library-download-progress" role="status">
          Downloading
          <span>{downloadProgress.filter((item) => item.status === 'done').length} of {downloadProgress.length} downloaded</span>
          <div className="library-dl-list">
            {downloadProgress.map((item) => (
              <div className="library-dl-row" key={item.id}>
                <img className="library-dl-thumb" src={item.src} alt="" />
                <div className="library-dl-meta">
                  <strong>{item.status === 'done' ? 'Downloaded' : item.status === 'downloading' ? 'Downloading' : 'Waiting'}</strong>
                  <div className={`library-dl-track${item.status === 'done' ? ' is-done' : ''}`} aria-hidden>
                    <i />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!downloadProgress && downloadNotice && <div className="library-download-toast" role="status">{downloadNotice}</div>}
      {selected.length > 0 && libraryView === 'trash' && (
        <div className="library-selection-bar" role="toolbar" aria-label="Selected trash images">
          <span className="library-selection-count">{selected.length} selected</span>
          <button type="button" className="library-selection-btn" onClick={() => restoreSelected()}>
            <RotateCcw size={15} /> Restore
          </button>
          <button type="button" className="library-selection-btn is-danger" onClick={() => setConfirmPurge(selectedTrashIds())}>
            <Trash2 size={15} /> Delete forever
          </button>
          <button type="button" className="library-selection-icon" title="Clear selection" aria-label="Clear selection" onClick={clearSelection}>
            <X size={16} />
          </button>
        </div>
      )}
      {selected.length > 0 && libraryView !== 'trash' && (
        <div className="library-selection-bar" role="toolbar" aria-label="Selected images">
          <span className="library-selection-count">{selected.length} selected</span>
          <div className="library-start-wrap">
            <button
              type="button"
              className="library-selection-btn"
              onClick={() => {
                setConfirmDelete(false);
                setModeMenuOpen((open) => !open);
              }}
            >
              <MessageSquare size={15} /> Start chat
            </button>
            {modeMenuOpen && (
              <div className="library-mode-pop library-new-menu" role="menu">
                <div className="library-new-menu-label">Start in</div>
                {START_CHAT_MODES.map(({ id, label, Icon }) => (
                  <button key={id} type="button" role="menuitem" onClick={() => startChat(id)}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="library-selection-btn"
            onClick={downloadSelected}
            disabled={downloadingSelection}
          >
            <Download size={15} /> {downloadingSelection ? 'Downloading…' : 'Download'}
          </button>
          <button type="button" className="library-selection-btn is-danger" onClick={() => { setModeMenuOpen(false); setConfirmDelete(true); }}>
            <Trash2 size={15} /> Delete
          </button>
          <button type="button" className="library-selection-icon" title="Clear selection" aria-label="Clear selection" onClick={clearSelection}>
            <X size={16} />
          </button>
        </div>
      )}
      <ConfirmDialog
        dialog={confirmDelete ? {
          title: selected.length === 1 ? 'Delete this image?' : `Delete ${selected.length} images?`,
          message: selected.length === 1
            ? 'It will be moved to Trash. You can restore it from there. It is permanently deleted after 30 days.'
            : 'They will be moved to Trash. You can restore them from there. They are permanently deleted after 30 days.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          variant: 'danger',
          onConfirm: () => deleteSelectedLocally(),
        } : null}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        dialog={confirmPurge ? {
          title: confirmPurge.length === 1 ? 'Delete this image forever?' : `Delete ${confirmPurge.length} images forever?`,
          message: 'This cannot be undone.',
          confirmLabel: 'Delete forever',
          cancelLabel: 'Cancel',
          variant: 'danger',
          onConfirm: () => purgeSelected(confirmPurge),
        } : null}
        onCancel={() => setConfirmPurge(false)}
      />
    </div>
  );
}
