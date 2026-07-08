/**
 * Performance Monitoring and Optimization Utilities
 */

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

export function reportWebVitals(metric: any) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Vercel Analytics, Google Analytics, etc.
    console.log(metric);
    
    // You can send to your analytics endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    // });
  }
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 75
): string {
  // If it's a Cloudinary URL, add optimization parameters
  if (src.includes('cloudinary')) {
    const params = [];
    if (width) params.push(`w_${width}`);
    params.push(`q_${quality}`);
    params.push('f_auto'); // Auto format (WebP, AVIF)
    params.push('dpr_auto'); // Device pixel ratio
    
    return src.replace('/upload/', `/upload/${params.join(',')}/`);
  }
  
  return src;
}

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// INTERSECTION OBSERVER (LAZY LOADING)
// ============================================================================

export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// ============================================================================
// PREFETCHING
// ============================================================================

export function prefetchRoute(href: string) {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

// ============================================================================
// RESOURCE HINTS
// ============================================================================

export function addPreconnect(url: string) {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

export function addDNSPrefetch(url: string) {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
}

// ============================================================================
// BUNDLE SIZE TRACKING
// ============================================================================

export function logBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Log performance entries
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter((r) => r.name.endsWith('.js'));
    
    const totalSize = jsResources.reduce((acc, r: any) => {
      return acc + (r.transferSize || 0);
    }, 0);
    
    console.log(`Total JS bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

export function checkMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

// ============================================================================
// VIEWPORT DETECTION
// ============================================================================

export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
}

// ============================================================================
// PERFORMANCE TIMING
// ============================================================================

export function measurePerformance(label: string) {
  if (typeof performance === 'undefined') return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  };
}
