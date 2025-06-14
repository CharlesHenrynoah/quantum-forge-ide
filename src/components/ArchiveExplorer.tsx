
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, GitBranch, Star, TrendingUp } from 'lucide-react';

const ArchiveExplorer = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  
  const archiveNodes = [
    { id: 'node_7a3f', fitness: 0.847, generation: 15, type: 'dashboard', mutations: 23, status: 'best' },
    { id: 'node_9b2c', fitness: 0.834, generation: 14, type: 'api', mutations: 19, status: 'active' },
    { id: 'node_1e4d', fitness: 0.812, generation: 13, type: 'ui-kit', mutations: 31, status: 'archived' },
    { id: 'node_6f8a', fitness: 0.798, generation: 12, type: 'dashboard', mutations: 27, status: 'archived' },
    { id: 'node_3c5b', fitness: 0.776, generation: 11, type: 'api', mutations: 15, status: 'archived' },
    { id: 'node_8a1f', fitness: 0.734, generation: 10, type: 'landing', mutations: 42, status: 'archived' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'best': return 'bg-green-900/30 text-green-400 border-green-400/30';
      case 'active': return 'bg-blue-900/30 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-400/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'dashboard': return '📊';
      case 'api': return '🔗';
      case 'ui-kit': return '🎨';
      case 'landing': return '🚀';
      default: return '📄';
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold">Archive Explorer</h3>
        <Badge variant="outline" className="border-orange-400/30 text-orange-400 text-xs">
          Neo4j
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {archiveNodes.map((node) => (
          <div
            key={node.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800/50 ${
              selectedNode?.id === node.id 
                ? 'bg-slate-800/50 border-purple-400/50' 
                : 'border-slate-600/50'
            }`}
            onClick={() => setSelectedNode(node)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getTypeIcon(node.type)}</span>
                <span className="font-mono text-sm text-slate-300">{node.id}</span>
                {node.status === 'best' && <Star className="h-3 w-3 text-yellow-400" />}
              </div>
              <Badge variant="outline" className={getStatusColor(node.status)}>
                {node.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                <span>Gen {node.generation}</span>
                <span>{node.mutations} mutations</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span className="font-mono">{node.fitness.toFixed(3)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNode && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Selected Node:</span>
              <span className="font-mono text-cyan-400">{selectedNode.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fitness Score:</span>
              <span className="font-mono text-green-400">{selectedNode.fitness.toFixed(3)}</span>
            </div>
            <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
              <GitBranch className="h-3 w-3 mr-1" />
              Use as Parent
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ArchiveExplorer;
