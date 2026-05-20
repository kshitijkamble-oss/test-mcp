import { useState, useEffect, useRef } from 'react';
import {
  MousePointer2, Move, Rotate3D, ZoomIn, ZoomOut, Maximize,
  Ruler, Scissors, PenTool, Settings2, Expand, Minus, Plus,
  FileQuestion, Cog, CheckCircle2,
} from 'lucide-react';

/* ─── Global Autodesk SDK type stub (injected from CDN at runtime) ─── */
declare global {
  interface Window {
    Autodesk?: {
      Viewing: {
        Initializer: (opts: object, cb: () => void) => void;
        GuiViewer3D: new (container: HTMLElement, config?: object) => {
          start: () => void;
          loadDocumentNode: (doc: object, node: object) => void;
          finish: () => void;
        };
        Document: {
          load: (urn: string, onSuccess: (doc: object) => void, onError: (code: number, msg: string) => void) => void;
          getAecModelData: (doc: object) => object;
        };
      };
    };
  }
}

export interface DrawingRecord {
  id: string;
  name: string;
  discipline: string;
  block: string;
  rev: string;
  status: string;
  size: string;
  by: string;
  when: string;
  fcn: number;
  urn?: string;
}

export type ViewerState = 'ready' | 'empty' | 'translating';

interface Props {
  drawing: DrawingRecord | null;
  viewerState: ViewerState;
}

/* ─── Layer definitions ─── */
const INITIAL_LAYERS = [
  { id: 'border', label: 'Site boundary',  color: '#9DC8F5', on: true },
  { id: 'mods',   label: 'PV Modules',     color: '#006DB6', on: true },
  { id: 'invs',   label: 'Inverter pads',  color: '#00B16B', on: true },
  { id: 'cab',    label: 'Cable trenches', color: '#F6CA46', on: true },
  { id: 'rds',    label: 'Roads',          color: '#B0B0B0', on: true },
  { id: 'ann',    label: 'Annotations',    color: '#F04C23', on: true },
  { id: 'grid',   label: 'Survey grid',    color: '#7E8DA6', on: false },
];

/* ─── Mock SVG viewer ─── */
function MockViewer({ drawing, layers, setLayers, tool, setTool, zoom, setZoom }: {
  drawing: DrawingRecord | null;
  layers: typeof INITIAL_LAYERS;
  setLayers: React.Dispatch<React.SetStateAction<typeof INITIAL_LAYERS>>;
  tool: string;
  setTool: (t: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}) {
  const toggle = (id: string) => setLayers(L => L.map(l => l.id === id ? { ...l, on: !l.on } : l));
  const isOn = (id: string) => layers.find(l => l.id === id)?.on ?? false;

  const pvBlocks = Array.from({ length: 4 }).map((_, b) => ({
    ox: 80 + (b % 2) * 340,
    oy: 80 + Math.floor(b / 2) * 200,
  }));

  return (
    <div style={{ flex: 1, minHeight: 540, position: 'relative', background: 'var(--aps-bg)', color: 'var(--aps-fg)', overflow: 'hidden', display: 'flex' }}>
      {/* grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* model browser rail */}
      <div style={{ width: 220, flexShrink: 0, background: 'var(--aps-panel)', borderRight: '1px solid var(--aps-border)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--aps-fg-2)', borderBottom: '1px solid var(--aps-border)' }}>
          Model · Layers
        </div>
        <div style={{ padding: '6px 4px', overflowY: 'auto', flex: 1 }}>
          {layers.map(l => (
            <div key={l.id}
              onClick={() => toggle(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', fontSize: 12, color: 'var(--aps-fg)', cursor: 'pointer', borderRadius: 4, opacity: l.on ? 1 : 0.45 }}>
              <span style={{
                width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 3,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: l.on ? 'var(--brand-blue-500)' : 'transparent',
                borderColor: l.on ? 'var(--brand-blue-500)' : undefined,
                flexShrink: 0,
              }}>
                {l.on && <span style={{ display: 'block', width: 7, height: 4, border: '1.5px solid #fff', borderTop: 0, borderRight: 0, transform: 'rotate(-45deg) translate(0px,-1px)' }} />}
              </span>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{l.label}</span>
            </div>
          ))}
          <div style={{ height: 8 }} />
          <div style={{ padding: '6px 10px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--aps-fg-2)' }}>Sheets</div>
          {['Sheet 01 · Layout', 'Sheet 02 · String diagram', 'Sheet 03 · Sections A-A'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', fontSize: 12, color: 'var(--aps-fg)', cursor: 'pointer', borderRadius: 4 }}>
              <span style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? 'var(--brand-blue-500)' : 'transparent', borderColor: i === 0 ? 'var(--brand-blue-500)' : undefined, flexShrink: 0 }}>
                {i === 0 && <span style={{ display: 'block', width: 7, height: 4, border: '1.5px solid #fff', borderTop: 0, borderRight: 0, transform: 'rotate(-45deg) translate(0px,-1px)' }} />}
              </span>
              <span style={{ flex: 1 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* drawing canvas */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {isOn('border') && <rect x={60} y={60} width={680} height={380} fill="none" stroke="rgba(157,200,245,0.7)" strokeWidth={1.5} strokeDasharray="4 4" />}
          {isOn('rds') && (
            <g stroke="rgba(176,176,176,0.6)" strokeWidth={3} fill="none">
              <line x1={60} y1={250} x2={740} y2={250} />
              <line x1={400} y1={60} x2={400} y2={440} />
            </g>
          )}
          {isOn('grid') && (
            <g stroke="rgba(126,141,166,0.35)" strokeWidth={0.5}>
              {Array.from({ length: 9 }).map((_, i) => <line key={'gh' + i} x1={60} y1={60 + i * 42} x2={740} y2={60 + i * 42} />)}
              {Array.from({ length: 17 }).map((_, i) => <line key={'gv' + i} x1={60 + i * 42} y1={60} x2={60 + i * 42} y2={440} />)}
            </g>
          )}
          {isOn('mods') && pvBlocks.map(({ ox, oy }, b) => (
            <g key={'b' + b} fill="rgba(0,109,182,0.55)" stroke="rgba(157,200,245,0.7)" strokeWidth={0.6}>
              {Array.from({ length: 6 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => (
                  <rect key={'m' + r + c} x={ox + c * 36} y={oy + r * 22} width={32} height={18} />
                ))
              )}
            </g>
          ))}
          {isOn('invs') && (
            <g fill="rgba(0,177,107,0.7)" stroke="rgba(255,255,255,0.5)" strokeWidth={0.8}>
              <rect x={190} y={200} width={24} height={36} />
              <rect x={530} y={200} width={24} height={36} />
              <rect x={190} y={350} width={24} height={36} />
              <rect x={530} y={350} width={24} height={36} />
            </g>
          )}
          {isOn('cab') && (
            <g stroke="rgba(246,202,70,0.85)" strokeWidth={1.2} strokeDasharray="3 3" fill="none">
              <path d="M 202 218 L 202 250 L 400 250 L 400 218" />
              <path d="M 542 218 L 542 250" />
              <path d="M 202 368 L 202 250" />
              <path d="M 542 368 L 542 250" />
            </g>
          )}
          {isOn('ann') && (
            <g fill="rgba(255,255,255,0.7)" fontFamily="var(--font-data)" fontSize={9} letterSpacing={0.5}>
              <text x={400} y={50} textAnchor="middle">Block A12 · 12 string-rows</text>
              <text x={68} y={252} textAnchor="start">Access road A</text>
              <text x={180} y={195}>INV-01</text>
              <text x={520} y={195}>INV-02</text>
            </g>
          )}
        </svg>

        {/* FCN markup */}
        {drawing && drawing.fcn > 0 && (
          <>
            <div style={{ position: 'absolute', left: '23%', top: '40%', width: '8%', height: '15%', border: '2px solid var(--accent-orange-hot)', background: 'rgba(240,76,35,0.10)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '23%', top: 'calc(40% - 22px)', background: 'var(--accent-orange-hot)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 700, letterSpacing: '0.02em', zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>FCN-0412</div>
          </>
        )}

        {/* view cube */}
        <div style={{ position: 'absolute', top: 14, left: 14, width: 64, height: 64, zIndex: 3 }}>
          {[
            { label: 'TOP', style: { top: 0, left: 14, background: 'rgba(0,109,182,0.5)', borderColor: 'rgba(0,109,182,0.6)' } },
            { label: 'FRT', style: { top: 28, left: 14 } },
            { label: 'RGT', style: { top: 14, left: 28, transform: 'skewY(-12deg)' } },
          ].map(f => (
            <div key={f.label} style={{ position: 'absolute', width: 36, height: 36, background: 'var(--aps-panel)', border: '1px solid var(--aps-border)', backdropFilter: 'blur(10px)', color: 'var(--aps-fg)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, ...f.style }}>
              {f.label}
            </div>
          ))}
        </div>

        {/* top toolbar */}
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 4, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--aps-panel)', backdropFilter: 'blur(10px)', border: '1px solid var(--aps-border)', borderRadius: 10, padding: 4, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
          {([
            { id: 'select', Icon: MousePointer2, title: 'Select' },
            { id: 'pan',    Icon: Move,          title: 'Pan' },
            { id: 'orbit',  Icon: Rotate3D,      title: 'Orbit' },
          ] as const).map(({ id, Icon, title }) => (
            <button key={id} title={title} onClick={() => setTool(id)}
              style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tool === id ? 'var(--brand-blue-500)' : 'transparent', border: 0, borderRadius: 6, color: tool === id ? '#fff' : 'var(--aps-fg)', cursor: 'pointer' }}>
              <Icon size={15} />
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: 'var(--aps-border)', margin: '0 4px' }} />
          <button title="Zoom in"  onClick={() => setZoom(z => Math.min(400, z + 25))} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, borderRadius: 6, color: 'var(--aps-fg)', cursor: 'pointer' }}><ZoomIn size={15} /></button>
          <button title="Zoom out" onClick={() => setZoom(z => Math.max(25, z - 25))}  style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, borderRadius: 6, color: 'var(--aps-fg)', cursor: 'pointer' }}><ZoomOut size={15} /></button>
          <button title="Fit"      onClick={() => setZoom(100)}                          style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, borderRadius: 6, color: 'var(--aps-fg)', cursor: 'pointer' }}><Maximize size={15} /></button>
          <div style={{ width: 1, height: 18, background: 'var(--aps-border)', margin: '0 4px' }} />
          {([
            { id: 'measure', Icon: Ruler,    title: 'Measure' },
            { id: 'section', Icon: Scissors, title: 'Section' },
            { id: 'markup',  Icon: PenTool,  title: 'Markup' },
          ] as const).map(({ id, Icon, title }) => (
            <button key={id} title={title} onClick={() => setTool(id)}
              style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tool === id ? 'var(--brand-blue-500)' : 'transparent', border: 0, borderRadius: 6, color: tool === id ? '#fff' : 'var(--aps-fg)', cursor: 'pointer' }}>
              <Icon size={15} />
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: 'var(--aps-border)', margin: '0 4px' }} />
          <button title="Settings"   style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, borderRadius: 6, color: 'var(--aps-fg)', cursor: 'pointer' }}><Settings2 size={15} /></button>
          <button title="Fullscreen" style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, borderRadius: 6, color: 'var(--aps-fg)', cursor: 'pointer' }}><Expand size={15} /></button>
        </div>

        {/* properties panel */}
        <aside style={{ position: 'absolute', top: 14, right: 14, bottom: 14, width: 240, background: 'var(--aps-panel)', backdropFilter: 'blur(10px)', border: '1px solid var(--aps-border)', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.3)', padding: '14px 14px 12px', zIndex: 3, color: 'var(--aps-fg)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--aps-fg-2)' }}>Drawing Properties</h4>
          <Prop k="File" v={drawing?.name ?? '—'} small />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Prop k="Revision" v={drawing?.rev ?? '—'} />
            <Prop k="Sheet" v="01 / 03" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Prop k="Scale" v="1 : 200" />
            <Prop k="Paper" v="A1" />
          </div>
          <hr style={{ width: '100%', border: 0, height: 1, background: 'var(--aps-border)', margin: '4px 0' }} />
          <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--aps-fg-2)' }}>Geometry</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Prop k="Units" v="mm" />
            <Prop k="Layers" v={`${layers.filter(l => l.on).length}/${layers.length}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Prop k="Width" v="594 mm" />
            <Prop k="Height" v="420 mm" />
          </div>
          <hr style={{ width: '100%', border: 0, height: 1, background: 'var(--aps-border)', margin: '4px 0' }} />
          <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--aps-fg-2)' }}>Audit Trail</h4>
          <Prop k="Uploaded" v={`${drawing?.when ?? '—'} · ${drawing?.by ?? '—'}`} small />
          <Prop k="Translation" v="✓ SVF ready" vColor="var(--accent-green)" small />
          <Prop k="Discipline" v={`${drawing?.discipline ?? '—'} · Block ${drawing?.block ?? '—'}`} small />
        </aside>

        {/* zoom HUD */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 3, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--aps-panel)', backdropFilter: 'blur(10px)', border: '1px solid var(--aps-border)', borderRadius: 8, padding: 4, color: 'var(--aps-fg)', fontFamily: 'var(--font-data)', fontSize: 11 }}>
          <button onClick={() => setZoom(z => Math.max(25, z - 25))} style={{ width: 24, height: 24, background: 'transparent', border: 0, borderRadius: 4, color: 'var(--aps-fg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
          <span style={{ padding: '0 8px', fontWeight: 600, minWidth: 42, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(400, z + 25))} style={{ width: 24, height: 24, background: 'transparent', border: 0, borderRadius: 4, color: 'var(--aps-fg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
          <div style={{ width: 1, height: 18, background: 'var(--aps-border)', margin: '0 2px' }} />
          <button onClick={() => setZoom(100)} title="Fit" style={{ width: 24, height: 24, background: 'transparent', border: 0, borderRadius: 4, color: 'var(--aps-fg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Maximize size={12} /></button>
        </div>

        {/* status strip */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 3, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--aps-panel)', backdropFilter: 'blur(10px)', border: '1px solid var(--aps-border)', borderRadius: 8, padding: '6px 12px', color: 'var(--aps-fg-2)', fontFamily: 'var(--font-data)', fontSize: 11 }}>
          <span style={{ color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} color="var(--accent-green)" /> SVF · Ready</span>
          <span>{tool.toUpperCase()}</span>
          <span>X: 412.7 mm · Y: 218.0 mm</span>
        </div>
      </div>
    </div>
  );
}

function Prop({ k, v, small, vColor }: { k: string; v: string; small?: boolean; vColor?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10.5, color: 'var(--aps-fg-2)', letterSpacing: '0.02em' }}>{k}</span>
      <span style={{ fontFamily: 'var(--font-data)', fontSize: small ? 11.5 : 12.5, color: vColor ?? 'var(--aps-fg)', fontWeight: 600 }}>{v}</span>
    </div>
  );
}

/* ─── Real APS viewer (loads Autodesk SDK from CDN) ─── */
function RealApsViewer({ drawing }: { drawing: DrawingRecord | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<InstanceType<NonNullable<Window['Autodesk']>['Viewing']['GuiViewer3D']> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!containerRef.current) return;

    const loadSdk = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Autodesk) { resolve(); return; }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Autodesk Viewer SDK'));
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        await loadSdk();

        const apiBase = import.meta.env.VITE_API_URL ?? '';
        const tokenRes = await fetch(`${apiBase}/aps/token`);
        const tokenData = await tokenRes.json() as { access_token?: string; mock?: true };

        if (tokenData.mock || !tokenData.access_token) {
          setStatus('error');
          return;
        }

        const { Autodesk } = window as Required<Window>;
        Autodesk.Viewing.Initializer(
          { env: 'AutodeskProduction2', api: 'streamingV2', accessToken: tokenData.access_token },
          () => {
            if (!containerRef.current) return;
            const viewer = new Autodesk.Viewing.GuiViewer3D(containerRef.current);
            viewerRef.current = viewer;
            viewer.start();
            setStatus('ready');

            if (drawing?.urn) {
              Autodesk.Viewing.Document.load(
                `urn:${drawing.urn}`,
                (doc: object) => {
                  const node = (doc as { getRoot: () => { getDefaultGeometry: () => object } }).getRoot().getDefaultGeometry();
                  viewer.loadDocumentNode(doc, node);
                },
                (code: number, msg: string) => console.error('APS load error', code, msg),
              );
            }
          },
        );
      } catch (e) {
        console.error('APS init failed', e);
        setStatus('error');
      }
    };

    init();

    return () => {
      viewerRef.current?.finish();
      viewerRef.current = null;
    };
  }, []);

  if (status === 'error') return null;

  return (
    <div ref={containerRef} style={{ flex: 1, minHeight: 540, position: 'relative', background: 'var(--aps-bg)' }}>
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#a4b0c4', background: 'var(--aps-bg)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,109,182,0.15)', color: '#7CC0FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cog size={32} color="#7CC0FF" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f3' }}>Loading APS Viewer…</span>
        </div>
      )}
    </div>
  );
}

/* ─── Public export ─── */
export function ApsViewer({ drawing, viewerState }: Props) {
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(100);

  const useRealViewer = Boolean(import.meta.env.VITE_APS_CLIENT_ID) && drawing?.urn;

  if (viewerState === 'empty') {
    return (
      <div style={{ flex: 1, minHeight: 540, position: 'relative', background: 'var(--aps-bg)', color: 'var(--aps-fg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: 32 }}>
        <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px', position: 'absolute', inset: 0 }} />
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,109,182,0.15)', color: '#7CC0FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <FileQuestion size={32} color="#7CC0FF" />
        </div>
        <h2 style={{ color: 'var(--aps-fg)', fontSize: 18, fontWeight: 700, margin: 0, position: 'relative', zIndex: 1 }}>No drawing selected</h2>
        <p style={{ fontSize: 13, maxWidth: 360, margin: 0, lineHeight: 1.5, color: 'var(--aps-fg-2)', position: 'relative', zIndex: 1 }}>
          Pick a drawing from the list, or upload a new .dwg to translate it with Autodesk Platform Services and preview it here.
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,109,182,0.18)', color: '#B7D5F4', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
          APS Viewer · ready
        </span>
      </div>
    );
  }

  if (viewerState === 'translating') {
    return (
      <div style={{ flex: 1, minHeight: 540, position: 'relative', background: 'var(--aps-bg)', color: 'var(--aps-fg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: 32 }}>
        <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px', position: 'absolute', inset: 0 }} />
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,109,182,0.15)', color: '#7CC0FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Cog size={32} color="#7CC0FF" />
        </div>
        <h2 style={{ color: 'var(--aps-fg)', fontSize: 18, fontWeight: 700, margin: 0, position: 'relative', zIndex: 1 }}>Translating drawing…</h2>
        <p style={{ fontSize: 13, maxWidth: 360, margin: 0, lineHeight: 1.5, color: 'var(--aps-fg-2)', position: 'relative', zIndex: 1 }}>
          Autodesk Platform Services is converting your DWG file into SVF for high-fidelity preview. This usually takes 30–90 seconds.
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,109,182,0.18)', color: '#B7D5F4', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
          <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#B7D5F4', borderRadius: '50%', animation: 'aps-spin .9s linear infinite' }} />
          APS · SVF translation in progress
        </span>
        <style>{`@keyframes aps-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (useRealViewer) {
    return <RealApsViewer drawing={drawing} />;
  }

  return (
    <MockViewer
      drawing={drawing}
      layers={layers}
      setLayers={setLayers}
      tool={tool}
      setTool={setTool}
      zoom={zoom}
      setZoom={setZoom}
    />
  );
}
