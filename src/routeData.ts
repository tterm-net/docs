import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

/**
 * What changes in what Starlight makes of a page:
 *
 * - The start of the docs is titled as the docs themselves, "Документация
 *   tTerm", not "Документация tTerm | Документация tTerm" (Starlight puts the
 *   site's title after every page's).
 * - Previous and Next skip the pages still to be written: those stand in the
 *   sidebar as the plan of the docs (data-planned), but have no page yet, so
 *   their line there is no link either: a search engine would get a 404.
 * - A page a language has not translated yet shows the English text, and
 *   search engines leave it alone: they find that text on the English page.
 */
type Entry = {
	type: string;
	entries?: Entry[];
	attrs?: Record<string, unknown>;
	isCurrent?: boolean;
	href?: string;
};

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	// The start of the docs in each language: / and /ru/, /de/... (not 404,
	// which also has a hero).
	const path = context.url.pathname.replace(/\/$/, '');
	if (path === (route.locale ? `/${route.locale}` : '')) {
		const title = route.head.find((tag) => tag.tag === 'title');
		if (title) title.content = route.siteTitle;
	}

	if (route.isFallback) {
		route.head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } });
	}

	const links: Entry[] = [];
	const walk = (entries: Entry[]) =>
		entries.forEach((e) => (e.type === 'group' ? walk(e.entries ?? []) : links.push(e)));
	walk(route.sidebar as unknown as Entry[]);
	const real = (e: Entry) => !(e.attrs && 'data-planned' in e.attrs);
	for (const e of links) if (!real(e)) e.href = undefined;
	const here = links.findIndex((e) => e.isCurrent);
	if (here < 0) return;
	const prev = links.slice(0, here).reverse().find(real);
	const next = links.slice(here + 1).find(real);
	route.pagination = { prev, next } as typeof route.pagination;
});
