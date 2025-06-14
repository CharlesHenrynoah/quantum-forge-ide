
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Atom, Zap, Eye } from 'lucide-react';

const CollapseVisualizer = ({ activeIntent }) => {
  const [particles, setParticles] = useState([]);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [collapsePhase, setCollapsePhase] = useState('idle');

  const generateParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 300,
      y: Math.random() * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 2,
      color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)]
    }));
    setParticles(newParticles);
  };

  const startCollapse = () => {
    if (!activeIntent) return;
    
    setIsCollapsing(true);
    setCollapsePhase('preparation');
    generateParticles();
    
    setTimeout(() => setCollapsePhase('convergence'), 1000);
    setTimeout(() => setCollapsePhase('collapse'), 2500);
    setTimeout(() => {
      setCollapsePhase('materialization');
      setIsCollapsing(false);
    }, 4000);
  };

  useEffect(() => {
    if (!isCollapsing) return;
    
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x;
        let newY = particle.y;
        let newVx = particle.vx;
        let newVy = particle.vy;
        
        if (collapsePhase === 'convergence' || collapsePhase === 'collapse') {
          // Pull particles toward center
          const centerX = 150;
          const centerY = 100;
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            const force = collapsePhase === 'collapse' ? 0.3 : 0.1;
            newVx += (dx / distance) * force;
            newVy += (dy / distance) * force;
          }
        }
        
        newX += newVx;
        newY += newVy;
        
        // Boundary checking
        if (newX <= 0 || newX >= 300) newVx *= -0.8;
        if (newY <= 0 || newY >= 200) newVy *= -0.8;
        
        return {
          ...particle,
          x: Math.max(0, Math.min(300, newX)),
          y: Math.max(0, Math.min(200, newY)),
          vx: newVx * 0.99, // Friction
          vy: newVy * 0.99
        };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [isCollapsing, collapsePhase]);

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Atom className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Quantum Collapse</h3>
        </div>
        
        <Button
          onClick={startCollapse}
          disabled={!activeIntent || isCollapsing}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isCollapsing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Collapsing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Trigger Collapse
            </>
          )}
        </Button>
      </div>

      <div className="relative h-52 bg-black rounded-lg overflow-hidden">
        <svg className="w-full h-full">
          {/* Quantum field background */}
          <defs>
            <radialGradient id="quantumField" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#quantumField)" />
          
          {/* Collapse center indicator */}
          {(collapsePhase === 'convergence' || collapsePhase === 'collapse') && (
            <g>
              <circle
                cx="150"
                cy="100"
                r="10"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                opacity="0.6"
                className="animate-ping"
              />
              <circle
                cx="150"
                cy="100"
                r="5"
                fill="#8b5cf6"
                opacity="0.8"
              />
            </g>
          )}
          
          {/* Particles */}
          {particles.map((particle) => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={collapsePhase === 'collapse' ? '0.9' : '0.7'}
              className={collapsePhase === 'collapse' ? 'animate-pulse' : ''}
            />
          ))}
        </svg>
        
        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              collapsePhase === 'idle' ? 'bg-slate-500' :
              collapsePhase === 'preparation' ? 'bg-yellow-400 animate-pulse' :
              collapsePhase === 'convergence' ? 'bg-blue-400 animate-pulse' :
              collapsePhase === 'collapse' ? 'bg-purple-400 animate-ping' :
              'bg-green-400'
            }`}></div>
            <span className="text-slate-300 capitalize">
              {collapsePhase === 'idle' ? 'Ready' : collapsePhase}
            </span>
          </div>
        </div>
        
        {/* Live preview placeholder */}
        {collapsePhase === 'materialization' && (
          <div className="absolute inset-4 bg-slate-800 rounded border border-green-400/30 flex items-center justify-center">
            <div className="text-center">
              <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-sm text-green-400">App Materialized</div>
              <div className="text-xs text-slate-400">Live preview ready</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CollapseVisualizer;
