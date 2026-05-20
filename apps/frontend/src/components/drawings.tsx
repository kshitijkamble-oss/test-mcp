import { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard, FolderKanban, FileStack, ClipboardList,
  PencilLine, SquareCheckBig, Truck, BarChart3, Users, Settings,
  Home, CircleHelp, Bell, Sun, Moon, ChevronDown,
  MapPin, Zap, Hash, User,
  Search, Upload, CloudUpload, ShieldCheck,
  File, AlertCircle,
  History, Download, Info,
  CheckCircle2, XCircle,
  Cog, Check, X,
} from 'lucide-react';
import { ApsViewer, type DrawingRecord, type ViewerState } from './aps-viewer';
import './drawings.css';

/* ─── Data ─── */
const INITIAL_DRAWINGS: DrawingRecord[] = [
  { id: 'd1', name: 'IFC-EL-A12-002.dwg',  discipline: 'EL',  block: 'A12', rev: 'R04', status: 'RFC',      size: '4.2 MB', by: 'R. Mehta',   when: '2 d ago',  fcn: 1 },
  { id: 'd2', name: 'AB-EL-A12-002.dwg',   discipline: 'EL',  block: 'A12', rev: 'R02', status: 'As-Built', size: '4.6 MB', by: 'P. Iyer',    when: '5 h ago',  fcn: 0 },
  { id: 'd3', name: 'IFC-CV-B07-018.dwg',  discipline: 'CV',  block: 'B07', rev: 'R03', status: 'Review',   size: '3.8 MB', by: 'S. Banerji', when: '1 d ago',  fcn: 0 },
  { id: 'd4', name: 'IFC-MEP-C03-009.dwg', discipline: 'MEP', block: 'C03', rev: 'R01', status: 'RFC',      size: '6.1 MB', by: 'A. Gupta',   when: '3 d ago',  fcn: 0 },
  { id: 'd5', name: 'IFC-EL-D01-014.dwg',  discipline: 'EL',  block: 'D01', rev: 'R05', status: 'FCN Open', size: '5.0 MB', by: 'R. Mehta',   when: '8 h ago',  fcn: 2 },
  { id: 'd6', name: 'IFC-CV-A12-003.dwg',  discipline: 'CV',  block: 'A12', rev: 'R02', status: 'As-Built', size: '4.1 MB', by: 'V. Rao',     when: '1 w ago',  fcn: 0 },
  { id: 'd7', name: 'IFC-PV-A09-021.dwg',  discipline: 'PV',  block: 'A09', rev: 'R01', status: 'Review',   size: '7.3 MB', by: 'N. Kapoor',  when: '4 d ago',  fcn: 0 },
  { id: 'd8', name: 'IFC-EL-A09-007.dwg',  discipline: 'EL',  block: 'A09', rev: 'R02', status: 'RFC',      size: '3.5 MB', by: 'R. Mehta',   when: '6 d ago',  fcn: 0 },
];

const STATUS_CHIP: Record<string, string> = {
  'RFC':      'chip-rfc',
  'As-Built': 'chip-asbuilt',
  'Review':   'chip-review',
  'FCN Open': 'chip-fcnopen',
};

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`chip ${STATUS_CHIP[status] ?? 'chip-rfc'}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

/* ─── Topbar ─── */
function TopBar({ onToast }: { onToast: (msg: string) => void }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('drs-theme', next ? 'dark' : 'light');
  }

  return (
    <header className="topbar">
      <div className="tb-left">
        <a className="tb-logo" href="/login">
          <img src="/assets/adani-logo.png" alt="Adani Renewables" />
        </a>
        <nav className="crumbs">
          <Home size={14} />
          <a href="/dashboard">Projects</a>
          <span className="sep">›</span>
          <a href="/dashboard">AGEL Hybrid Merchant (Solar) P1</a>
          <span className="sep">›</span>
          <span className="cur">Drawings</span>
        </nav>
      </div>
      <div className="tb-right">
        <span className="tb-wordmark">Project Lifecycle Platform</span>
        <button className="tb-icon-btn" aria-label="Help" onClick={() => onToast('Help center · coming soon')}>
          <CircleHelp size={18} />
        </button>
        <button className="tb-icon-btn" aria-label="Notifications" onClick={() => onToast('5 unread notifications')}>
          <Bell size={18} />
          <span className="badge">5</span>
        </button>
        <button className="tb-icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="userpill" aria-label="Account">
          <span className="av">SA</span>
          <span className="who">
            <span className="nm">Super Admin</span>
            <br />
            <span className="role">Project Control Manager</span>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}

/* ─── Sidebar ─── */
const NAV_GROUPS = [
  { group: 'Workspace', items: [
    { icon: <LayoutDashboard size={16} />, label: 'Overview',       count: null, href: null },
    { icon: <FolderKanban size={16} />,   label: 'Projects',        count: 16,   href: '/dashboard' },
    { icon: <FileStack size={16} />,      label: 'Drawings (CDE)',  count: 412,  href: '/drawings', active: true },
    { icon: <ClipboardList size={16} />,  label: 'Service Orders',  count: 38,   href: null },
  ]},
  { group: 'Workflows', items: [
    { icon: <PencilLine size={16} />,     label: 'FCN / DCN',         count: 7,  href: null },
    { icon: <SquareCheckBig size={16} />, label: 'Approvals',         count: 4,  href: null },
    { icon: <Truck size={16} />,          label: 'Material Issuance', count: null, href: null },
    { icon: <BarChart3 size={16} />,      label: 'Reports',           count: null, href: null },
  ]},
  { group: 'Admin', items: [
    { icon: <Users size={16} />,    label: 'Users & Roles', count: null, href: null },
    { icon: <Settings size={16} />, label: 'Settings',      count: null, href: null },
  ]},
];

function Sidebar({ onNav }: { onNav: (msg: string) => void }) {
  return (
    <aside className="sidebar">
      <nav className="snav">
        {NAV_GROUPS.map(grp => (
          <div key={grp.group}>
            <div className="snav-group">{grp.group}</div>
            {grp.items.map(it => (
              <a
                key={it.label}
                href={it.href ?? '#'}
                className={it.active ? 'active' : ''}
                onClick={(e) => {
                  if (it.active) { e.preventDefault(); return; }
                  if (!it.href) { e.preventDefault(); onNav(`${it.label} · coming soon`); }
                }}
              >
                {it.icon}
                <span>{it.label}</span>
                {it.count != null && <span className="snav-count">{it.count}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span>v2.4 · Pilot MVP</span>
        <span>● Online</span>
      </div>
    </aside>
  );
}

/* ─── Project banner ─── */
function ProjectBanner() {
  return (
    <div className="pbanner">
      <div className="pbanner-left">
        <div className="pthumb" />
        <div>
          <h1>AGEL Hybrid Merchant (Solar) P1</h1>
          <div className="pmeta">
            <span><MapPin size={12} /> Khavda, Gujarat</span>
            <span className="dot">·</span>
            <span><Zap size={12} /> 700 MW</span>
            <span className="dot">·</span>
            <span><Hash size={12} /> SO 4810023552</span>
            <span className="dot">·</span>
            <span><User size={12} /> Lead: R. Mehta</span>
          </div>
        </div>
      </div>
      <div className="pbanner-right">
        <div className="pkpis">
          <div className="pkpi"><div className="kv">412</div><div className="kl">Drawings</div></div>
          <div className="pkpi"><div className="kv">7</div><div className="kl">FCN Open</div></div>
          <div className="pkpi"><div className="kv">68%</div><div className="kl">As-Built</div></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Drawing list ─── */
const DISCIPLINES = ['All', 'EL', 'CV', 'MEP', 'PV'];

function DrawingList({ drawings, selectedId, onSelect, onUploadClick }: {
  drawings: DrawingRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUploadClick: () => void;
}) {
  const [q, setQ] = useState('');
  const [disc, setDisc] = useState('All');

  const filtered = useMemo(() => drawings.filter(d =>
    (disc === 'All' || d.discipline === disc) &&
    (q === '' || d.name.toLowerCase().includes(q.toLowerCase()) || d.block.toLowerCase().includes(q.toLowerCase()))
  ), [drawings, q, disc]);

  return (
    <div className="panel">
      <div className="panel-h">
        <h3>
          <FileStack size={14} />
          Drawings <span className="ct">{drawings.length}</span>
        </h3>
        <div className="h-actions">
          <button className="d-btn d-btn-secondary d-btn-sm" onClick={onUploadClick}>
            <Upload size={13} /> Upload
          </button>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="dsearch">
          <Search size={13} color="var(--t-fg-3)" />
          <input placeholder="Search drawing or block…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="disc-tabs">
        {DISCIPLINES.map(d => (
          <button key={d} className={`disc-tab${disc === d ? ' active' : ''}`} onClick={() => setDisc(d)}>{d}</button>
        ))}
      </div>

      <div className="dlist">
        {filtered.map(d => (
          <div
            key={d.id}
            className={`ditem${selectedId === d.id ? ' selected' : ''}`}
            onClick={() => onSelect(d.id)}
          >
            <span className="dic"><File size={16} /></span>
            <div style={{ minWidth: 0 }}>
              <div className="dnm" title={d.name}>{d.name}</div>
              <div className="dmeta">
                <span className="rev">{d.rev}</span>
                <StatusChip status={d.status} />
                <span>· {d.size}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--t-fg-3)', fontFamily: 'var(--font-data)' }}>{d.when}</div>
              {d.fcn > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, fontWeight: 700, color: 'var(--accent-orange-hot)' }}>
                  <AlertCircle size={11} color="var(--accent-orange-hot)" /> {d.fcn} FCN
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--t-fg-3)', fontSize: 13 }}>
            No drawings match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Upload queue item ─── */
interface UploadItem {
  id: string;
  name: string;
  pct: number;
  phase: 'uploading' | 'translating' | 'done' | 'failed';
  size: string;
}

function UploadPanel({ uploads, onFiles, onClear }: {
  uploads: UploadItem[];
  onFiles: (files: File[]) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list);
    if (files.length) onFiles(files);
  };

  return (
    <>
      <div
        className={`upload${over ? ' over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="uic"><CloudUpload size={22} /></div>
        <div className="utitle"><em>Drop .dwg files</em> or click to upload</div>
        <div className="uhint">Supports DWG · DXF · RVT · IFC · PDF — up to 500 MB · APS translation runs automatically</div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".dwg,.dxf,.rvt,.ifc,.pdf"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {uploads.length > 0 && (
        <div className="uploads-list">
          {uploads.map(u => (
            <div key={u.id} className={`uitem ${u.phase}`}>
              <div className="uitem-head">
                {u.phase === 'done'   && <CheckCircle2 size={13} color="var(--accent-green)" />}
                {u.phase === 'failed' && <XCircle size={13} color="var(--status-error)" />}
                {(u.phase === 'uploading' || u.phase === 'translating') && <File size={13} />}
                <span className="unm">{u.name}</span>
                <span className="upct">{u.phase === 'done' ? '✓' : u.phase === 'failed' ? '!' : `${Math.round(u.pct)}%`}</span>
              </div>
              <div className="ubar"><div className="ufill" style={{ width: `${u.phase === 'done' ? 100 : u.pct}%` }} /></div>
              <div className="ustatus">
                {u.phase === 'uploading'   && <><Upload size={11} /> Uploading to APS…</>}
                {u.phase === 'translating' && <><Cog size={11} /> Translating to SVF · {u.size}</>}
                {u.phase === 'done'        && <><Check size={11} color="var(--accent-green)" /> Ready · {u.size}</>}
                {u.phase === 'failed'      && <><X size={11} color="var(--status-error)" /> Translation failed</>}
              </div>
            </div>
          ))}
          <button className="d-btn d-btn-ghost d-btn-sm" style={{ alignSelf: 'flex-end' }} onClick={onClear}>
            <X size={12} /> Clear completed
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Viewer panel wrapper ─── */
function ViewerPanel({ drawing, viewerState, onAction }: {
  drawing: DrawingRecord | null;
  viewerState: ViewerState;
  onAction: (label: string) => void;
}) {
  return (
    <div className="panel">
      <div className="dwg-meta">
        <div className="mleft">
          <File size={16} color="var(--brand-blue-600)" />
          <span className="dname">{drawing?.name ?? 'No drawing selected'}</span>
          {drawing && (
            <>
              <span className="rev-pill">{drawing.rev}</span>
              <StatusChip status={drawing.status} />
              <span className="dmeta2">
                <span><User size={11} /> {drawing.by}</span>
                <span>·</span>
                <span>{drawing.when}</span>
                <span>·</span>
                <span>{drawing.size}</span>
              </span>
            </>
          )}
        </div>
        <div className="mright">
          <button className="d-btn d-btn-secondary d-btn-sm" onClick={() => onAction('History')}>
            <History size={13} /> History
          </button>
          <button className="d-btn d-btn-secondary d-btn-sm" onClick={() => onAction('Download')}>
            <Download size={13} /> Download
          </button>
          <button className="d-btn d-btn-fcn d-btn-sm" onClick={() => onAction('Raise FCN')} disabled={!drawing}>
            <PencilLine size={13} /> Raise FCN
          </button>
        </div>
      </div>
      <ApsViewer drawing={drawing} viewerState={viewerState} />
    </div>
  );
}

/* ─── Page root ─── */
export function DrawingsPage() {
  const [drawings, setDrawings] = useState<DrawingRecord[]>(INITIAL_DRAWINGS);
  const [selectedId, setSelectedId] = useState<string>('d1');
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [viewerOverride, setViewerOverride] = useState<ViewerState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const selected = drawings.find(d => d.id === selectedId) ?? null;
  const viewerState: ViewerState = viewerOverride ?? (selected ? 'ready' : 'empty');

  const handleFiles = (files: File[]) => {
    files.forEach((f, i) => {
      const uid = 'u' + Date.now() + '-' + i;
      const sizeMb = f.size > 0 ? f.size / 1024 / 1024 : Math.random() * 5 + 1;
      const size = sizeMb.toFixed(1) + ' MB';
      setUploads(prev => [{ id: uid, name: f.name, pct: 0, phase: 'uploading', size }, ...prev]);

      /* upload simulation */
      let pct = 0;
      const uploadTick = setInterval(() => {
        pct += 8 + Math.random() * 14;
        if (pct >= 100) {
          clearInterval(uploadTick);
          setUploads(prev => prev.map(u => u.id === uid ? { ...u, pct: 100, phase: 'translating' } : u));
          setViewerOverride('translating');

          /* translation simulation */
          let tpct = 0;
          const transTick = setInterval(() => {
            tpct += 6 + Math.random() * 10;
            if (tpct >= 100) {
              clearInterval(transTick);
              setUploads(prev => prev.map(u => u.id === uid ? { ...u, pct: 100, phase: 'done' } : u));
              const newId = 'new-' + uid;
              const disc = f.name.match(/-(EL|CV|MEP|PV)-/i)?.[1]?.toUpperCase() ?? 'EL';
              const newDrawing: DrawingRecord = { id: newId, name: f.name, discipline: disc, block: 'A12', rev: 'R01', status: 'Review', size, by: 'You', when: 'just now', fcn: 0 };
              setDrawings(prev => [newDrawing, ...prev]);
              setSelectedId(newId);
              setViewerOverride(null);
              showToast(`${f.name} translated · ready in viewer`);
            } else {
              setUploads(prev => prev.map(u => u.id === uid ? { ...u, pct: tpct } : u));
            }
          }, 350);
        } else {
          setUploads(prev => prev.map(u => u.id === uid ? { ...u, pct } : u));
        }
      }, 200);
    });
  };

  const handleAction = (label: string) => {
    if (label === 'Raise FCN') showToast(`FCN drafted for ${selected?.name}`);
    else showToast(`${label} · coming soon`);
  };

  return (
    <div className="drs-dwg">
      <TopBar onToast={showToast} />
      <div className="dwg-shell">
        <Sidebar onNav={showToast} />
        <main className="dwg-main">
          <ProjectBanner />

          <div className="workspace">
            {/* left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <DrawingList
                drawings={drawings}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onUploadClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
              />
              <div ref={uploadRef} className="panel">
                <div className="panel-h">
                  <h3><CloudUpload size={14} /> Upload Drawings</h3>
                  <span style={{ fontSize: 11, color: 'var(--t-fg-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} /> APS connected
                  </span>
                </div>
                <UploadPanel
                  uploads={uploads}
                  onFiles={handleFiles}
                  onClear={() => setUploads(prev => prev.filter(u => u.phase !== 'done' && u.phase !== 'failed'))}
                />
              </div>
            </div>

            {/* right column */}
            <ViewerPanel drawing={selected} viewerState={viewerState} onAction={handleAction} />
          </div>
        </main>
      </div>

      <div className={`dwg-toast${toast ? ' show' : ''}`}>
        <Info size={16} color="#fff" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
