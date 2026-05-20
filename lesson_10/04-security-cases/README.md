# 04 Security Cases

Ціль папки: показати практичні помилки навколо cookie/session auth.

## Приклади

- `01-http-only-vs-xss.js` — `document.cookie` vs HttpOnly; `GET /server-view`; `GET /clear-cookies` скидає демо-cookies.
- `02-unsafe-get-logout.js` — чому logout не має бути `GET`.

## Що перевіряти

- На `/` у `01` — `document.cookie` у блоці script; на `/server-view` — JSON з `req.cookies`. Лінки на головній і після `/set-cookies`.
- У `02` — ризик прев’ю/кешу/посилань на `GET` logout.
