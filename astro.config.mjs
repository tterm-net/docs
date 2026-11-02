// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
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

const title = Object.fromEntries(
	Object.values(shell).map((l) => [l.lang, `tTerm ${l.words.docs}`]),
);
// "Документация tTerm" reads better in Russian than "tTerm Документация".
title.ru = 'Документация tTerm';

/** "Soon" in every language, as the site says it for Windows and Linux. */
const soon = {
	text: Object.fromEntries(Object.values(shell).map((l) => [l.lang, l.words.soon])),
	variant: /** @type {const} */ ('note'),
};

/**
 * A page still to be written: in the sidebar, so the plan is visible, but
 * not a link yet (tterm.css), and Previous and Next skip it (routeData.ts).
 */
const planned = (label, ru, link) => ({
	label,
	translations: { ru },
	link,
	attrs: { 'data-planned': '', 'aria-disabled': 'true', tabindex: '-1' },
});

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
			editLink: { baseUrl: 'https://github.com/tterm-net/docs/edit/main/' },
			head: [
				{ tag: 'meta', attrs: { name: 'version', content: version } },
				// Until the docs are announced on tterm.net, search engines
				// leave them alone: the texts are still being agreed on.
				{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } },
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
					translations: { ru: 'Начало работы' },
					items: ['start/what-is-tterm', 'start/quick-start'],
				},
				{
					label: 'Machines',
					translations: { ru: 'Машины' },
					items: [
						'machines/servers',
						'machines/computers',
						planned('Remove a machine', 'Убрать машину', '/machines/remove/'),
					],
				},
				{
					label: 'Features',
					translations: { ru: 'Возможности' },
					items: [
						planned('Blocks and the command line', 'Блоки и строка ввода', '/features/blocks/'),
						planned('Search, ⌘K', 'Поиск, ⌘K', '/features/search/'),
						planned('Notes', 'Заметки', '/features/notes/'),
						planned('Projects and colors', 'Проекты и цвета', '/features/projects/'),
					],
				},
				{
					label: 'Local terminal',
					translations: { ru: 'Локальный терминал' },
					items: [
						'local/mac',
						{ slug: 'local/windows', badge: soon },
						{ slug: 'local/linux', badge: soon },
					],
				},
				{
					label: 'Security',
					translations: { ru: 'Безопасность' },
					items: [
						'security/access',
						planned('What we keep', 'Что мы храним', '/security/data/'),
					],
				},
				{
					label: 'Account',
					translations: { ru: 'Аккаунт' },
					items: [
						planned('Plan and limits', 'Тариф и пределы', '/account/plan/'),
						planned('Devices and signing in', 'Устройства и вход', '/account/devices/'),
					],
				},
			],
		}),
	],
});
