import { useState, useRef, useCallback } from 'react';
import {
  ScanSearch, Upload, Download, Loader2, CheckCircle2, Image as ImageIcon,
  Zap, AlertCircle, X,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import type { DetectionResult, DetectionSession } from '@/types';
import { cn } from '@/lib/utils';

const categories: Record<string, { color: string; label: string }> = {
  'Garbage Pile': { color: '#218838', label: 'Garbage Pile' },
  'Plastic Waste': { color: '#168C8C', label: 'Plastic Waste' },
  'Construction Debris': { color: '#D99A19', label: 'Construction Debris' },
  'Timber Scrap': { color: '#2563A6', label: 'Timber Scrap' },
  'Mixed Solid Waste': { color: '#C83E3E', label: 'Mixed Solid Waste' },
};

// Demo mode: generates plausible detection results
function generateDemoDetections(): DetectionResult[] {
  const configs = [
    { category: 'Garbage Pile' as const, bbox: { x: 15, y: 25, width: 35, height: 40 }, confidence: 96.8 },
    { category: 'Plastic Waste' as const, bbox: { x: 55, y: 35, width: 25, height: 28 }, confidence: 92.3 },
    { category: 'Mixed Solid Waste' as const, bbox: { x: 30, y: 60, width: 28, height: 22 }, confidence: 88.7 },
  ];
  return configs.map((c, i) => ({
    id: `DET-${Date.now()}-${i}`,
    ...c,
  }));
}

export function AIDetection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [processingTime, setProcessingTime] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [session, setSession] = useState<DetectionSession | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageName(file.name);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setResults(null);
    setStatus('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const analyze = () => {
    if (!imagePreview) return;
    setStatus('processing');
    setResults(null);
    const start = Date.now();
    setTimeout(() => {
      const demoResults = generateDemoDetections();
      setResults(demoResults);
      setStatus('completed');
      const elapsed = (Date.now() - start) / 1000;
      setProcessingTime(elapsed + 1.2);
      setSession({
        id: `SES-${Date.now()}`,
        imageUrl: imagePreview,
        results: demoResults,
        processedAt: new Date().toISOString(),
        processingTime: elapsed + 1.2,
        modelVersion: 'nagar-vision-v2.3',
        status: 'completed',
      });
      drawBoundingBoxes(demoResults);
    }, 2000);
  };

  const drawBoundingBoxes = (detections: DetectionResult[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      detections.forEach((det) => {
        const x = (det.bbox.x / 100) * img.width;
        const y = (det.bbox.y / 100) * img.height;
        const w = (det.bbox.width / 100) * img.width;
        const h = (det.bbox.height / 100) * img.height;
        ctx.strokeStyle = categories[det.category].color;
        ctx.lineWidth = Math.max(2, img.width / 300);
        ctx.strokeRect(x, y, w, h);
        const fontSize = Math.max(12, img.width / 35);
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const label = `${det.category} ${det.confidence.toFixed(1)}%`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = categories[det.category].color;
        ctx.fillRect(x, y - fontSize - 4, textWidth + 10, fontSize + 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 5, y - 4);
      });
    };
    img.src = imagePreview!;
  };

  const downloadAnnotated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotated-${imageName || 'image'}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const reset = () => {
    setImagePreview(null);
    setImageName('');
    setResults(null);
    setStatus('idle');
    setSession(null);
  };

  return (
    <div>
      <PageHeader
        title="AI Garbage Detection"
        description="Computer vision analysis for waste identification"
        icon={<ScanSearch className="w-5 h-5" />}
        actions={<Badge variant="amber" dot>DEMO MODE</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Image Input" subtitle="Upload or drag an image for analysis">
          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200',
                dragOver ? 'border-neon-emerald/50 bg-neon-emerald/5' : 'border-ink-700 hover:border-ink-600 hover:bg-ink-800/40',
              )}
            >
              <div className="w-16 h-16 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-gray-500" />
              </div>
              <p className="text-sm text-[#64748B] font-medium">Drop image here or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG · Max 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            </div>
          ) : (
            <div>
              <div className="relative rounded-lg overflow-hidden border border-ink-700 bg-ink-950">
                {status === 'completed' && results ? (
                  <canvas ref={canvasRef} className="w-full h-auto" />
                ) : (
                  <img src={imagePreview} alt="Upload" className="w-full h-auto" />
                )}
                {status === 'processing' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-neon-emerald animate-spin mb-3" />
                    <p className="text-sm text-[#64748B]">Analyzing image...</p>
                    <p className="text-xs text-gray-500 mt-1">Running inference model v2.3</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-2.5 py-1 rounded-md border border-ink-700">
                  <span className="text-xs text-gray-400 truncate max-w-[200px]">{imageName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {status === 'idle' && (
                  <button
                    onClick={analyze}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Analyze Image
                  </button>
                )}
                {status === 'completed' && (
                  <button
                    onClick={downloadAnnotated}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Annotated
                  </button>
                )}
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-800/60 border border-ink-700 text-gray-400 text-sm hover:bg-ink-800/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Detection Results" subtitle={status === 'completed' ? `${results?.length || 0} objects detected` : 'Awaiting analysis'}>
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">Upload an image and run analysis to see results</p>
            </div>
          )}
          {status === 'processing' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Loader2 className="w-8 h-8 text-neon-emerald animate-spin mb-3" />
              <p className="text-sm text-[#64748B]">Processing detections...</p>
            </div>
          )}
          {status === 'completed' && results && (
            <div className="space-y-3">
              {session && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                    <p className="text-xs text-gray-500">Processing Time</p>
                    <p className="text-sm font-mono text-[#263445] mt-1">{processingTime.toFixed(2)}s</p>
                  </div>
                  <div className="bg-ink-800/40 rounded-lg p-3 border border-ink-700/60">
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-sm font-mono text-[#263445] mt-1">{session.modelVersion}</p>
                  </div>
                </div>
              )}

              {results.map((det, i) => {
                const cat = categories[det.category];
                return (
                  <div key={det.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/40 border border-ink-700/60 hover:border-ink-700 transition-colors animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#263445]">{cat.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Position: {det.bbox.x.toFixed(0)}, {det.bbox.y.toFixed(0)} · Size: {det.bbox.width.toFixed(0)} × {det.bbox.height.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: cat.color }} />
                        <span className="text-sm font-mono font-bold" style={{ color: cat.color }}>
                          {det.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-20 h-1 bg-ink-700 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${det.confidence}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 p-3 rounded-lg bg-neon-amber/5 border border-neon-amber/15 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  <span className="text-neon-amber font-medium">Demo Mode:</span> These are sample predictions generated for demonstration purposes, not actual AI analysis. Connect a Python FastAPI backend for real detections.
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="API Integration Layer" subtitle="For future Python FastAPI backend connection">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-700/60">
              <p className="text-xs text-gray-500 mb-1">Detection Endpoint</p>
              <p className="text-sm font-mono text-neon-cyan">POST /api/v1/detect</p>
            </div>
            <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-700/60">
              <p className="text-xs text-gray-500 mb-1">Model Status</p>
              <p className="text-sm font-mono text-neon-emerald">nagar-vision-v2.3 (demo)</p>
            </div>
            <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-700/60">
              <p className="text-xs text-gray-500 mb-1">Supported Categories</p>
              <p className="text-sm text-[#64748B]">5 waste types</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
