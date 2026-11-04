// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import shell from './src/shell.json' with { type: 'json' };

/**
 * The docs of tTerm, in the twelve languages of the site, at docs.tterm.net.
 *
 * English lives at the root and every other language in a folder of its own,
 * as on tterm.net: /ru/, /de/, /pt/ (pt-BR), /zh/ (zh-CN). The menu of
 * languages keeps the site's order. A page not translated yet shows its
 * English text with a notice in the reader's language.
 */
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const locales = Object.fromEntries(
	Object.entries(shell).map(([key, l]) => [key, { label: l.own, lang: l.lang }]),
);

/**
 * Whether a page of the docs has its own text in its language. A page that has
 * not is the English one with a notice: search engines leave it alone
 * (src/routeData.ts), and the map of the site leaves it out.
 */
const translated = (page) => {
	const [folder, ...rest] = new URL(page).pathname.split('/').filter(Boolean);
	if (!folder || !(folder in shell) || folder === 'root') return true;
	const path = rest.join('/') || 'index';
	return [`${path}.mdx`, `${path}/index.mdx`].some((file) =>
		existsSync(new URL(`./src/content/docs/${folder}/${file}`, import.meta.url)),
	);
};

const title = Object.fromEntries(
	Object.values(shell).map((l) => [l.lang, `tTerm ${l.words.docs}`]),
);
// Where the language puts the name after the word, or joins them, the title
// says it the language's way: "Документация tTerm", not "tTerm Документация".
Object.assign(title, {
	ru: 'Документация tTerm',
	de: 'tTerm-Dokumentation',
	es: 'Documentación de tTerm',
	fr: 'Documentation de tTerm',
	it: 'Documentazione di tTerm',
	pl: 'Dokumentacja tTerm',
	'pt-BR': 'Documentação do tTerm',
	tr: 'tTerm Belgeleri',
});

/** "Soon" in every language, as the site says it for Windows and Linux. */
const soon = {
	text: Object.fromEntries(Object.values(shell).map((l) => [l.lang, l.words.soon])),
	variant: /** @type {const} */ ('note'),
};

/**
 * A page still to be written: in the sidebar, so the plan is visible, but
 * not a link yet (tterm.css), and Previous and Next skip it (routeData.ts).
 */
const planned = (label, translations, link) => ({
	label,
	translations,
	link,
	attrs: { 'data-planned': '', 'aria-disabled': 'true', tabindex: '-1' },
});

/**
 * The names of the sidebar's groups in every language: the same words as the
 * cards of each language's start page, and for What's new and What we keep
 * the words of its translators (02.11).
 */
const group = {
	start: { ru: 'Начало работы', de: 'Hier anfangen', es: 'Primeros pasos', fr: 'Pour commencer', it: 'Inizia da qui', pl: 'Pierwsze kroki', 'pt-BR': 'Comece aqui', tr: 'Başlarken', ja: 'はじめに', ko: '시작하기', 'zh-CN': '从这里开始' },
	machines: { ru: 'Машины', de: 'Maschinen', es: 'Máquinas', fr: 'Machines', it: 'Macchine', pl: 'Maszyny', 'pt-BR': 'Máquinas', tr: 'Makineler', ja: 'マシン', ko: '머신', 'zh-CN': '机器' },
	features: { ru: 'Возможности', de: 'Funktionen', es: 'Funciones', fr: 'Fonctionnalités', it: 'Funzionalità', pl: 'Funkcje', 'pt-BR': 'Funcionalidades', tr: 'Özellikler', ja: '機能', ko: '기능', 'zh-CN': '功能' },
	local: { ru: 'Локальный терминал', de: 'Lokales Terminal', es: 'Terminal local', fr: 'Terminal local', it: 'Terminale locale', pl: 'Terminal lokalny', 'pt-BR': 'Terminal local', tr: 'Yerel terminal', ja: 'ローカルターミナル', ko: '로컬 터미널', 'zh-CN': '本地终端' },
	security: { ru: 'Безопасность', de: 'Sicherheit', es: 'Seguridad', fr: 'Sécurité', it: 'Sicurezza', pl: 'Bezpieczeństwo', 'pt-BR': 'Segurança', tr: 'Güvenlik', ja: 'セキュリティ', ko: '보안', 'zh-CN': '安全' },
	account: { ru: 'Аккаунт', de: 'Konto', es: 'Cuenta', fr: 'Compte', it: 'Account', pl: 'Konto', 'pt-BR': 'Conta', tr: 'Hesap', ja: 'アカウント', ko: '계정', 'zh-CN': '账号' },
	news: { ru: 'Что нового', de: 'Neuigkeiten', es: 'Novedades', fr: 'Nouveautés', it: 'Novità', pl: 'Co nowego', 'pt-BR': 'Novidades', tr: 'Yenilikler', ja: '最新情報', ko: '새 소식', 'zh-CN': '更新内容' },
	keep: { ru: 'Что мы храним', de: 'Was wir speichern', es: 'Qué datos guardamos', fr: 'Ce que nous conservons', it: 'Cosa conserviamo', pl: 'Co przechowujemy', 'pt-BR': 'O que guardamos', tr: 'Neleri saklıyoruz', ja: '保存するデータ', ko: '저희가 보관하는 데이터', 'zh-CN': '我们保存的数据' },
};

export default defineConfig({
	site: 'https://docs.tterm.net',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title,
			defaultLocale: 'root',
			locales,
			favicon: '/favicon.svg',
			credits: false,
			// No "Edit on GitHub" under the pages: the docs are written by us,
			// not by their readers.
			head: [
				{ tag: 'meta', attrs: { name: 'version', content: version } },
			],
			customCss: ['./src/styles/fonts.css', './src/styles/tterm.css'],
			routeMiddleware: './src/routeData.ts',
			components: {
				Header: './src/components/Header.astro',
				PageFrame: './src/components/PageFrame.astro',
				MobileMenuFooter: './src/components/MobileMenuFooter.astro',
			},
			expressiveCode: {
				themes: ['github-dark', 'github-light'],
				styleOverrides: {
					borderRadius: '12px',
					borderColor: 'var(--tt-line)',
					codeFontFamily: 'var(--__sl-font-mono)',
					codeFontSize: '0.875rem',
					codeLineHeight: '1.7',
					codeBackground: 'var(--tt-code-bg)',
					uiFontFamily: 'var(--__sl-font)',
					frames: {
						frameBoxShadowCssValue: 'none',
						editorTabBarBackground: 'var(--tt-code-bar)',
						editorActiveTabBackground: 'var(--tt-code-bg)',
						editorActiveTabBorderColor: 'transparent',
						editorActiveTabIndicatorTopColor: 'var(--tt-amber)',
						terminalBackground: 'var(--tt-code-bg)',
						terminalTitlebarBackground: 'var(--tt-code-bar)',
						terminalTitlebarBorderBottomColor: 'var(--tt-line)',
						terminalTitlebarForeground: 'var(--tt-dim)',
						terminalTitlebarDotsForeground: 'var(--tt-dots)',
						terminalTitlebarDotsOpacity: '1',
						inlineButtonBorder: 'var(--tt-line-3)',
						inlineButtonForeground: 'var(--tt-dim)',
					},
				},
			},
			sidebar: [
				{
					label: 'Start here',
					translations: group.start,
					items: ['start/what-is-tterm', 'start/quick-start'],
				},
				{
					label: 'Machines',
					translations: group.machines,
					items: ['machines/servers', 'machines/computers', 'local/move-to-cloud', 'machines/remove'],
				},
				{
					label: 'Features',
					translations: group.features,
					items: [
						'features/blocks',
						'features/search',
						'features/notes',
						'features/log',
						'features/projects',
					],
				},
				{
					label: 'Local terminal',
					translations: group.local,
					items: [
						'local/mac',
						{ slug: 'local/windows', badge: soon },
						{ slug: 'local/linux', badge: soon },
					],
				},
				{
					label: 'Security',
					translations: group.security,
					items: [
						'security/access',
						'security/keys',
						// Written, but waits for the Privacy Policy to say the same
						// (owner, 02.11): the policy predates notes, the vault and the
						// machine's log.
						planned('What we keep', group.keep, '/security/data/'),
					],
				},
				{
					label: 'Account',
					translations: group.account,
					items: ['account/settings', 'account/plan', 'account/devices', 'account/help'],
				},
				{
					// Its pages are in English and Russian only, for now (owner,
					// 02.11): other languages show the English with a notice.
					label: "What's new",
					translations: group.news,
					items: ['whats-new/web', 'whats-new/mac'],
				},
			],
		}),
		// Starlight's own map of the site, with the same languages, less the
		// pages a language has not translated yet.
		sitemap({
			i18n: {
				defaultLocale: 'root',
				locales: Object.fromEntries(Object.entries(locales).map(([key, l]) => [key, l.lang])),
			},
			filter: translated,
		}),
	],
});
