/**
 * Performance monitoring utility for test optimization
 */

export interface PerformanceMetrics {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  steps: PerformanceStep[];
}

export interface PerformanceStep {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentTest: PerformanceMetrics | null = null;
  private currentStep: PerformanceStep | null = null;

  /**
   * Start monitoring a test
   */
  startTest(testName: string): void {
    this.currentTest = {
      testName,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      steps: []
    };
  }

  /**
   * End monitoring current test
   */
  endTest(): PerformanceMetrics | null {
    if (!this.currentTest) {
      return null;
    }

    this.currentTest.endTime = Date.now();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;

    this.metrics.push(this.currentTest);

    const result = this.currentTest;
    this.currentTest = null;

    return result;
  }

  /**
   * Start monitoring a test step
   */
  startStep(stepName: string): void {
    if (!this.currentTest) {
      return;
    }

    this.currentStep = {
      name: stepName,
      startTime: Date.now(),
      endTime: 0,
      duration: 0
    };
  }

  /**
   * End monitoring current step
   */
  endStep(): PerformanceStep | null {
    if (!this.currentStep || !this.currentTest) {
      return null;
    }

    this.currentStep.endTime = Date.now();
    this.currentStep.duration = this.currentStep.endTime - this.currentStep.startTime;

    this.currentTest.steps.push(this.currentStep);

    const result = this.currentStep;
    this.currentStep = null;

    return result;
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific test
   */
  getTestMetrics(testName: string): PerformanceMetrics | undefined {
    return this.metrics.find(m => m.testName === testName);
  }

  /**
   * Get average duration for all tests
   */
  getAverageDuration(): number {
    if (this.metrics.length === 0) {
      return 0;
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / this.metrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalTests: number;
    averageDuration: number;
    fastestTest: PerformanceMetrics | null;
    slowestTest: PerformanceMetrics | null;
  } {
    if (this.metrics.length === 0) {
      return {
        totalTests: 0,
        averageDuration: 0,
        fastestTest: null,
        slowestTest: null
      };
    }

    const fastestTest = this.metrics.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest
    );

    const slowestTest = this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    );

    return {
      totalTests: this.metrics.length,
      averageDuration: this.getAverageDuration(),
      fastestTest,
      slowestTest
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.currentTest = null;
    this.currentStep = null;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getSummary();

    console.log('\n=== Performance Summary ===');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);

    if (summary.fastestTest) {
      console.log(`Fastest Test: ${summary.fastestTest.testName} (${summary.fastestTest.duration}ms)`);
    }

    if (summary.slowestTest) {
      console.log(`Slowest Test: ${summary.slowestTest.testName} (${summary.slowestTest.duration}ms)`);
    }

    console.log('===========================\n');
  }

  /**
   * Measure execution time of a function
   */
  static async measure<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  ${name}: ${duration}ms`);

    return { result, duration };
  }

  /**
   * Measure execution time of a synchronous function
   */
  static measureSync<T>(name: string, fn: () => T): { result: T; duration: number } {
    const startTime = Date.now();
    const result = fn();
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  ${name}: ${duration}ms`);

    return { result, duration };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();