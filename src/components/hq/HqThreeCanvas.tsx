"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

export interface LiveAgentNode {
  id: string;
  codeName: string;
  name: string;
  department: string;
  role: string;
  orbitRing: 1 | 2 | 3;
  capabilities: string[];
  permissions: string[];
  sampleWorkflow: string;
  status: string;
  tasksCompleted: number;
  tasksFailed: number;
  activeTask: string | null;
}

interface HqThreeCanvasProps {
  agents: LiveAgentNode[];
  selectedAgentId: string;
  onSelectAgent: (agent: LiveAgentNode) => void;
  activeTransfer: { fromId: string; toId: string; label: string } | null;
  pausedOrbit: boolean;
}

function CentralIntelligenceCore() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 0.45;
      outerRingRef.current.rotation.x += delta * 0.2;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.6;
    }
  });

  return (
    <group>
      {/* Inner Glowing Core */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshStandardMaterial
          color="#F47735"
          emissive="#F47735"
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Wireframe Containment Shell */}
      <mesh ref={outerRingRef}>
        <octahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial
          color="#FFFFFF"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      <Html position={[0, -2.35, 0]} center distanceFactor={14}>
        <div className="pointer-events-none whitespace-nowrap rounded-full border border-[#F47735]/60 bg-[#080808]/90 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#F47735] shadow-orange-subtle">
          XAVANXAI CENTRAL CORE
        </div>
      </Html>
    </group>
  );
}

function OrbitRingGeometry({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(theta) * radius, 0, Math.sin(theta) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color="#FFFFFF"
      lineWidth={1}
      transparent
      opacity={0.12}
    />
  );
}

function AgentPlanetNode({
  agent,
  position,
  isSelected,
  onSelect,
}: {
  agent: LiveAgentNode;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  const nodeColor = isSelected
    ? "#F47735"
    : agent.status === "EXECUTING"
    ? "#34D399"
    : "#E4E4E7";

  return (
    <group position={position}>
      {/* Core Connection Tether */}
      <Line
        points={[
          [0, 0, 0],
          [-position[0], -position[1], -position[2]],
        ]}
        color={isSelected ? "#F47735" : "#FFFFFF"}
        lineWidth={isSelected ? 1.8 : 0.6}
        transparent
        opacity={isSelected ? 0.65 : 0.08}
      />

      {/* Interactive 3D Node */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <dodecahedronGeometry args={[isSelected ? 0.62 : 0.45, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={isSelected ? "#F47735" : "#000000"}
          emissiveIntensity={isSelected ? 0.9 : 0}
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>

      {/* Selection Halo */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.92, 32]} />
          <meshBasicMaterial
            color="#F47735"
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Floating Department Label */}
      <Html position={[0, 0.85, 0]} center distanceFactor={15}>
        <button
          type="button"
          onClick={onSelect}
          className={`whitespace-nowrap rounded-lg border px-2 py-0.5 font-mono text-[10px] transition-all ${
            isSelected
              ? "border-[#F47735] bg-[#F47735] text-[#080808] font-bold shadow-orange-subtle"
              : "border-white/15 bg-[#080808]/85 text-white/90 hover:border-[#F47735]/60"
          }`}
        >
          {agent.role.replace(" Agent", "")}
        </button>
      </Html>
    </group>
  );
}

function SolarSystemScene({
  agents,
  selectedAgentId,
  onSelectAgent,
  activeTransfer,
  pausedOrbit,
}: HqThreeCanvasProps) {
  const angleOffsetRef = useRef(0);

  useFrame((_, delta) => {
    if (!pausedOrbit) {
      angleOffsetRef.current += delta * 0.12;
    }
  });

  // Compute deterministic orbital coordinates per ring
  const agentPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    const rings: Record<1 | 2 | 3, LiveAgentNode[]> = { 1: [], 2: [], 3: [] };

    agents.forEach((a) => {
      rings[a.orbitRing].push(a);
    });

    ([1, 2, 3] as const).forEach((ringNum) => {
      const list = rings[ringNum];
      const radius = ringNum === 1 ? 4.4 : ringNum === 2 ? 7.2 : 10.0;
      list.forEach((agent, idx) => {
        const baseAngle = (idx / Math.max(1, list.length)) * Math.PI * 2 + ringNum * 0.7;
        const yElevation = Math.sin(idx * 1.4 + ringNum) * 0.45;
        map.set(agent.id, [
          Math.cos(baseAngle) * radius,
          yElevation,
          Math.sin(baseAngle) * radius,
        ]);
      });
    });

    return map;
  }, [agents]);

  const fromPos = activeTransfer
    ? agentPositions.get(activeTransfer.fromId)
    : undefined;
  const toPos = activeTransfer
    ? agentPositions.get(activeTransfer.toId)
    : undefined;

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 6, 0]} intensity={2.4} color="#F47735" />
      <pointLight position={[12, 10, 12]} intensity={1.1} color="#FFFFFF" />

      <CentralIntelligenceCore />

      <OrbitRingGeometry radius={4.4} />
      <OrbitRingGeometry radius={7.2} />
      <OrbitRingGeometry radius={10.0} />

      {agents.map((agent) => {
        const pos = agentPositions.get(agent.id) || [4.4, 0, 0];
        return (
          <AgentPlanetNode
            key={agent.id}
            agent={agent}
            position={pos}
            isSelected={agent.id === selectedAgentId}
            onSelect={() => onSelectAgent(agent)}
          />
        );
      })}

      {/* Inter-Agent Task Transfer Beam */}
      {fromPos && toPos && activeTransfer && (
        <group>
          <Line
            points={[fromPos, [0, 1.8, 0], toPos]}
            color="#F47735"
            lineWidth={2.5}
          />
          <Html position={[0, 2.2, 0]} center distanceFactor={14}>
            <div className="whitespace-nowrap rounded-md border border-[#F47735] bg-[#101010]/95 px-2.5 py-1 font-mono text-[10px] text-[#F47735]">
              TASK BUS: {activeTransfer.label}
            </div>
          </Html>
        </group>
      )}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={21}
        maxPolarAngle={Math.PI / 2.15}
        minPolarAngle={0.35}
      />
    </>
  );
}

export function HqThreeCanvas(props: HqThreeCanvasProps) {
  return (
    <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#080808]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 9.5, 14.5], fov: 44 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <SolarSystemScene {...props} />
      </Canvas>
    </div>
  );
}