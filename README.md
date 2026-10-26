# Shelf 2.0

Copyright 2026 Sytera Labs

Локальная полка для игр. Каталог — файл `shelf-data.json` рядом с программой. Он никуда не отправляется.

Исходный код выпущен под лицензией Apache 2.0. Лицензия — английский файл `LICENSE`. Если вы передаёте кому-то копию кода или собранную из него программу, передайте вместе `LICENSE` и `NOTICE`.

## Что здесь лежит

| Папка | Что это |
| --- | --- |
| `core` | Окно, каталог, запуск и часы. Язык Rust. |
| `src` | Страница полки: карточки, обложки, папки. |
| `public` | Шрифты, значок и мост страницы к окну. |
| `shelf.html` | Точка входа этой страницы. |

Программа для Windows — отдельный архив `Shelf-2.0-windows.zip` в том же выпуске. Она собрана из этих файлов. Метка `v2.0` указывает на этот же снимок.

## Как проверить

Откройте `core/src` и `src`. Это читаемый код полки, не содержимое `exe`. Файл `exe` — уже собранная программа. Сверить выпуск с кодом можно так: метка `v2.0`, архив `Shelf-2.0-source.zip` и пункт Source code на странице выпуска должны совпадать.

Сборка страницы: `npm install`, затем `npm run build:page`. Сборка программы для Windows требует Rust и цель `x86_64-pc-windows-gnullvm`. В `core/build.rs` указан компилятор ресурсов, которым собран этот выпуск.

---

A local shelf for games. The catalogue is `shelf-data.json` next to the program. It is not sent anywhere.

The source is released under the Apache License, Version 2.0. The license is the English file `LICENSE`. If you pass on a copy of this source or a program built from it, pass on `LICENSE` and `NOTICE` as well.

`core` is the window, catalogue, launch and clock, in Rust. `src` is the shelf page. `public` holds the fonts, the icon and the page bridge. `shelf.html` is the page entry.

The Windows program is `Shelf-2.0-windows.zip` in the same release. Tag `v2.0` points at this source.
