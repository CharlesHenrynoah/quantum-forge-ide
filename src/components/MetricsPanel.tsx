
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Eye, DollarSign, Timer } from 'lucide-react';

const MetricsPanel = () => {
  const [metrics, setMetrics] = useState({
    tests: 94,
    performance: 86,
    ux: 91,
    security: 88,
    cost: 0.024,
    latency: 47
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        setMetrics(prev => ({
          tests: Math.max(0, Math.min(100, prev.tests + (Math.random() - 0.5) * 10)),
          performance: Math.max(0, Math.min(100, prev.performance + (Math.random() - 0.5) * 8)),
          ux: Math.max(0, Math.min(100, prev.ux + (Math.random() - 0.5) * 6)),
          security: Math.max(0, Math.min(100, prev.security + (Math.random() - 0.5) * 5)),
          cost: Math.max(0, prev.cost + (Math.random() - 0.5) * 0.01),
          latency: Math.max(10, Math.min(200, prev.latency + (Math.random() - 0.5) * 20))
        }));
        setIsUpdating(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyColor = (latency) => {
    if (latency < 50) return 'text-green-400';
    if (latency < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Benchmarks</h3>
        {isUpdating && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-cyan-400">Updating</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Tests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Tests</span>
            </div>
            <span className={`text-sm font-mono ${getScoreColor(metrics.tests)}`}>
              {metrics.tests.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.tests} className="h-2" />
        </div>

        {/* Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Performance</span>
            </div>
            <span className={`text-sm font-mono ${getScoreColor(metrics.performance)}`}>
              {metrics.performance.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.performance} className="h-2" />
        </div>

        {/* UX Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-400" />
              <span className="text-sm">UX (Lighthouse)</span>
            </div>
            <span className={`text-sm font-mono ${getScoreColor(metrics.ux)}`}>
              {metrics.ux.toFixed(1)}/100
            </span>
          </div>
          <Progress value={metrics.ux} className="h-2" />
        </div>

        {/* Security */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-orange-400" />
              <span className="text-sm">Security (Bandit)</span>
            </div>
            <span className={`text-sm font-mono ${getScoreColor(metrics.security)}`}>
              {metrics.security.toFixed(1)}/100
            </span>
          </div>
          <Progress value={metrics.security} className="h-2" />
        </div>

        {/* Cost & Latency */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-400" />
              <span className="text-xs text-slate-400">Cost</span>
            </div>
            <span className="text-sm font-mono text-green-400">
              ${metrics.cost.toFixed(3)}
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Timer className="h-3 w-3 text-cyan-400" />
              <span className="text-xs text-slate-400">TTFB</span>
            </div>
            <span className={`text-sm font-mono ${getLatencyColor(metrics.latency)}`}>
              {metrics.latency.toFixed(0)}ms
            </span>
          </div>
        </div>

        {/* Fitness Score */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Fitness</span>
            <Badge 
              variant="outline" 
              className="border-purple-400/30 text-purple-400 font-mono"
            >
              {((metrics.tests + metrics.performance + metrics.ux + metrics.security) / 400 * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricsPanel;
