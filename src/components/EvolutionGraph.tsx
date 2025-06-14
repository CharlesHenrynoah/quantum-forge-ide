
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

const EvolutionGraph = ({ isRunning }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Initialize with some nodes
    const initialNodes = [
      { id: 'root', x: 200, y: 200, fitness: 0.3, generation: 0, status: 'archived' },
      { id: 'node_1', x: 150, y: 150, fitness: 0.45, generation: 1, parent: 'root', status: 'archived' },
      { id: 'node_2', x: 250, y: 150, fitness: 0.42, generation: 1, parent: 'root', status: 'archived' },
      { id: 'node_3', x: 120, y: 100, fitness: 0.67, generation: 2, parent: 'node_1', status: 'best' },
      { id: 'node_4', x: 180, y: 100, fitness: 0.58, generation: 2, parent: 'node_1', status: 'archived' },
    ];
    
    setNodes(initialNodes);
    
    const initialConnections = [
      { from: 'root', to: 'node_1' },
      { from: 'root', to: 'node_2' },
      { from: 'node_1', to: 'node_3' },
      { from: 'node_1', to: 'node_4' },
    ];
    
    setConnections(initialConnections);
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Simulate new node generation
        const newId = `node_${Date.now()}`;
        const parentNodes = nodes.filter(n => n.generation >= Math.max(...nodes.map(n => n.generation)) - 1);
        const parent = parentNodes[Math.floor(Math.random() * parentNodes.length)];
        
        if (parent) {
          const newFitness = Math.min(1, parent.fitness + (Math.random() - 0.3) * 0.3);
          const newNode = {
            id: newId,
            x: parent.x + (Math.random() - 0.5) * 80,
            y: parent.y - 50,
            fitness: newFitness,
            generation: parent.generation + 1,
            parent: parent.id,
            status: newFitness > 0.8 ? 'best' : 'active'
          };
          
          setNodes(prev => [...prev, newNode]);
          setConnections(prev => [...prev, { from: parent.id, to: newId }]);
          
          // Update parent status
          setNodes(prev => prev.map(n => 
            n.id === parent.id ? { ...n, status: 'archived' } : n
          ));
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning, nodes]);

  const getNodeColor = (node) => {
    switch (node.status) {
      case 'best': return '#10b981'; // green
      case 'active': return '#3b82f6'; // blue
      case 'failed': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getNodeSize = (fitness) => {
    return 8 + fitness * 12; // Size based on fitness
  };

  return (
    <div className="relative h-80 bg-slate-800 rounded-lg overflow-hidden">
      <svg className="w-full h-full">
        {/* Render connections */}
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          return (
            <line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#475569"
              strokeWidth="2"
              opacity="0.6"
            />
          );
        })}
        
        {/* Render nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={getNodeSize(node.fitness)}
              fill={getNodeColor(node)}
              opacity="0.8"
              className="animate-pulse"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={getNodeSize(node.fitness) + 3}
              fill="none"
              stroke={getNodeColor(node)}
              strokeWidth="1"
              opacity="0.3"
            />
            {node.status === 'best' && (
              <circle
                cx={node.x}
                cy={node.y}
                r={getNodeSize(node.fitness) + 8}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                opacity="0.6"
                className="animate-ping"
              />
            )}
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-900/80 rounded-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Best Fitness</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Archived</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionGraph;
