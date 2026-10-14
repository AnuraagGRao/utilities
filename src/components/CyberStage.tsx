"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CyberStage: Bespoke 3D WebGL stage for utils.anuraaggrao.com.
 * Inspired by Emmanuel Wilson's scroll-flight architecture.
 * Features a glowing cybernetic hex matrix, floating AST data cubes,
 * and an lerped camera flight synchronized with document scroll depth.
 */
export function CyberStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL unavailable fallback
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x090d16, 8, 70);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 0, 14);

    // 1. Perspective Hex Floor & Ceiling Grid
    const gridHelper = new THREE.GridHelper(90, 45, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    const ceilingHelper = new THREE.GridHelper(90, 45, 0x8b5cf6, 0x0f172a);
    ceilingHelper.position.y = 8;
    scene.add(ceilingHelper);

    // 2. Floating Data Cubes & Hex Gateways
    const cubesGroup = new THREE.Group();
    const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const cubeInstances: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number } }[] = [];
    for (let i = 0; i < 35; i++) {
      const mesh = new THREE.Mesh(cubeGeo, cubeMat);
      mesh.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 12,
        -Math.random() * 50
      );
      cubesGroup.add(mesh);
      cubeInstances.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
        },
      });
    }
    scene.add(cubesGroup);

    // 3. Glowing Hexagonal Conduit Arches along flight path
    const archGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(5.2, 5.3, 6);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });

    const arches: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const arch = new THREE.Mesh(ringGeo, ringMat);
      arch.position.set(0, 0, -i * 9);
      archGroup.add(arch);
      arches.push(arch);
    }
    scene.add(archGroup);

    // Ambient dust points
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 35;
      dustPos[i + 1] = (Math.random() - 0.5) * 16;
      dustPos[i + 2] = -Math.random() * 60;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.09,
      transparent: true,
      opacity: 0.5,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Dynamic Camera Tracking & Lerp
    let mouseX = 0;
    let mouseY = 0;
    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    let targetZ = 14;
    let targetY = 0;
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      // Camera flies down the z conduit from +14 down to -32
      targetZ = 14 - progress * 46;
      targetY = -progress * 4.5;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp camera toward target
      camera.position.z += (targetZ - camera.position.z) * 0.07;
      camera.position.y += (targetY - camera.position.y) * 0.07;

      // Pointer parallax
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
      camera.lookAt(0, camera.position.y - 0.5, camera.position.z - 15);

      // Rotate data cubes
      cubeInstances.forEach(({ mesh, rotSpeed }) => {
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
      });

      // Subtle pulse on conduit arches
      arches.forEach((arch, idx) => {
        arch.rotation.z = Math.sin(elapsed * 0.5 + idx) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      gridHelper.geometry.dispose();
      ceilingHelper.geometry.dispose();
      cubeGeo.dispose();
      cubeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
      aria-hidden="true"
    />
  );
}
