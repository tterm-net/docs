#!/usr/bin/env python3
"""Copy the header's and the footer's words from the site into src/shell.json.

The docs wear the site's header and footer, so their words come from the
site's own strings (i18n/<code>.txt in tterm-net/site), not from a second
translation that could drift. Run it with the path of a site checkout:

    python3 scripts/shell_from_site.py ../site

Only the words the docs header and footer use are copied. The word "Docs"
itself is the docs' own, in DOCS below.
"""
import json
import pathlib
import sys

KEYS = [
    "home_label", "beta", "nav_label", "resources", "blog", "blog_note", "faq",
    "faq_note", "channel", "channel_note", "source", "source_note", "local",
    "lang_label", "signin", "start", "menu", "tagline", "links", "product",
    "mac", "new", "bot", "legal", "terms", "privacy", "license", "pricing",
    "security",
]

# code in the site, folder of the docs, short name on the button, own name
LANGUAGES = [
    ("en", "", "EN", "English"), ("de", "de", "DE", "Deutsch"),
    ("es", "es", "ES", "Español"), ("fr", "fr", "FR", "Français"),
    ("it", "it", "IT", "Italiano"), ("pl", "pl", "PL", "Polski"),
    ("pt-BR", "pt", "PT", "Português"), ("tr", "tr", "TR", "Türkçe"),
    ("ru", "ru", "RU", "Русский"), ("ja", "ja", "JA", "日本語"),
    ("ko", "ko", "KO", "한국어"), ("zh-CN", "zh", "ZH", "简体中文"),
]

# "Docs" next to the logo, and the docs' title in <title>.
DOCS = {
    "en": "Docs", "de": "Dokumentation", "es": "Documentación",
    "fr": "Documentation", "it": "Documentazione", "pl": "Dokumentacja",
    "pt-BR": "Documentação", "tr": "Belgeler", "ru": "Документация",
    "ja": "ドキュメント", "ko": "문서", "zh-CN": "文档",
}


def strings(path: pathlib.Path) -> dict:
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or " = " not in line:
            continue
        key, value = line.split(" = ", 1)
        out[key.strip()] = value.strip()
    return out


def main() -> None:
    site = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "../site")
    shell = {}
    for code, folder, short, own in LANGUAGES:
        s = strings(site / "i18n" / f"{code}.txt")
        missing = [k for k in KEYS if f"shell.{k}" not in s]
        if missing:
            sys.exit(f"{code}: no shell.{', shell.'.join(missing)} in the site's strings")
        words = {k: s[f"shell.{k}"] for k in KEYS}
        words["docs"] = DOCS[code]
        # "Soon" on the versions of the local terminal still in the works,
        # the word the site's download page uses for Windows and Linux.
        if "mac.soon" not in s:
            sys.exit(f"{code}: no mac.soon in the site's strings")
        words["soon"] = s["mac.soon"]
        shell[folder or "root"] = {
            "lang": code, "folder": folder, "short": short, "own": own,
            "words": words,
        }
    out = pathlib.Path(__file__).resolve().parent.parent / "src" / "shell.json"
    out.write_text(json.dumps(shell, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{out}: {len(shell)} languages, {len(KEYS) + 2} words each")


if __name__ == "__main__":
    main()
