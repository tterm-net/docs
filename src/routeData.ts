import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

/**
 * Previous and Next skip the pages still to be written: those stand in the
 * sidebar as the plan of the docs (data-planned), but have no page yet.
 */
type Entry = { type: string; entries?: Entry[]; attrs?: Record<string, unknown>; isCurrent?: boolean };

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const links: Entry[] = [];
	const walk = (entries: Entry[]) =>
		entries.forEach((e) => (e.type === 'group' ? walk(e.entries ?? []) : links.push(e)));
	walk(route.sidebar as unknown as Entry[]);
	const here = links.findIndex((e) => e.isCurrent);
	if (here < 0) return;
	const real = (e: Entry) => !(e.attrs && 'data-planned' in e.attrs);
	const prev = links.slice(0, here).reverse().find(real);
	const next = links.slice(here + 1).find(real);
	route.pagination = { prev, next } as typeof route.pagination;
});
