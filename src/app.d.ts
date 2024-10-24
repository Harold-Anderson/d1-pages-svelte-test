// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
/// <reference types="@cloudflare/workers-types" />
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {env?: {
			DB: D1Database;  // Define your D1 database binding here
		};
		context: {
			waitUntil(promise: Promise<any>): void;
		  };
		  caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
