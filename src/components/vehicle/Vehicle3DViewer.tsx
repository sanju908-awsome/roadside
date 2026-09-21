import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Vehicle, VehicleType } from '../../types';
import {
  Activity,
  Battery,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  Gauge,
  Info,
  Lightbulb,
  Maximize2,
  Palette,
  RotateCw,
  Sparkles,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface Vehicle3DViewerProps {
  vehicle: Vehicle | null;
  interactive?: boolean;
  height?: number | string;
  autoRotateSpeed?: number;
  showControls?: boolean;
}

export const Vehicle3DViewer: React.FC<Vehicle3DViewerProps> = ({
  vehicle,
  interactive = true,
  height = 360,
  autoRotateSpeed = 0.005,
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Interactive 3D vehicle feature states
  const [viewMode, setViewMode] = useState<'3d' | 'real_photo'>('3d');
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<'battery' | 'tyres' | 'engine' | null>(null);
  const [customColor, setCustomColor] = useState<string>(vehicle?.color || '#1E293B');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const headlightBeamLightsRef = useRef<THREE.SpotLight[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const rotationTarget = useRef({ x: 0.18, y: 0.8 });
  const rotationCurrent = useRef({ x: 0.18, y: 0.8 });
  const zoomLevel = useRef(5.4);
  const previousMouse = useRef({ x: 0, y: 0 });

  const vehicleType: VehicleType = vehicle?.type || 'Car';

  // Realistic automotive color options
  const colorPalette = [
    { name: 'Obsidian Black', hex: '#111827' },
    { name: 'Daytona Grey', hex: '#4B5563' },
    { name: 'Alpine Pearl White', hex: '#F3F4F6' },
    { name: 'Metallic Crimson', hex: '#E23744' },
    { name: 'Royal Electric Blue', hex: '#1D4ED8' },
    { name: 'Emerald British Green', hex: '#065F46' },
  ];

  // Real-life high definition car imagery for realistic fallback & photo gallery
  const realCarPhotos: Record<string, string> = {
    Car: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    SUV: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85',
    Bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85',
    Van: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=85',
    Truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=85',
  };

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    try {
      const width = container.clientWidth || 480;
      const h = typeof height === 'number' ? height : container.clientHeight || 360;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera with realistic focal depth
      const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
      camera.position.set(0, 2.3, zoomLevel.current);
      camera.lookAt(0, 0.45, 0);
      cameraRef.current = camera;

      // 3. Renderer with high performance & tone mapping
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      rendererRef.current = renderer;

      // 4. Realistic Studio Automotive Lighting
      // Soft ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      scene.add(ambientLight);

      // Key overhead light with shadow
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(6, 9, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      // Cool rim light for metallic contour reflections
      const rimLight = new THREE.DirectionalLight(0xe0f2fe, 1.8);
      rimLight.position.set(-6, 5, -5);
      scene.add(rimLight);

      // Ground bounce fill light
      const bounceLight = new THREE.DirectionalLight(0xf8fafc, 0.7);
      bounceLight.position.set(0, -4, 3);
      scene.add(bounceLight);

      // Shadow floor plane
      const floorGeo = new THREE.PlaneGeometry(24, 24);
      const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.01;
      floor.receiveShadow = true;
      scene.add(floor);

      // Studio dark circular turntable base
      const stageGeo = new THREE.CylinderGeometry(2.7, 2.8, 0.04, 64);
      const stageMat = new THREE.MeshStandardMaterial({
        color: 0x182030,
        metalness: 0.7,
        roughness: 0.3,
      });
      const stage = new THREE.Mesh(stageGeo, stageMat);
      stage.position.y = -0.02;
      stage.receiveShadow = true;
      scene.add(stage);

      // Red edge accent ring for Zomato / ROAD//SIDE aesthetic
      const accentRingGeo = new THREE.RingGeometry(2.65, 2.7, 64);
      const accentRingMat = new THREE.MeshBasicMaterial({
        color: 0xe23744,
        side: THREE.DoubleSide,
      });
      const accentRing = new THREE.Mesh(accentRingGeo, accentRingMat);
      accentRing.rotation.x = -Math.PI / 2;
      accentRing.position.y = 0.005;
      scene.add(accentRing);

      // 5. Build Procedural Realistic 3D Vehicle
      const vehicleGroup = buildRealisticVehicle(vehicleType, customColor, headlightsOn);
      scene.add(vehicleGroup);
      vehicleGroupRef.current = vehicleGroup;

      // Real Spotlight beams for Headlights
      const spotLeft = new THREE.SpotLight(0xecfeff, 3.5, 9, Math.PI / 5, 0.4, 1);
      spotLeft.position.set(-0.65, 0.65, 1.9);
      spotLeft.target.position.set(-0.8, 0, 7);
      scene.add(spotLeft);
      scene.add(spotLeft.target);

      const spotRight = new THREE.SpotLight(0xecfeff, 3.5, 9, Math.PI / 5, 0.4, 1);
      spotRight.position.set(0.65, 0.65, 1.9);
      spotRight.target.position.set(0.8, 0, 7);
      scene.add(spotRight);
      scene.add(spotRight.target);

      headlightBeamLightsRef.current = [spotLeft, spotRight];

      // Animation Loop
      let isRunning = true;
      const animate = () => {
        if (!isRunning) return;

        if (vehicleGroupRef.current) {
          if (!isDragging) {
            rotationTarget.current.y += autoRotateSpeed;
          }

          // Smooth rotation damping
          rotationCurrent.current.x += (rotationTarget.current.x - rotationCurrent.current.x) * 0.08;
          rotationCurrent.current.y += (rotationTarget.current.y - rotationCurrent.current.y) * 0.08;

          vehicleGroupRef.current.rotation.y = rotationCurrent.current.y;
          vehicleGroupRef.current.rotation.x = rotationCurrent.current.x;

          // Camera zoom smoothing
          if (cameraRef.current) {
            cameraRef.current.position.z +=
              (zoomLevel.current - cameraRef.current.position.z) * 0.1;
          }
        }

        renderer.render(scene, camera);
        animFrameIdRef.current = requestAnimationFrame(animate);
      };

      animate();

      // Responsive Resize Observer
      const resizeObserver = new ResizeObserver(() => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth;
        const newH = typeof height === 'number' ? height : container.clientHeight;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      });
      resizeObserver.observe(container);

      return () => {
        isRunning = false;
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        resizeObserver.disconnect();
        renderer.dispose();
      };
    } catch (err) {
      console.warn('ThreeJS context initialization:', err);
    }
  }, [viewMode, vehicleType, height, autoRotateSpeed]);

  // Update vehicle on color or headlights toggle
  useEffect(() => {
    if (sceneRef.current && vehicleGroupRef.current) {
      sceneRef.current.remove(vehicleGroupRef.current);
      const newGroup = buildRealisticVehicle(vehicleType, customColor, headlightsOn);
      sceneRef.current.add(newGroup);
      vehicleGroupRef.current = newGroup;

      headlightBeamLightsRef.current.forEach((spot) => {
        spot.intensity = headlightsOn ? 3.5 : 0;
      });
    }
  }, [customColor, headlightsOn, vehicleType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !isDragging) return;
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;

    rotationTarget.current.y += deltaX * 0.01;
    rotationTarget.current.x = Math.max(
      -0.2,
      Math.min(0.55, rotationTarget.current.x + deltaY * 0.008)
    );

    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    zoomLevel.current = Math.max(4.0, Math.min(8.0, zoomLevel.current + e.deltaY * 0.003));
  };

  const resetAngle = () => {
    rotationTarget.current = { x: 0.18, y: 0.8 };
    zoomLevel.current = 5.4;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-xl">
      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Title & Brand */}
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-white flex items-center gap-2 shadow-lg pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E23744] animate-pulse" />
          <div>
            <span className="text-xs font-black tracking-wide block font-heading">
              {vehicle?.brand} {vehicle?.model}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {vehicle?.registrationNumber || 'AP 16 AB 1234'} • {vehicle?.fuelType}
            </span>
          </div>
        </div>

        {/* View Switcher: 3D Studio vs Real Photo */}
        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '3d'
                ? 'bg-[#E23744] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Realistic 3D Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('real_photo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'real_photo'
                ? 'bg-[#E23744] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>HD Real Photo</span>
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Display */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {viewMode === '3d' ? (
          <canvas ref={canvasRef} className="w-full h-full block" />
        ) : (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
            <img
              src={realCarPhotos[vehicleType] || realCarPhotos.Car}
              alt={`${vehicle?.brand} ${vehicle?.model} Real Vehicle`}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white pointer-events-none">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 block">
                Genuine Roadside Fleet Showcase
              </span>
              <h4 className="text-xl font-bold font-heading">
                {vehicle?.brand} {vehicle?.model}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Certified vehicle profile linked to roadside dispatch radar. Ready for jumpstart, puncture, or towing assist.
              </p>
            </div>
          </div>
        )}

        {/* 3D Hotspot Diagnostic Bubbles */}
        {viewMode === '3d' && (
          <div className="absolute inset-x-4 top-16 flex items-center justify-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'battery' ? null : 'battery')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                activeHotspot === 'battery'
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                  : 'bg-slate-900/70 border-white/20 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Battery className="w-3.5 h-3.5" />
              <span>12V Battery Diagnostic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'tyres' ? null : 'tyres')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                activeHotspot === 'tyres'
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black'
                  : 'bg-slate-900/70 border-white/20 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>TPMS Tyre PSI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'engine' ? null : 'engine')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                activeHotspot === 'engine'
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                  : 'bg-slate-900/70 border-white/20 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Engine Status</span>
            </button>
          </div>
        )}

        {/* Hotspot Floating Detail Overlay */}
        {activeHotspot && viewMode === '3d' && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-80 bg-slate-900/95 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white text-xs shadow-2xl z-30 animate-scaleUp">
            {activeHotspot === 'battery' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Battery className="w-4 h-4" /> Battery Telemetry
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">12.6V Good</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <p>• Cold Cranking Amps: 580 CCA (Healthy)</p>
                  <p>• Terminal Corrosion: Zero detected</p>
                  <p>• Onsite Jumpstart Compatibility: 100% Guaranteed</p>
                </div>
              </div>
            )}
            {activeHotspot === 'tyres' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4" /> Tyre Pressure Monitoring
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px]">33 PSI Normal</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <p>• Front Left / Right: 33.2 PSI • 33.0 PSI</p>
                  <p>• Rear Left / Right: 32.8 PSI • 33.1 PSI</p>
                  <p>• Spare Tyre: Included in trunk</p>
                </div>
              </div>
            )}
            {activeHotspot === 'engine' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Engine & Powertrain
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">Normal</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <p>• Coolant Temperature: 88°C (Nominal)</p>
                  <p>• Engine Oil Level: High / Clean</p>
                  <p>• OBD-II Fault Codes: Zero active DTCs</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Interactive HUD Bar */}
        {viewMode === '3d' && showControls && (
          <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
            {/* Paint Finish Selector */}
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-300 mr-1 hidden sm:inline">Finish:</span>
              <div className="flex items-center gap-1.5">
                {colorPalette.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    onClick={() => setCustomColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                      customColor === c.hex ? 'border-[#E23744] scale-110 shadow-sm' : 'border-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Headlights & Camera controls */}
            <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg text-slate-300">
              <button
                type="button"
                onClick={() => setHeadlightsOn(!headlightsOn)}
                className={`p-1.5 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
                  headlightsOn ? 'text-amber-300 bg-amber-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle LED Headlights"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-[11px]">LED Lights</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={resetAngle}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Reset View Angle"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => (zoomLevel.current = Math.max(4.0, zoomLevel.current - 0.4))}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => (zoomLevel.current = Math.min(8.0, zoomLevel.current + 0.4))}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Procedurally generates realistic automotive 3D vehicle geometries
 * using physically-based materials (MeshPhysicalMaterial) for authentic
 * automotive clearcoat lacquer, realistic curved cabin, LED projectors, and alloy wheels.
 */
function buildRealisticVehicle(type: VehicleType, bodyColorHex: string, headlightsOn: boolean): THREE.Group {
  const group = new THREE.Group();

  const bodyColor = new THREE.Color(bodyColorHex || '#1E293B');

  // 1. Realistic Automotive Lacquer Material
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.85,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.95,
    ior: 1.52,
  });

  // 2. High-end Automotive Tinted Glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.65,
    transparent: true,
    opacity: 0.82,
    ior: 1.5,
  });

  // 3. Brushed Chrome & Aluminum
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1,
  });

  // 4. Performance Rubber Tyre Material
  const tyreMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.1,
  });

  // 5. Brembo Red Caliper
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xe23744,
    roughness: 0.3,
    metalness: 0.6,
  });

  // 6. LED Headlight Materials
  const ledGlowMat = new THREE.MeshBasicMaterial({
    color: headlightsOn ? 0xf0fdfa : 0x64748b,
  });

  const tailLedMat = new THREE.MeshBasicMaterial({
    color: 0xff2222,
  });

  if (type === 'Bike') {
    // Realistic Modern Touring Motorcycle
    // Trellis Frame
    const frameGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.6);
    const frameMesh = new THREE.Mesh(frameGeo, chromeMat);
    frameMesh.rotation.z = Math.PI / 4.2;
    frameMesh.position.set(0, 0.7, 0);
    group.add(frameMesh);

    // Sculpted Ergonomic Fuel Tank
    const tankGeo = new THREE.SphereGeometry(0.32, 24, 24);
    tankGeo.scale(1.3, 0.85, 0.8);
    const tank = new THREE.Mesh(tankGeo, paintMat);
    tank.position.set(0.1, 0.95, 0);
    group.add(tank);

    // Leather Saddle
    const seatGeo = new THREE.BoxGeometry(0.7, 0.12, 0.3);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(-0.4, 0.9, 0);
    group.add(seat);

    // Engine Block
    const engineGeo = new THREE.BoxGeometry(0.55, 0.45, 0.35);
    const engineMesh = new THREE.Mesh(engineGeo, chromeMat);
    engineMesh.position.set(0, 0.45, 0);
    group.add(engineMesh);

    // Chrome Exhaust
    const exhaustGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.2);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.rotation.z = Math.PI / 2.3;
    exhaust.position.set(-0.35, 0.35, 0.22);
    group.add(exhaust);

    // Wheels with Alloy Spokes
    const addBikeWheel = (x: number) => {
      const wheelGroup = new THREE.Group();
      const tyreGeo = new THREE.TorusGeometry(0.38, 0.08, 16, 32);
      const tyre = new THREE.Mesh(tyreGeo, tyreMat);
      wheelGroup.add(tyre);

      const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, chromeMat);
      wheelGroup.add(hub);

      wheelGroup.position.set(x, 0.38, 0);
      group.add(wheelGroup);
    };

    addBikeWheel(0.95);
    addBikeWheel(-0.95);

    // LED Projector Headlight
    const headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    headlightGeo.rotateZ(Math.PI / 2);
    const headlight = new THREE.Mesh(headlightGeo, ledGlowMat);
    headlight.position.set(1.05, 1.05, 0);
    group.add(headlight);

    return group;
  }

  // ================= Realistic Modern Car / SUV Architecture =================
  const isSUV = type === 'SUV';
  const carLength = isSUV ? 4.1 : 4.0;
  const carWidth = isSUV ? 1.9 : 1.8;
  const bodyHeight = isSUV ? 0.95 : 0.72;
  const groundClearance = isSUV ? 0.42 : 0.32;

  // 1. Lower Sculpted Monocoque Chassis
  const lowerBodyGeo = new THREE.BoxGeometry(carLength, bodyHeight * 0.65, carWidth);
  const lowerBody = new THREE.Mesh(lowerBodyGeo, paintMat);
  lowerBody.position.set(0, groundClearance + (bodyHeight * 0.65) / 2, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  group.add(lowerBody);

  // 2. Sculpted Hood Rake & Front Nose
  const noseGeo = new THREE.CylinderGeometry(carWidth / 2, carWidth / 2.05, 0.8, 32);
  noseGeo.rotateZ(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, paintMat);
  nose.scale.set(0.6, 1, 0.9);
  nose.position.set(carLength / 2 - 0.2, groundClearance + 0.28, 0);
  group.add(nose);

  // 3. Aerodynamic Hexagonal Mesh Grille
  const grilleGeo = new THREE.BoxGeometry(0.08, 0.32, carWidth * 0.6);
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9, metalness: 0.3 });
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.set(carLength / 2 + 0.02, groundClearance + 0.26, 0);
  group.add(grille);

  // Chrome Grille Surround
  const chromeTrimGeo = new THREE.BoxGeometry(0.1, 0.04, carWidth * 0.64);
  const chromeTrim = new THREE.Mesh(chromeTrimGeo, chromeMat);
  chromeTrim.position.set(carLength / 2 + 0.03, groundClearance + 0.44, 0);
  group.add(chromeTrim);

  // 4. Aerodynamic Cabin Greenhouse (Windshield, Roof, Windows)
  const cabinLength = isSUV ? 2.5 : 2.2;
  const cabinHeight = isSUV ? 0.75 : 0.62;
  const cabinWidth = carWidth * 0.84;

  const cabinGeo = new THREE.BoxGeometry(cabinLength, cabinHeight, cabinWidth);
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(-0.15, groundClearance + bodyHeight * 0.65 + cabinHeight / 2 - 0.05, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Roof Shell
  const roofGeo = new THREE.BoxGeometry(cabinLength * 0.95, 0.06, cabinWidth * 0.96);
  const roof = new THREE.Mesh(roofGeo, paintMat);
  roof.position.set(-0.15, groundClearance + bodyHeight * 0.65 + cabinHeight - 0.02, 0);
  group.add(roof);

  // Panoramic Sunroof Glass on Roof
  const sunroofGeo = new THREE.BoxGeometry(1.2, 0.07, cabinWidth * 0.7);
  const sunroof = new THREE.Mesh(sunroofGeo, glassMat);
  sunroof.position.set(-0.1, groundClearance + bodyHeight * 0.65 + cabinHeight - 0.015, 0);
  group.add(sunroof);

  // Slanted Windshield Frame Pillar
  const aPillarGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.8);
  const aPillarLeft = new THREE.Mesh(aPillarGeo, paintMat);
  aPillarLeft.rotation.z = -Math.PI / 4.5;
  aPillarLeft.position.set(cabinLength / 2 - 0.1, groundClearance + 0.7, cabinWidth / 2 - 0.02);
  group.add(aPillarLeft);

  const aPillarRight = new THREE.Mesh(aPillarGeo, paintMat);
  aPillarRight.rotation.z = -Math.PI / 4.5;
  aPillarRight.position.set(cabinLength / 2 - 0.1, groundClearance + 0.7, -cabinWidth / 2 + 0.02);
  group.add(aPillarRight);

  // 5. Dual LED Projector Headlights
  const headlightGeo = new THREE.BoxGeometry(0.12, 0.12, 0.32);
  const hlLeft = new THREE.Mesh(headlightGeo, ledGlowMat);
  hlLeft.position.set(carLength / 2 - 0.05, groundClearance + 0.38, carWidth / 2 - 0.28);
  group.add(hlLeft);

  const hlRight = new THREE.Mesh(headlightGeo, ledGlowMat);
  hlRight.position.set(carLength / 2 - 0.05, groundClearance + 0.38, -carWidth / 2 + 0.28);
  group.add(hlRight);

  // 6. Modern Continuous LED Tail Light Bar
  const tailBarGeo = new THREE.BoxGeometry(0.08, 0.09, carWidth * 0.88);
  const tailBar = new THREE.Mesh(tailBarGeo, tailLedMat);
  tailBar.position.set(-carLength / 2 - 0.01, groundClearance + 0.42, 0);
  group.add(tailBar);

  // 7. Aerodynamic Side Mirrors
  const mirrorGeo = new THREE.BoxGeometry(0.18, 0.1, 0.14);
  const mirrorLeft = new THREE.Mesh(mirrorGeo, paintMat);
  mirrorLeft.position.set(0.7, groundClearance + 0.62, carWidth / 2 + 0.1);
  group.add(mirrorLeft);

  const mirrorRight = new THREE.Mesh(mirrorGeo, paintMat);
  mirrorRight.position.set(0.7, groundClearance + 0.62, -carWidth / 2 - 0.1);
  group.add(mirrorRight);

  // 8. Realistic 5-Twin Spoke Alloy Wheels with Brake Rotors
  const wheelRadius = isSUV ? 0.42 : 0.36;
  const wheelWidth = 0.26;

  const createRealisticWheel = (x: number, z: number) => {
    const wheelGroup = new THREE.Group();

    // Rubber Tyre with Radial Rim
    const tyreGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
    tyreGeo.rotateX(Math.PI / 2);
    const tyre = new THREE.Mesh(tyreGeo, tyreMat);
    tyre.castShadow = true;
    wheelGroup.add(tyre);

    // Machined Alloy Rim Face
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.72, wheelRadius * 0.72, wheelWidth + 0.01, 16);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheelGroup.add(rim);

    // Disc Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, wheelWidth - 0.04, 16);
    rotorGeo.rotateX(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    wheelGroup.add(rotor);

    // Brembo Red Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.12, 0.18, wheelWidth - 0.02);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(wheelRadius * 0.28, wheelRadius * 0.25, 0);
    wheelGroup.add(caliper);

    wheelGroup.position.set(x, wheelRadius, z);
    group.add(wheelGroup);
  };

  const frontX = carLength * 0.32;
  const rearX = -carLength * 0.32;
  const trackZ = carWidth / 2 + 0.02;

  createRealisticWheel(frontX, trackZ);
  createRealisticWheel(frontX, -trackZ);
  createRealisticWheel(rearX, trackZ);
  createRealisticWheel(rearX, -trackZ);

  // 9. Dual Chrome Exhaust Tips at Rear
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);
  exhaustGeo.rotateZ(Math.PI / 2);
  const exhaustLeft = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaustLeft.position.set(-carLength / 2 - 0.05, groundClearance + 0.08, 0.45);
  group.add(exhaustLeft);

  const exhaustRight = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaustRight.position.set(-carLength / 2 - 0.05, groundClearance + 0.08, -0.45);
  group.add(exhaustRight);

  return group;
}
