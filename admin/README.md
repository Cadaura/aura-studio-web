# Aura Admin Web

Authenticated owner-only administration client for the existing Aura API.

Open: https://cadaura.github.io/aura-studio-web/admin/

The desktop Admin account is reused; no separate registration or password is embedded in this website. Server authorization checks the active owner account and MFA. Browser sessions are stored in tab-scoped sessionStorage and cleared on logout. The panel requires internet access.

Includes account creation, account status and expiry controls, team membership, package assignment, notifications, devices, events, releases, support conversations, and an owner-only Rigel library. Built-in LISP sources stay on the server. JSON backups download through the browser. Mobile navigation and card-style tables support small screens.

Backend dependencies: aura-api and migration 202611200011_web_admin.sql in the private Aura Studio project. Do not copy that project's configuration secrets, session files, or engine sources into this public repository.
