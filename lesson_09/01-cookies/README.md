# 01 Cookies

Ціль папки: показати, що cookie — це HTTP-механізм браузера для збереження маленьких пар `key=value`, а не готова аутентифікація.

## Приклади

- `01-set-and-read-cookie` — сервер ставить cookie, браузер повертає її в наступному запиті.
- `02-cookie-options` — `httpOnly`, `sameSite`, `secure`, `maxAge`, `path`.
- `03-client-visible-preferences` — нормальний кейс cookie, яку може читати JavaScript: theme/language.
- `04-tamper-cookie` — чому навіть `HttpOnly` cookie не можна використовувати як джерело правди для `userId`/ролей.

## Що перевіряти

- `Set-Cookie` у відповіді сервера.
- `Cookie` у наступному запиті.
- Видимість cookie через `document.cookie`.
- Ручну зміну cookie в DevTools.
- Атрибути `SameSite` у DevTools і Network response headers.

# Режими `Strict/Lax/None`,

## 1. Що таке "site"

"Site" для SameSite — це registrable domain.

- `shop.example` і `api.shop.example` → той самий site (`shop.example`).
- `shop.example` і `evil.example` → різні sites.
- `shop.example:3000` і `shop.example:8080` → той самий site (порт не важиливий).
- `http://shop.example` і `https://shop.example` → той самий site (схема не важлива для SameSite).

Це принципово відрізняється від CORS, де враховується origin (scheme + host + port). SameSite працює грубіше, на рівні registrable domain.

## 2. Що таке cross-site request

Запит вважається cross-site, коли **документ, що ініціює запит**, належить іншому site, ніж URL запиту. Ключове слово — **ініціює**. Не куди йде запит, а звідки.

- Користувач на `https://shop.example/cart` клікає посилання `/checkout` → same-site.
- Користувач на `https://evil.example/promo` сабмітить форму на `https://bank.example/transfer` → cross-site.

## 3. Навіщо SameSite взагалі існує

Якщо браузер автоматично прикріплює твої cookies до будь-якого запиту на `bank.example`, включно з тими, які ініціював зловмисний сайт зі сторони — це класичний CSRF. SameSite — це механізм, який каже браузеру: «не додавай cookie до запиту, якщо документ-ініціатор з чужого site».

## 4. Три режими

`SameSite=Strict` — найжорсткіший. Cookie додається тільки коли запит ініційований з того самого site. Будь-який зовнішній старт — cookie не йде.

```
evil.example → POST bank.example/transfer        ✗ cookie не йде
news.example → GET shop.example/   (клік)        ✗ cookie не йде
shop.example/cart → GET shop.example/checkout    ✓ cookie йде
```

Для Strict: коли користувач переходить на твій сайт з зовнішнього посилання, перший запит іде **без сесії**, навіть якщо він залогінений. Після того як він уже на твоєму домені — все працює нормально. Тому режим Strict біль для UX і застосовується вибірково (наприклад, на cookie для критичних дій: зміна паролю, переказ).

`SameSite=Lax` — дефолт у сучасних браузерах. Та сама логіка, що й Strict, з одним винятком: top-level GET-навігація з чужого site все ж пропускає cookie.

```
news.example: <a href="shop.example/sale">
  → GET + top-level → ✓ cookie йде

news.example: <form method="POST" action="shop.example/buy">
  → top-level, але POST → ✗ cookie не йде

news.example: <iframe src="shop.example/profile">
  → GET, але не top-level → ✗ cookie не йде

news.example: fetch("shop.example/api")
  → GET, але не top-level → ✗ cookie не йде
```

"Top-level" означає, що в адресному рядку браузера міняється URL — завантажується новий документ верхнього рівня. iframe, fetch, XHR, image, script — це не top-level. POST з форми — теж не виняток Lax, навіть якщо це top-level navigation.

`SameSite=None; Secure` — cookie додається завжди, включно з cross-site. Обмежень за site немає.

```
partner.example/embed → GET api.shop.example/session   ✓ cookie йде
```

Два обов'язкових моменти:

- `Secure` обов'язковий. Без нього браузер взагалі відхиляє таку cookie. Тобто HTTPS.
- `http://localhost` — виняток у сучасних браузерах, бо для localhost дозволено `Secure` без HTTPS (окрема політика для dev-середовища).

Коли реально потрібно `None`: вбудовані віджети (Disqus, Intercom, чат-боти), iframe-інтеграції, third-party OAuth redirects з кросдоменними cookies, аналітика на чужих доменах.

## 5. Підсумкова таблиця

| Сценарій                                 | Strict | Lax | None |
| ---------------------------------------- | ------ | --- | ---- |
| Same-site запит будь-якого типу          | ✓      | ✓   | ✓    |
| Cross-site GET top-level (клік по лінку) | ✗      | ✓   | ✓    |
| Cross-site POST                          | ✗      | ✗   | ✓    |
| Cross-site iframe / fetch / XHR / image  | ✗      | ✗   | ✓    |
