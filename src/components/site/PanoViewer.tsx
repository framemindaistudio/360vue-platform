"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Move, Pause, Play } from "lucide-react";
import type { Mesh, MeshBasicMaterial } from "three";
import { cn } from "@/lib/utils";

export interface PanoScene {
  id: string;
  label: string;
  src: string;
  /** small image shown while the full panorama loads */
  preview?: string;
  /** the panorama's horizontal coverage in degrees (360 for a full wrap) */
  hfov?: number;
}

/**
 * A light 360° panorama viewer: the image is wrapped inside a sphere (only the vertical band the image covers),
 * and the camera sits in the middle. Drag or swipe to look around, wheel or pinch to zoom, and it turns by itself
 * until someone touches it. three.js is loaded only when the viewer is on screen.
 */
export function PanoViewer({ scenes, className, initial = 0, autoRotate = true, compact = false }: { scenes: PanoScene[]; className?: string; initial?: number; autoRotate?: boolean; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ load: (s: PanoScene) => void; setSpin: (on: boolean) => void; dispose: () => void } | null>(null);
  const [active, setActive] = useState(initial);
  const [ready, setReady] = useState(false);
  const [spin, setSpin] = useState(autoRotate);
  const [hint, setHint] = useState(true);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let started = false;

    const start = async () => {
      if (started) return;
      started = true;
      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none;cursor:grab";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(compact ? 80 : 75, 1, 0.1, 100);
      let mesh: Mesh | null = null;
      let vMax = 60; // how far up/down the image reaches, in degrees from the horizon

      let lon = 180; // start facing the middle of the image, away from where its edges meet
      let lat = 0;
      let fov = camera.fov;
      let spinning = autoRotate;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let idleSince = performance.now();
      const pointers = new Map<number, { x: number; y: number }>();
      let pinchFrom = 0;

      const loader = new THREE.TextureLoader();
      const load = (s: PanoScene) => {
        setReady(false);
        loader.load(s.src, (tex) => {
          if (disposed) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          const img = tex.image as { width: number; height: number };
          const h = s.hfov ?? 360;
          const vfov = Math.min(180, (h * img.height) / img.width);
          vMax = vfov / 2;
          const theta = THREE.MathUtils.degToRad(90 - vfov / 2);
          const geo = new THREE.SphereGeometry(10, 96, 64, 0, THREE.MathUtils.degToRad(h), theta, THREE.MathUtils.degToRad(vfov));
          geo.scale(-1, 1, 1);
          const mat = new THREE.MeshBasicMaterial({ map: tex });
          if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as MeshBasicMaterial).map?.dispose();
            (mesh.material as MeshBasicMaterial).dispose();
          }
          mesh = new THREE.Mesh(geo, mat);
          scene.add(mesh);
          lat = 0;
          lon = 180;
          setReady(true);
        });
      };

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const canvas = renderer.domElement;
      const down = (e: PointerEvent) => {
        canvas.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinchFrom = Math.hypot(a.x - b.x, a.y - b.y);
        }
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = "grabbing";
        setHint(false);
        idleSince = performance.now();
      };
      const move = (e: PointerEvent) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchFrom) fov = THREE.MathUtils.clamp(fov * (pinchFrom / d), 35, 95);
          pinchFrom = d;
          return;
        }
        if (!dragging) return;
        const k = (fov / 75) * 0.18;
        lon -= (e.clientX - lastX) * k;
        lat += (e.clientY - lastY) * k;
        lastX = e.clientX;
        lastY = e.clientY;
        idleSince = performance.now();
      };
      const up = (e: PointerEvent) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchFrom = 0;
        if (!pointers.size) {
          dragging = false;
          canvas.style.cursor = "grab";
        }
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        fov = THREE.MathUtils.clamp(fov + e.deltaY * 0.04, 35, 95);
        setHint(false);
      };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("wheel", wheel, { passive: false });

      let raf = 0;
      let visible = true;
      const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.01 });
      io.observe(el);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        if (spinning && !reduce && !dragging && performance.now() - idleSince > 2500) lon += 0.035;
        camera.fov += (fov - camera.fov) * 0.15;
        camera.updateProjectionMatrix();
        const limit = Math.max(0, vMax - camera.fov / 2 - 1);
        lat = THREE.MathUtils.clamp(lat, -limit, limit);
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        camera.lookAt(10 * Math.sin(phi) * Math.cos(theta), 10 * Math.cos(phi), 10 * Math.sin(phi) * Math.sin(theta));
        renderer.render(scene, camera);
      };
      tick();

      api.current = {
        load,
        setSpin: (on) => {
          spinning = on;
          idleSince = 0;
        },
        dispose: () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          canvas.removeEventListener("pointerdown", down);
          canvas.removeEventListener("pointermove", move);
          canvas.removeEventListener("pointerup", up);
          canvas.removeEventListener("pointercancel", up);
          canvas.removeEventListener("wheel", wheel);
          if (mesh) {
            mesh.geometry.dispose();
            (mesh.material as MeshBasicMaterial).map?.dispose();
            (mesh.material as MeshBasicMaterial).dispose();
          }
          renderer.dispose();
          canvas.remove();
        },
      };
      load(scenes[initial] ?? scenes[0]);
    };

    // start when the viewer comes near the screen, so the page loads fast
    const near = new IntersectionObserver(([en]) => en.isIntersecting && start(), { rootMargin: "300px" });
    near.observe(el);
    return () => {
      disposed = true;
      near.disconnect();
      api.current?.dispose();
      api.current = null;
    };
    // the viewer is set up once; scene changes go through api.current.load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === host.current?.parentElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const choose = (i: number) => {
    setActive(i);
    api.current?.load(scenes[i]);
  };
  const toggleSpin = () => {
    setSpin((v) => {
      api.current?.setSpin(!v);
      return !v;
    });
  };
  const toggleFull = () => {
    const box = host.current?.parentElement;
    if (!box) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else box.requestFullscreen?.().catch(() => {});
  };

  const scene = scenes[active];
  return (
    <div className={cn("relative isolate overflow-hidden bg-night", className)}>
      {/* preview until the panorama is in */}
      {scene.preview && !ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={scene.preview} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-md" aria-hidden />
      )}
      <div ref={host} className="absolute inset-0" role="img" aria-label={`360° view: ${scene.label}. Drag to look around.`} />

      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="rounded-full border border-cream/20 bg-midnight/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cream/80 backdrop-blur">Loading 360°…</span>
        </div>
      )}

      {hint && ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2 rounded-full border border-cream/25 bg-midnight/55 px-4 py-2 text-xs font-semibold text-cream backdrop-blur">
            <Move className="size-4 text-sunset" aria-hidden /> Drag to look around
          </span>
        </div>
      )}

      {/* controls */}
      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
        {scenes.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 rounded-full border border-cream/15 bg-midnight/60 p-1 backdrop-blur">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => choose(i)}
                className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", i === active ? "bg-sunset text-midnight" : "text-cream/80 hover:text-cream")}
                aria-pressed={i === active}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5">
          <button type="button" onClick={toggleSpin} className="grid size-9 place-items-center rounded-full border border-cream/15 bg-midnight/60 text-cream backdrop-blur hover:text-sunset" aria-label={spin ? "Stop turning" : "Turn by itself"}>
            {spin ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <button type="button" onClick={toggleFull} className="grid size-9 place-items-center rounded-full border border-cream/15 bg-midnight/60 text-cream backdrop-blur hover:text-sunset" aria-label={full ? "Exit full screen" : "Full screen"}>
            {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export const DEMO_SCENES: PanoScene[] = [
  { id: "restaurant", label: "Restaurant", src: "/media/pano-restaurant.webp", preview: "/media/pano-restaurant-sm.webp" },
  { id: "lobby", label: "Hotel lobby", src: "/media/pano-lobby.webp", preview: "/media/pano-lobby-sm.webp" },
];
