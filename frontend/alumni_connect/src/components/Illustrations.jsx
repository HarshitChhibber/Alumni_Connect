// components/Illustrations.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';

// --- Sub-Components ---

// 1. The Profile Card (The Node)
const ProfileNode = ({ data, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay, type: "spring" }}
      className="absolute z-20"
      style={{ left: `${data.x}%`, top: `${data.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Floating Animation Wrapper */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className="relative group"
      >
        {/* The Card */}
        <div className="flex items-center gap-3 p-3 pr-5 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-max">
          <div className="relative">
            <img
              src={data.img}
              alt={data.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {data.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-800">{data.name}</span>
            <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
              {data.role === 'Alumni' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {data.role} • {data.org}
            </div>
          </div>
        </div>

        {/* Connection Pulse Ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/30 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"></div>
      </motion.div>
    </motion.div>
  );
};

// 2. The Data Connection (The Line + Particle)
const ConnectionLine = ({ start, end }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <defs>
        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      {/* Base Line */}
      <motion.path
        d={`M ${start.x}% ${start.y}% L ${end.x}% ${end.y}%`}
        stroke="url(#gradientLine)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Moving Data Particle */}
      <motion.circle
        r="3"
        fill="#3b82f6"
        filter="url(#glow)"
      >
        <animateMotion
          // eslint-disable-next-line react-hooks/purity
          dur={`${Math.random() * 2 + 3}s`}
          repeatCount="indefinite"
          path={`M ${start.x}% ${start.y}% L ${end.x}% ${end.y}%`}
        />
      </motion.circle>
    </svg>
  );
};

// 3. Floating Skill Badges
const SkillBadge = ({ text, x, y, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay + 1 }}
    className="absolute z-10 px-3 py-1 bg-white shadow-sm border border-neutral-100 rounded-full text-[10px] font-semibold text-neutral-500"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay }}
    >
      {text}
    </motion.div>
  </motion.div>
);


// --- Main Component ---
export const HeroGraph = () => {
  // Mock Data
  const nodes = [
    { id: 1, x: 50, y: 50, name: "You", role: "Student", org: "NIT Delhi", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=60", verified: false },
    { id: 2, x: 20, y: 30, name: "Rahul S.", role: "Alumni", org: "Google", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&fit=crop&q=60", verified: true },
    { id: 3, x: 80, y: 25, name: "Priya M.", role: "Alumni", org: "Amazon", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=60", verified: true },
    { id: 4, x: 25, y: 75, name: "Amit K.", role: "Peer", org: "Batch '25", img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&fit=crop&q=60", verified: false },
    { id: 5, x: 75, y: 80, name: "Sarah L.", role: "Alumni", org: "Goldman", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&fit=crop&q=60", verified: true },
  ];

  // Define specific connections (You -> Others)
  const connections = [
    { start: nodes[0], end: nodes[1] }, // You -> Rahul
    { start: nodes[0], end: nodes[2] }, // You -> Priya
    { start: nodes[0], end: nodes[3] }, // You -> Amit
    { start: nodes[0], end: nodes[4] }, // You -> Sarah
    { start: nodes[1], end: nodes[4] }, // Rahul -> Sarah (Alumni connect)
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-neutral-50/50 rounded-3xl overflow-hidden border border-white shadow-2xl backdrop-blur-sm">
      
      {/* 1. Ambient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-40" 
        />
        <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-30" 
        />
      </div>

      {/* 2. Technical Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}
      ></div>

      {/* 3. Connections Layer */}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} start={conn.start} end={conn.end} />
      ))}

      {/* 4. Floating Skills Layer */}
      <SkillBadge text="React" x={35} y={40} delay={0.5} />
      <SkillBadge text="Python" x={60} y={65} delay={1} />
      <SkillBadge text="System Design" x={65} y={35} delay={1.5} />
      <SkillBadge text="Data Structures" x={40} y={60} delay={2} />

      {/* 5. Profile Nodes Layer */}
      {nodes.map((node, i) => (
        <ProfileNode key={node.id} data={node} delay={i * 0.3} />
      ))}

    </div>
  );
};