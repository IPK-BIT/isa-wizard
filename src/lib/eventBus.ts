/**
 * Simple event emitter for component communication
 */

type EventListener<T = any> = (data: T) => void;

export class EventBus {
	private listeners: Map<string, Set<EventListener>> = new Map();

	/**
	 * Subscribe to an event
	 */
	on<T = any>(event: string, listener: EventListener<T>): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}

		this.listeners.get(event)!.add(listener as EventListener);

		// Return unsubscribe function
		return () => {
			this.listeners.get(event)?.delete(listener as EventListener);
		};
	}

	/**
	 * Emit an event
	 */
	emit<T = any>(event: string, data?: T): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			listeners.forEach((listener) => {
				try {
					listener(data);
				} catch (error) {
					console.error(`Error in event listener for "${event}":`, error);
				}
			});
		}
	}

	/**
	 * Subscribe to an event once
	 */
	once<T = any>(event: string, listener: EventListener<T>): () => void {
		const unsubscribe = this.on(event, (data: T) => {
			listener(data);
			unsubscribe();
		});
		return unsubscribe;
	}

	/**
	 * Clear all listeners for an event
	 */
	clear(event?: string): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get listener count for an event
	 */
	listenerCount(event: string): number {
		return this.listeners.get(event)?.size ?? 0;
	}
}

// Create a singleton instance
export const eventBus = new EventBus();
