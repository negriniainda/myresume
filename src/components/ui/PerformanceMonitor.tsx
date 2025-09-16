'use client';

import React, { useEffect, useState } from 'react';
import { usePerformance, useMemoryMonitor } from '@/hooks/usePerformance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showInProduction?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Performance monitoring component for development and debugging
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics, connectionInfo, reportMetrics } = usePerformance();
  const { memoryInfo, getMemoryUsagePercentage, isMemoryPressure } = useMemoryMonitor();

  // Show monitor only in development or when explicitly enabled
  const shouldShow = enabled && (process.env.NODE_ENV === 'development' || showInProduction);

  useEffect(() => {
    if (!shouldShow) return;

    // Show monitor after initial load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  if (!shouldShow || !isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number): string => {
    return `${time.toFixed(2)}ms`;
  };

  const getPerformanceGrade = (): { grade: string; color: string } => {
    if (!metrics) return { grade: 'N/A', color: 'text-gray-500' };

    const { FCP, LCP, CLS, FID } = metrics;
    let score = 0;

    // FCP scoring (0-25 points)
    if (FCP < 1800) score += 25;
    else if (FCP < 3000) score += 15;
    else if (FCP < 4200) score += 5;

    // LCP scoring (0-25 points)
    if (LCP < 2500) score += 25;
    else if (LCP < 4000) score += 15;
    else if (LCP < 5500) score += 5;

    // CLS scoring (0-25 points)
    if (CLS < 0.1) score += 25;
    else if (CLS < 0.25) score += 15;
    else if (CLS < 0.4) score += 5;

    // FID scoring (0-25 points)
    if (FID < 100) score += 25;
    else if (FID < 300) score += 15;
    else if (FID < 500) score += 5;

    if (score >= 90) return { grade: 'A', color: 'text-green-500' };
    if (score >= 75) return { grade: 'B', color: 'text-yellow-500' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  const performanceGrade = getPerformanceGrade();

  return (
    <div className={`fixed ${getPositionClasses()} z-50 font-mono text-xs`}>
      <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-gray-600">
        {/* Header */}
        <div
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-semibold">Performance</span>
            <span className={`font-bold ${performanceGrade.color}`}>
              {performanceGrade.grade}
            </span>
          </div>
          <button className="text-gray-400 hover:text-white">
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-gray-600 p-3 space-y-3 min-w-[280px]">
            {/* Core Web Vitals */}
            {metrics && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-300">Core Web Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">FCP:</span>
                    <span className={`ml-1 ${metrics.FCP < 1800 ? 'text-green-400' : metrics.FCP < 3000 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formatTime(metrics.FCP)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">LCP:</span>
                    <span className={`ml-1 ${metrics.LCP < 2500 ? 'text-green-400' : metrics.LCP < 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formatTime(metrics.LCP)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">CLS:</span>
                    <span className={`ml-1 ${metrics.CLS < 0.1 ? 'text-green-400' : metrics.CLS < 0.25 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {metrics.CLS.toFixed(3)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">FID:</span>
                    <span className={`ml-1 ${metrics.FID < 100 ? 'text-green-400' : metrics.FID < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formatTime(metrics.FID)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Memory Usage */}
            {memoryInfo && (
              <div>
                <h4 className="font-semibold mb-2 text-purple-300">Memory Usage</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used:</span>
                    <span className={isMemoryPressure() ? 'text-red-400' : 'text-green-400'}>
                      {formatBytes(memoryInfo.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span>{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usage:</span>
                    <span className={getMemoryUsagePercentage() > 80 ? 'text-red-400' : 'text-green-400'}>
                      {getMemoryUsagePercentage().toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Info */}
            {connectionInfo && (
              <div>
                <h4 className="font-semibold mb-2 text-cyan-300">Connection</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={connectionInfo.effectiveType === '4g' ? 'text-green-400' : connectionInfo.effectiveType === '3g' ? 'text-yellow-400' : 'text-red-400'}>
                      {connectionInfo.effectiveType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Downlink:</span>
                    <span>{connectionInfo.downlink.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">RTT:</span>
                    <span>{connectionInfo.rtt}ms</span>
                  </div>
                  {connectionInfo.saveData && (
                    <div className="text-orange-400 text-center">
                      Data Saver ON
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-600 pt-2">
              <button
                onClick={() => reportMetrics()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs transition-colors"
              >
                Report Metrics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;