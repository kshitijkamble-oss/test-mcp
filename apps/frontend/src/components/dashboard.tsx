import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, FolderKanban, FileStack, ClipboardList,
  PencilLine, SquareCheckBig, Truck, BarChart3,
  Users, Settings,
  Home, CircleHelp, Bell, Sun, Moon, ChevronDown,
  Search, Filter, Download, Plus,
  TrendingUp, TrendingDown,
  LayoutGrid, List, ArrowUpDown,
  MapPin, SquareArrowOutUpRight,
  AlertTriangle, SearchX, Info,
} from 'lucide-react';
import './dashboard.css';

interface Project {
  id: number;
  name: string;
  code: string;
  status: 'Active' | 'Awarded' | 'Prebid' | 'At Risk' | 'Done';
  drawings: number;
  fcn: number;
  progress: number;
  location: string;
  capacity: string;
  updated: string;
  lead: string;
}

const PROJECTS: Project[] = [
  { id: 1, name: 'AGEL Hybrid Merchant (Solar) P1', code: '4810023552', status: 'Active',  drawings: 412, fcn: 7,  progress: 68, location: 'Khavda, Gujarat',  capacity: '700 MW', updated: '2 h ago',  lead: 'R. Mehta' },
  { id: 2, name: 'AGEL Solar 200MW Khavda',         code: '4810023571', status: 'Active',  drawings: 268, fcn: 12, progress: 54, location: 'Khavda, Gujarat',  capacity: '200 MW', updated: '5 h ago',  lead: 'P. Iyer' },
  { id: 3, name: 'AGEL Wind P3 Phase 2',            code: '4810023589', status: 'Awarded', drawings: 154, fcn: 0,  progress: 22, location: 'Kutch, Gujarat',   capacity: '120 MW', updated: '1 d ago',  lead: 'S. Banerji' },
  { id: 4, name: 'AGEL Hybrid Rajasthan Block C',   code: '4810023602', status: 'At Risk', drawings:  98, fcn: 22, progress: 31, location: 'Jaisalmer, RJ',    capacity: '450 MW', updated: '12 m ago', lead: 'A. Gupta' },
  { id: 5, name: 'AGEL Solar Mundra IDT',           code: '4810023619', status: 'Prebid',  drawings:  38, fcn: 1,  progress:  8, location: 'Mundra, Gujarat',  capacity: '90 MW',  updated: '2 d ago',  lead: 'N. Kapoor' },
  { id: 6, name: 'AGEL Wind Kutch Phase 1',         code: '4810023634', status: 'Done',    drawings: 503, fcn: 0,  progress: 100, location: 'Kutch, Gujarat',  capacity: '300 MW', updated: '3 w ago',  lead: 'V. Rao' },
  { id: 7, name: 'AGEL Solar Bikaner Block A',      code: '4810023641', status: 'Active',  drawings: 287, fcn: 4,  progress: 47, location: 'Bikaner, RJ',      capacity: '350 MW', updated: '4 h ago',  lead: 'R. Mehta' },
  { id: 8, name: 'AGEL Hybrid Devbhoomi P2',        code: '4810023665', status: 'Active',  drawings: 134, fcn: 9,  progress: 38, location: 'Dwarka, Gujarat',  capacity: '180 MW', updated: '8 h ago',  lead: 'P. Iyer' },
];

const STATUS_CHIP: Record<string, string> = {
  'Active':  'chip-active',
  'Awarded': 'chip-awarded',
  'Prebid':  'chip-prebid',
  'At Risk': 'chip-risk',
  'Done':    'chip-done',
};

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`chip ${STATUS_CHIP[status] ?? 'chip-done'}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

function TopBar({ onToast }: { onToast: (msg: string) => void }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setIsDark(current === 'dark');
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
          <span>Home</span>
          <span className="sep">›</span>
          <span className="cur">Projects</span>
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

const NAV_GROUPS = [
  { group: 'Workspace', items: [
    { icon: <LayoutDashboard size={16} />, label: 'Overview',         count: null },
    { icon: <FolderKanban size={16} />,   label: 'Projects',         count: 16, active: true },
    { icon: <FileStack size={16} />,      label: 'Drawings (CDE)',   count: '25.8K', href: '/drawings' },
    { icon: <ClipboardList size={16} />,  label: 'Service Orders',   count: 38 },
  ]},
  { group: 'Workflows', items: [
    { icon: <PencilLine size={16} />,      label: 'FCN / DCN',       count: 47 },
    { icon: <SquareCheckBig size={16} />,  label: 'Approvals',       count: 14 },
    { icon: <Truck size={16} />,           label: 'Material Issuance', count: null },
    { icon: <BarChart3 size={16} />,       label: 'Reports',          count: null },
  ]},
  { group: 'Admin', items: [
    { icon: <Users size={16} />,    label: 'Users & Roles', count: null },
    { icon: <Settings size={16} />, label: 'Settings',      count: null },
  ]},
];

function Sidebar({ onNav }: { onNav: (msg: string) => void }) {
  return (
    <aside className="sidebar">
      <nav className="snav">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group}>
            <div className="snav-group">{grp.group}</div>
            {grp.items.map((it) => (
              <a
                key={it.label}
                href={(it as { href?: string }).href ?? '#'}
                className={it.active ? 'active' : ''}
                onClick={(e) => {
                  if (it.active) { e.preventDefault(); return; }
                  if (!(it as { href?: string }).href) { e.preventDefault(); onNav(`${it.label} · coming soon`); }
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

const KPIS = [
  { label: 'Active Projects',  value: 12,      delta: '+2 this month', dir: 'up', icon: <FolderKanban size={14} />,  accent: 'rgba(0,109,182,0.12)', fg: 'var(--brand-blue-600)' },
  { label: 'Drawings Managed', value: '25.8K', delta: '+312 this week', dir: 'up', icon: <FileStack size={14} />,     accent: 'rgba(0,177,107,0.14)', fg: 'var(--accent-green)' },
  { label: 'FCNs Pending',     value: 47,      delta: '8 overdue',      dir: 'dn', icon: <PencilLine size={14} />,    accent: 'rgba(255,185,29,0.20)', fg: 'rgb(180,120,0)' },
  { label: 'At-Risk SOs',      value: 3,       delta: 'SLA breached',   dir: 'dn', icon: <AlertTriangle size={14} />, accent: 'rgba(240,76,35,0.14)', fg: 'var(--accent-orange-hot)' },
];

function KpiCard({ k }: { k: typeof KPIS[0] }) {
  return (
    <div className="kpi" style={{ '--kpi-accent': k.accent, '--kpi-fg': k.fg } as React.CSSProperties}>
      <div className="kpi-lbl">
        <span className="ic">{k.icon}</span>
        <span>{k.label}</span>
      </div>
      <div className="kpi-v">{k.value}</div>
      <div className={`kpi-delta ${k.dir}`}>
        {k.dir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{k.delta}</span>
      </div>
    </div>
  );
}

function ProjectCard({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  const initials = p.lead.split(' ').map(s => s[0]).join('');
  return (
    <div className={`pcard${p.status === 'At Risk' ? ' risk' : ''}`} onClick={() => onOpen(p)}>
      <div className="photo" style={{ backgroundImage: 'url(/assets/site-solar-panels.png)' }}>
        <span className="pin-status"><StatusChip status={p.status} /></span>
        <span className="photo-meta">
          <MapPin size={12} color="#fff" />
          {p.location} · {p.capacity}
        </span>
      </div>
      <div className="pbody">
        <div className="ptitle">
          <span>{p.name}</span>
          <span className="ext"><SquareArrowOutUpRight size={16} /></span>
        </div>
        <div className="pcode">SO {p.code} · Updated {p.updated}</div>
        <div className="pprogress">
          <div className="phead">
            <span>As-Built Coverage</span>
            <b>{p.progress}%</b>
          </div>
          <div className="pbar"><div className="pfill" style={{ width: `${p.progress}%` }} /></div>
        </div>
        <div className="pstats">
          <div><div className="sv">{p.drawings}</div><div className="sl">DWG</div></div>
          <div><div className="sv">{p.fcn}</div><div className="sl">FCN</div></div>
          <div><div className="sv">{initials}</div><div className="sl">Lead</div></div>
        </div>
      </div>
    </div>
  );
}

function ProjectTable({ items, onOpen }: { items: Project[]; onOpen: (p: Project) => void }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Project</th>
            <th>SO Code</th>
            <th>Status</th>
            <th>Capacity</th>
            <th>As-Built</th>
            <th>DWG</th>
            <th>FCN</th>
            <th>Lead</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} onClick={() => onOpen(p)}>
              <td>
                <div className="pname">
                  <div className="thumb" style={{ backgroundImage: 'url(/assets/site-solar-panels.png)' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t-fg-3)' }}>{p.location}</div>
                  </div>
                </div>
              </td>
              <td className="num">{p.code}</td>
              <td><StatusChip status={p.status} /></td>
              <td className="num">{p.capacity}</td>
              <td>
                <div className="progress-mini">
                  <div className="pbar"><div className="pfill" style={{ width: `${p.progress}%` }} /></div>
                  <span className="val">{p.progress}%</span>
                </div>
              </td>
              <td className="num">{p.drawings}</td>
              <td className="num" style={{ color: p.fcn > 10 ? 'var(--accent-orange-hot)' : undefined, fontWeight: p.fcn > 10 ? 700 : 400 }}>
                {p.fcn}
              </td>
              <td>{p.lead}</td>
              <td className="num">{p.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: PROJECTS.length };
    for (const p of PROJECTS) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    return PROJECTS.filter(p =>
      (statusFilter === 'All' || p.status === statusFilter) &&
      (q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.code.includes(q) || p.location.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, statusFilter]);

  const tabs = ['All', 'Active', 'Awarded', 'Prebid', 'At Risk', 'Done'];
  const openProject = (p: Project) => showToast(`Opening ${p.name}…`);

  return (
    <div className="drs-dash">
      <TopBar onToast={showToast} />
      <div className="dash-shell">
        <Sidebar onNav={showToast} />
        <main className="dash-main">
          <div className="page-h">
            <div>
              <h1>Projects</h1>
              <p className="subtitle">16 sites across 4 states · 25,840 drawings managed · Pilot MVP, June 2026</p>
            </div>
            <div className="actions">
              <div className="d-search">
                <Search size={14} color="var(--t-fg-3)" />
                <input
                  placeholder="Search projects, SO code, location…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                <span className="kbd">⌘ K</span>
              </div>
              <button className="d-btn d-btn-secondary" onClick={() => showToast('Filters · coming soon')}>
                <Filter size={14} /> Filters
              </button>
              <button className="d-btn d-btn-secondary" onClick={() => showToast('Export · coming soon')}>
                <Download size={14} /> Export
              </button>
              <button className="d-btn d-btn-primary" onClick={() => showToast('New project flow · coming soon')}>
                <Plus size={14} /> Add Project
              </button>
            </div>
          </div>

          <div className="kpi-row">
            {KPIS.map(k => <KpiCard key={k.label} k={k} />)}
          </div>

          <div className="toolbar">
            <div className="tabs">
              {tabs.map(t => (
                <button
                  key={t}
                  className={`tab${statusFilter === t ? ' active' : ''}`}
                  onClick={() => setStatusFilter(t)}
                >
                  {t}
                  <span className="ct">{counts[t] ?? 0}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="d-btn d-btn-ghost" onClick={() => showToast('Sort menu · coming soon')}>
                <ArrowUpDown size={14} /> Sort: Updated
              </button>
              <div className="view-toggle">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view">
                  <LayoutGrid size={14} />
                </button>
                <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view">
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <SearchX size={28} color="var(--t-fg-3)" />
              <h3>No projects match your filters</h3>
              <p>Try clearing the search or switching the status tab.</p>
              <button className="d-btn d-btn-secondary" onClick={() => { setQ(''); setStatusFilter('All'); }}>
                Clear filters
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="proj-grid">
              {filtered.map(p => <ProjectCard key={p.id} p={p} onOpen={openProject} />)}
            </div>
          ) : (
            <ProjectTable items={filtered} onOpen={openProject} />
          )}
        </main>
      </div>

      <div className={`dash-toast${toast ? ' show' : ''}`}>
        <Info size={16} color="#fff" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
