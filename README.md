# docs.tterm.net

**Version 0.1.0.** The number lives in `package.json`; the build puts it in
a `<meta name="version">` and the footer of every page, so you can tell what
is deployed by viewing source.

The docs of [tTerm](https://tterm.net), the cloud terminal for servers and
computers: how to connect machines, work in the terminals and keep access
under control. Built with [Starlight](https://starlight.astro.build) on
Astro, in the twelve languages of tterm.net.

## Building

```bash
npm ci
npm run build
```

The site comes out in `dist/`, with its search index (Pagefind) and sitemap.
It needs Node 22.23.4 or newer (Astro 7); `.node-version` names 24, the
version Cloudflare builds with. To write with the pages updating as you type:

```bash
npx astro dev
```

Search works only in a build: `npm run build && npm run preview`.

## Deploying

Cloudflare builds the docs on every push to `main` (Workers Builds: build
command `npm run build`, deploy command `npx wrangler deploy`), and
`wrangler.jsonc` serves `dist/` as static assets at docs.tterm.net. Nothing
built is committed.

## Pages and languages

English lives at the root, every other language in a folder of its own, as
on tterm.net: `/ru/`, `/de/`, `/es/`, `/fr/`, `/it/`, `/pl/`, `/pt/` (pt-BR),
`/tr/`, `/ja/`, `/ko/`, `/zh/` (zh-CN). A page is
`src/content/docs/<path>.mdx` in English and
`src/content/docs/<language>/<path>.mdx` in another language, the same path in
all of them. A page missing in a language shows its English text there, with
a notice in the reader's language.

**Links between pages are relative** (`../computers/`), never
`/machines/computers/`: on a page not translated yet, a relative link keeps
the reader in their own language.

The sidebar is in `astro.config.mjs`, its labels per language in
`translations`. A page still to be written stays in the sidebar, quieter and
with a dot (`data-planned`), so the plan is visible.

The words around the text:

- Starlight's own (search, "On this page", "Edit on GitHub") come translated
  with Starlight; where ours differ, they are in `src/content/i18n/<language>.json`.
- The header and the footer are the site's, with the site's words: run
  `python3 scripts/shell_from_site.py <path to a checkout of tterm-net/site>`
  after they change on the site, and commit `src/shell.json`.

## The look

`src/styles/tterm.css`: the dark theme is the site's, the light theme tTerm
Web's; Auto, the default, follows the computer. The fonts are served from
here (`src/fonts`), as on tterm.net: the pages load nothing from third
parties. `src/components/`: the header (the site's, with the search and the
theme), the frame that puts the site's footer under every page, and the
bottom of the phone's menu.

## Until the launch

`<meta name="robots" content="noindex">` in `astro.config.mjs` keeps search
engines away while the texts are being agreed on. It goes when the docs are
linked from tterm.net.

## License

AGPL-3.0, as all of tTerm: [LICENSE](LICENSE).
