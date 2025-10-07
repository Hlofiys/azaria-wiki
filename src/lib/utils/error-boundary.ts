// Error boundary utilities for Svelte
import { browser } from '$app/environment';

export interface ErrorInfo {
	message: string;
	stack?: string;
	componentStack?: string;
	timestamp: number;
	url?: string;
	userAgent?: string;
}

export class ErrorLogger {
	private static instance: ErrorLogger;
	private errors: ErrorInfo[] = [];
	private maxErrors = 50;

	static getInstance(): ErrorLogger {
		if (!ErrorLogger.instance) {
			ErrorLogger.instance = new ErrorLogger();
		}
		return ErrorLogger.instance;
	}

	private constructor() {
		if (browser) {
			// Global error handler
			window.addEventListener('error', (event) => {
				this.logError({
					message: event.message,
					stack: event.error?.stack,
					timestamp: Date.now(),
					url: window.location.href,
					userAgent: navigator.userAgent
				});
			});

			// Unhandled promise rejection handler
			window.addEventListener('unhandledrejection', (event) => {
				this.logError({
					message: `Unhandled promise rejection: ${event.reason}`,
					stack: event.reason?.stack,
					timestamp: Date.now(),
					url: window.location.href,
					userAgent: navigator.userAgent
				});
			});
		}
	}

	logError(error: Partial<ErrorInfo>): void {
		const errorInfo: ErrorInfo = {
			message: error.message || 'Unknown error',
			stack: error.stack,
			componentStack: error.componentStack,
			timestamp: error.timestamp || Date.now(),
			url: error.url || (browser ? window.location.href : ''),
			userAgent: error.userAgent || (browser ? navigator.userAgent : '')
		};

		this.errors.push(errorInfo);

		// Limit stored errors to prevent memory leaks
		if (this.errors.length > this.maxErrors) {
			this.errors.shift();
		}

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Error logged:', errorInfo);
		}

		// In production, you might want to send to an error tracking service
		// this.sendToErrorService(errorInfo);
	}

	getErrors(): ErrorInfo[] {
		return [...this.errors];
	}

	clearErrors(): void {
		this.errors = [];
	}

	getErrorStats() {
		const now = Date.now();
		const last24h = this.errors.filter(error => now - error.timestamp < 24 * 60 * 60 * 1000);
		const lastHour = this.errors.filter(error => now - error.timestamp < 60 * 60 * 1000);

		return {
			total: this.errors.length,
			last24h: last24h.length,
			lastHour: lastHour.length,
			mostCommon: this.getMostCommonErrors()
		};
	}

	private getMostCommonErrors(): Array<{ message: string; count: number }> {
		const errorCounts = new Map<string, number>();
		
		this.errors.forEach(error => {
			const count = errorCounts.get(error.message) || 0;
			errorCounts.set(error.message, count + 1);
		});

		return Array.from(errorCounts.entries())
			.map(([message, count]) => ({ message, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}

	// Optional: Send errors to external service
	private async sendToErrorService(error: ErrorInfo): Promise<void> {
		if (!browser || process.env.NODE_ENV === 'development') return;

		try {
			// Example: send to your error tracking service
			// await fetch('/api/errors', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(error)
			// });
		} catch (e) {
			// Silently fail to avoid infinite error loops
		}
	}
}

// Svelte error boundary helper
export function createErrorBoundary() {
	const errorLogger = ErrorLogger.getInstance();
	
	return {
		logError: (error: Error, componentName?: string) => {
			errorLogger.logError({
				message: error.message,
				stack: error.stack,
				componentStack: componentName ? `at ${componentName}` : undefined,
				timestamp: Date.now()
			});
		},
		
		wrapAsync: <T extends (...args: any[]) => Promise<any>>(
			fn: T,
			componentName?: string
		): T => {
			return (async (...args: Parameters<T>) => {
				try {
					return await fn(...args);
				} catch (error) {
					errorLogger.logError({
						message: error instanceof Error ? error.message : String(error),
						stack: error instanceof Error ? error.stack : undefined,
						componentStack: componentName ? `at ${componentName}` : undefined,
						timestamp: Date.now()
					});
					throw error;
				}
			}) as T;
		}
	};
}