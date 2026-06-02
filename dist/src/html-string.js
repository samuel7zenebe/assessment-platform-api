export const htmlString = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Examination Platform API — Built for Scale</title>
<meta name="description" content="A modern examination platform API powered by Hono, Bun, Drizzle ORM, PostgreSQL, Better Auth, and Zod." />
<style>
  :root {
    --bg: #0a0a0f;
    --bg-2: #11111a;
    --surface: #15151f;
    --border: #23232f;
    --text: #ededf2;
    --muted: #8a8a99;
    --accent: #ff6b3d;
    --accent-2: #ffd23f;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  header {
    position: sticky; top: 0; z-index: 50;
    backdrop-filter: blur(12px);
    background: rgba(10,10,15,0.7);
    border-bottom: 1px solid var(--border);
  }
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; max-width: 1200px; margin: 0 auto;
  }
  .logo {
    font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 8px;
  }
  .logo-dot {
    width: 10px; height: 10px; border-radius: 2px;
    background: var(--accent); display: inline-block;
  }
  nav ul { display: flex; gap: 32px; list-style: none; }
  nav a { color: var(--muted); text-decoration: none; font-size: 0.92rem; transition: color .2s; }
  nav a:hover { color: var(--text); }

  .hero {
    padding: 120px 0 100px;
    background:
      radial-gradient(circle at 20% 0%, rgba(255,107,61,0.15), transparent 50%),
      radial-gradient(circle at 80% 30%, rgba(255,210,63,0.08), transparent 50%);
  }
  .hero-inner { max-width: 820px; }
  .eyebrow {
    display: inline-block;
    font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 24px;
    padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px;
  }
  h1 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.05;
    margin-bottom: 24px;
  }
  h1 .grad {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .lead {
    font-size: 1.2rem; color: var(--muted); max-width: 620px; margin-bottom: 40px;
  }
  .cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent); color: #1a0d05;
    padding: 14px 24px; border-radius: 8px;
    font-weight: 600; text-decoration: none;
    transition: transform .15s, box-shadow .2s;
  }
  .cta:hover { transform: translateY(-1px); box-shadow: 0 10px 30px -10px var(--accent); }

  section { padding: 100px 0; border-top: 1px solid var(--border); }
  .section-head { margin-bottom: 56px; max-width: 640px; }
  h2 {
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 700; letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .section-head p { color: var(--muted); font-size: 1.05rem; }

  .stack-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .stack-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    transition: border-color .2s, transform .2s;
  }
  .stack-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .stack-card .row {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 8px; gap: 12px;
  }
  .stack-card .head {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  .stack-card .logo-img {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: #fff; border-radius: 8px; padding: 5px;
    flex-shrink: 0;
  }
  .stack-card .logo-img img { width: 100%; height: 100%; object-fit: contain; }
  .stack-card h3 { font-size: 1.05rem; font-weight: 600; }
  .stack-card .ver {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 0.78rem; color: var(--accent); white-space: nowrap;
  }
  .stack-card p { color: var(--muted); font-size: 0.9rem; }
  .tag {
    display: inline-block; font-size: 0.7rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted);
    margin-top: 12px;
  }
  .tag.dev { color: var(--accent-2); }

  .scripts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }
  .script {
    background: var(--bg-2); border: 1px solid var(--border);
    border-radius: 10px; padding: 20px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .script .name { color: var(--accent); font-size: 0.85rem; margin-bottom: 6px; }
  .script .cmd { color: var(--text); font-size: 0.92rem; }

  footer {
    padding: 40px 0; border-top: 1px solid var(--border);
    text-align: center; color: var(--muted); font-size: 0.85rem;
  }
</style>
</head>
<body>

<header>
  <nav>
    <div class="logo"><span class="logo-dot"></span> exam-api</div>
    <ul>
      <li><a href="#stack">Stack</a></li>
      <li><a href="#scripts">Scripts</a></li>
      <li><a href="#tooling">Tooling</a></li>
    </ul>
  </nav>
</header>

<main>
  <section class="hero" style="border-top:none;">
    <div class="container hero-inner">
      <span class="eyebrow">Examination Platform API</span>
      <h1>A type-safe API <span class="grad">built on modern runtimes.</span></h1>
      <p class="lead">An OpenAPI-documented backend powered by Hono, Bun, and PostgreSQL — with Drizzle ORM, Better Auth, and end-to-end Zod validation.</p>
      <a href="#stack" class="cta">Explore the stack →</a>
    </div>
  </section>

  <section id="stack">
    <div class="container">
      <div class="section-head">
        <h2>Runtime & Dependencies</h2>
        <p>Every package powering the platform — runtime libraries that ship to production.</p>
      </div>
      <div class="stack-grid">

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRTM2MDAyIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SG9ubzwvdGl0bGU+PHBhdGggZD0iTTEyLjQ0NS4wMDJhNDUuNTI5IDQ1LjUyOSAwIDAgMC01LjI1MiA4LjE0NiA4LjU5NSA4LjU5NSAwIDAgMS0uNTU1LS41MyAyNy43OTYgMjcuNzk2IDAgMCAwLTEuMjA1LTEuNTQyIDguNzYyIDguNzYyIDAgMCAwLTEuMjUxIDIuMTIgMjAuNzQzIDIwLjc0MyAwIDAgMC0xLjQ0OCA1Ljg4IDguODY3IDguODY3IDAgMCAwIC4zMzggMy40NjhjMS4zMTIgMy40OCAzLjc5NCA1LjU5MyA3LjQ0NSA2LjMzNyAzLjA1NS40MzggNS43NTUtLjMzMyA4LjA5Ny0yLjMxMiAyLjY3Ny0yLjU5IDMuMzU5LTUuNjM0IDIuMDQ3LTkuMTMyYTMzLjI4NyAzMy4yODcgMCAwIDAtMi45ODgtNS41OUE5MS4zNCA5MS4zNCAwIDAgMCAxMi42MTUuMDUzYS4yMTYuMjE2IDAgMCAwLS4xNy0uMDUxWm0tLjMzNiAzLjkwNmE1MC45MyA1MC45MyAwIDAgMSA0Ljc5NCA2LjU1MmMuNDQ4Ljc2Ny44MTcgMS41NyAxLjEwOCAyLjQxLjYwNiAyLjM4Ni0uMDQ0IDQuMzU0LTEuOTUxIDUuOTA0LTEuODQ1IDEuMjk4LTMuODcgMS42ODMtNi4wNzIgMS4xNTYtMi4zNzYtLjczNy0zLjc1LTIuMzM1LTQuMTIxLTQuNzk0YTUuMTA3IDUuMTA3IDAgMCAxIC4yNDItMi4yNjZjLjM1OC0uOTA4Ljc5LTEuNzc0IDEuMy0yLjYwMWwxLjQ0Ni0yLjEyMWEzOTcuMzMgMzk3LjMzIDAgMCAwIDMuMjU0LTQuMjRaIi8+PC9zdmc+" alt="Hono logo" /></div>
            <div class="row" style="flex:1;"><h3>Hono</h3><span class="ver">^4.12.18</span></div>
          </div>
          <p>Ultrafast web framework for the edges and serverless runtimes.</p>
          <span class="tag">core framework</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMzM5OTMzIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Tm9kZS5qczwvdGl0bGU+PHBhdGggZD0iTTExLjk5OCwyNGMtMC4zMjEsMC0wLjY0MS0wLjA4NC0wLjkyMi0wLjI0N2wtMi45MzYtMS43MzdjLTAuNDM4LTAuMjQ1LTAuMjI0LTAuMzMyLTAuMDgtMC4zODMgYzAuNTg1LTAuMjAzLDAuNzAzLTAuMjUsMS4zMjgtMC42MDRjMC4wNjUtMC4wMzcsMC4xNTEtMC4wMjMsMC4yMTgsMC4wMTdsMi4yNTYsMS4zMzljMC4wODIsMC4wNDUsMC4xOTcsMC4wNDUsMC4yNzIsMGw4Ljc5NS01LjA3NiBjMC4wODItMC4wNDcsMC4xMzQtMC4xNDEsMC4xMzQtMC4yMzhWNi45MjFjMC0wLjA5OS0wLjA1My0wLjE5Mi0wLjEzNy0wLjI0MmwtOC43OTEtNS4wNzJjLTAuMDgxLTAuMDQ3LTAuMTg5LTAuMDQ3LTAuMjcxLDAgTDMuMDc1LDYuNjhDMi45OSw2LjcyOSwyLjkzNiw2LjgyNSwyLjkzNiw2LjkyMXYxMC4xNWMwLDAuMDk3LDAuMDU0LDAuMTg5LDAuMTM5LDAuMjM1bDIuNDA5LDEuMzkyIGMxLjMwNywwLjY1NCwyLjEwOC0wLjExNiwyLjEwOC0wLjg5VjcuNzg3YzAtMC4xNDIsMC4xMTQtMC4yNTMsMC4yNTYtMC4yNTNoMS4xMTVjMC4xMzksMCwwLjI1NSwwLjExMiwwLjI1NSwwLjI1M3YxMC4wMjEgYzAsMS43NDUtMC45NSwyLjc0NS0yLjYwNCwyLjc0NWMtMC41MDgsMC0wLjkwOSwwLTIuMDI2LTAuNTUxTDIuMjgsMTguNjc1Yy0wLjU3LTAuMzI5LTAuOTIyLTAuOTQ1LTAuOTIyLTEuNjA0VjYuOTIxIGMwLTAuNjU5LDAuMzUzLTEuMjc1LDAuOTIyLTEuNjAzbDguNzk1LTUuMDgyYzAuNTU3LTAuMzE1LDEuMjk2LTAuMzE1LDEuODQ4LDBsOC43OTQsNS4wODJjMC41NywwLjMyOSwwLjkyNCwwLjk0NCwwLjkyNCwxLjYwMyB2MTAuMTVjMCwwLjY1OS0wLjM1NCwxLjI3My0wLjkyNCwxLjYwNGwtOC43OTQsNS4wNzhDMTIuNjQzLDIzLjkxNiwxMi4zMjQsMjQsMTEuOTk4LDI0eiBNMTkuMDk5LDEzLjk5MyBjMC0xLjktMS4yODQtMi40MDYtMy45ODctMi43NjNjLTIuNzMxLTAuMzYxLTMuMDA5LTAuNTQ4LTMuMDA5LTEuMTg3YzAtMC41MjgsMC4yMzUtMS4yMzMsMi4yNTgtMS4yMzMgYzEuODA3LDAsMi40NzMsMC4zODksMi43NDcsMS42MDdjMC4wMjQsMC4xMTUsMC4xMjksMC4xOTksMC4yNDcsMC4xOTloMS4xNDFjMC4wNzEsMCwwLjEzOC0wLjAzMSwwLjE4Ni0wLjA4MSBjMC4wNDgtMC4wNTQsMC4wNzQtMC4xMjMsMC4wNjctMC4xOTZjLTAuMTc3LTIuMDk4LTEuNTcxLTMuMDc2LTQuMzg4LTMuMDc2Yy0yLjUwOCwwLTQuMDA0LDEuMDU4LTQuMDA0LDIuODMzIGMwLDEuOTI1LDEuNDg4LDIuNDU3LDMuODk1LDIuNjk1YzIuODgsMC4yODIsMy4xMDMsMC43MDMsMy4xMDMsMS4yNjljMCwwLjk4My0wLjc4OSwxLjQwMi0yLjY0MiwxLjQwMiBjLTIuMzI3LDAtMi44MzktMC41ODQtMy4wMTEtMS43NDJjLTAuMDItMC4xMjQtMC4xMjYtMC4yMTUtMC4yNTMtMC4yMTVoLTEuMTM3Yy0wLjE0MSwwLTAuMjU0LDAuMTEyLTAuMjU0LDAuMjUzIGMwLDEuNDgyLDAuODA2LDMuMjQ4LDQuNjU1LDMuMjQ4QzE3LjUwMSwxNy4wMDcsMTkuMDk5LDE1LjkxLDE5LjA5OSwxMy45OTN6Ii8+PC9zdmc+" alt="Node.js logo" /></div>
            <div class="row" style="flex:1;"><h3>@hono/node-server</h3><span class="ver">^1.19.14</span></div>
          </div>
          <p>Node.js adapter for running Hono outside edge runtimes.</p>
          <span class="tag">adapter</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNkJBNTM5IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+T3BlbkFQSSBJbml0aWF0aXZlPC90aXRsZT48cGF0aCBkPSJNMjEuMDM5IDBhMi45NTkgMi45NTkgMCAwMC0yLjY1IDQuMjc0bC02LjQ0NyA2LjQ0N2EyLjk2IDIuOTYgMCAxMDEuMzM1IDEuMzM2bDYuNDQ3LTYuNDQ3QTIuOTU5IDIuOTU5IDAgMTAyMS4wNCAwek0xMC42MjggMi43NDVjLS4wNzIgMC0uMTQzLjAwMy0uMjE0LjAwNC0uMDcyLjAwMi0uMTQzLjAwMi0uMjE1LjAwNS0uNDQ3LjAxOC0uODkzLjA2NC0xLjMzNS4xMzhsLS4wMy4wMDUtLjE4NS4wMzMtLjEwNS4wMmE3LjcxOCA3LjcxOCAwIDAwLS4yODkuMDYybC0uMDMyLjAwOGExMC42OSAxMC42OSAwIDAwLTIuNTUuOTVsLS4xNTUuMDg5Yy0uMDYzLjAzNC0uMTI1LjA3LS4xODcuMTA1LS4wNDYuMDI3LS4wOTMuMDUxLS4xNC4wNzlINS4xOWwtLjAxLjAwNS0uMDM2LjAydi4wMDJsLjExMS4xODQgMy4xNSA1LjIzYTQuMTY4IDQuMTY4IDAgMDEuMzgtLjIwMiA0LjI5NCA0LjI5NCAwIDAxMS42MjgtLjQxM2MuMDcxLS4wMDQuMTQzLS4wMDguMjE0LS4wMDh6bS40MjguMDF2Ni4zMzNjLjMyNS4wMzQuNjQ3LjEwMy45Ni4yMDlsNC42Ni00LjY2Yy0uMTczLS4xMi0uMzQ4LS4yMzctLjUyOC0uMzQ3bC0uMDI2LS4wMTVjLS4wNTYtLjAzNS0uMTEyLS4wNjctLjE2OC0uMWwtLjA5OC0uMDU2LS4wOTktLjA1NWExMi43MzUgMTIuNzM1IDAgMDAtLjE3MS0uMDkybC0uMDI3LS4wMTRhMTAuNjI4IDEwLjYyOCAwIDAwLTEuNDI1LS42MTdjLS42OS0uMjQxLTEuNDAzLS40MS0yLjEyOC0uNTA1bC0uMDg5LS4wMTItLjA5LS4wMWE2LjU2IDYuNTYgMCAwMC0uMTctLjAxOWwtLjA0OS0uMDA0LS4yMDQtLjAxN2E2LjQ0IDYuNDQgMCAwMC0uMjU1LS4wMTVjLS4wMzEtLjAwMy0uMDYyLS4wMDMtLjA5My0uMDA0ek00Ljc4MiA0LjQ5OGE5LjkyIDkuOTIgMCAwMC0xLjM2IDEuMDYybDQuNDYxIDQuNDYxLjAxOC4wMThjLjA0OS0uMDQuMDk4LS4wNzguMTQ5LS4xMTZsLS4wMTEtLjAxOHptLTEuNjcgMS4zNmMtLjA1LjA1LS4wOTguMTAzLS4xNDcuMTU0bC0uMTQ5LjE1NWMtLjMzLjM1Ny0uNjMuNzMtLjkwMiAxLjExOGwtLjAzOS4wNTZhMTAuNTg4IDEwLjU4OCAwIDAwLS4yMTYuMzI2IDEwLjYgMTAuNiAwIDAwLTEuNjUgNS4yNzZsLS4wMDYuMjE1LS4wMDMuMjE0aDYuMzE3YzAtLjA3Mi4wMDctLjE0My4wMS0uMjE0LjAwNS0uMDcyLjAwNi0uMTQ0LjAxMy0uMjE1LjA4MS0uODIyLjM5OS0xLjYyNS45NTItMi4zLjA0NS0uMDU1LjA5Ni0uMTA2LjE0NC0uMTYuMDQ4LS4wNTIuMDkzLS4xMDcuMTQ0LS4xNTh6bTE2LjI1NSAxLjQ2NGwtNC42NjMgNC42NjNjLjEwNi4zMTIuMTc1LjYzNC4yMS45NTloNi4zMzJsLS4wMDQtLjA5NGExMS41NzkgMTEuNTc5IDAgMDAtLjAzMi0uNDU2bC0uMDA1LS4wNTJhMTMuMDQ0IDEzLjA0NCAwIDAwLS4wMjYtLjI0MXYtLjAwOWwtLjAzMy0uMjR2LS4wMDlhMTAuNjE4IDEwLjYxOCAwIDAwLS4zMjctMS40OTNsLS4wMDMtLjAxYTE1LjgzOSAxNS44MzkgMCAwMC0uMDctLjIyOGwtLjAxLS4wM2ExNC4xMTEgMTQuMTExIDAgMDAtLjA2OS0uMjA0bC0uMDItLjA1NWE1LjY1IDUuNjUgMCAwMC0uMTUzLS40MDUgNy44NCA3Ljg0IDAgMDAtLjA5My0uMjI3IDE2LjY3IDE2LjY3IDAgMDAtLjA2My0uMTQ0bC0uMDM3LS4wODFhMTMuNzc2IDEzLjc3NiAwIDAwLS4wOC0uMTcxbC0uMDI0LS4wNTItLjA5Ni0uMTk0LS4wMTQtLjAyN2ExMS4yIDExLjIgMCAwMC0uMTEyLS4yMTJsLS4wMDQtLjAwOGExMC42MTUgMTAuNjE1IDAgMDAtLjYwNC0uOTh6bS00LjQzIDYuMDVjMCAuMDcxLS4wMDYuMTQyLS4wMS4yMTQtLjAwMy4wNzItLjAwNS4xNDMtLjAxMi4yMTRhNC4yOSA0LjI5IDAgMDEtLjk1MiAyLjMwMWMtLjA0NS4wNTUtLjA5Ni4xMDctLjE0NC4xNi0uMDQ4LjA1My0uMDkzLjEwOC0uMTQ0LjE1OWw0LjQ2NyA0LjQ2N2MuMDUxLS4wNTEuMDk5LS4xMDQuMTQ4LS4xNTUuMDUtLjA1Mi4xLS4xMDMuMTQ4LS4xNTUuMzMxLS4zNTguNjMzLS43MzMuOTA1LTEuMTIybC4wMzItLjA0Ni4wOTgtLjE0NC4wODUtLjEzLjA0LS4wNjNhMTAuNTk3IDEwLjU5NyAwIDAwMS42NDctNS4yNzJjLjAwMy0uMDcxLjAwNC0uMTQzLjAwNi0uMjE0LjAwMS0uMDcxLjAwNC0uMTQzLjAwNC0uMjE0ek0uMDEgMTMuOGwuMDA0LjA5My4wMS4xNzkuMDA1LjA3Ni4wMTcuMjA2LjAwNS4wNDZjLjAwNy4wNzYuMDE1LjE1My4wMjQuMjI4bC4wMDMuMDIyYTkuNjA1IDkuNjA1IDAgMDAuMDMzLjI0OGMuMDcyLjUwNS4xODIgMS4wMDUuMzI3IDEuNDk3bC4wMDIuMDA2Yy4wMjIuMDc3LjA0Ny4xNTQuMDcxLjIzbC4wMDQuMDE0LjAwNS4wMTRhMTUuNzM3IDE1LjczNyAwIDAwLjE1My40MzlsLjAzLjA4LjA1OS4xNDhhNy43MDIgNy43MDIgMCAwMC4wOTMuMjI4bC4wNjIuMTQuMDM4LjA4NC4wNzguMTY5LjAyNy4wNTRhMTAuNjc3IDEwLjY3NyAwIDAwLjIyNS40NDFsLjAyNS4wNDMgNS40MDgtMy4yNTguMDItLjAxMmE0LjMxNCA0LjMxNCAwIDAxLS4zOTUtMS40MTRoLS4wMjV6bS41MDUgMi44NDZsLS4yMDYuMDU4LjAwMi4wMDV6bTYuNDI1LTEuMDUybC01LjQxNSAzLjI2MmMuMDgzLjEzOS4xNy4yNzMuMjU5LjQwNmwuMDA4LjAxNC4wMDQuMDA1LjAwOC4wMTRoLjAwMWMuMDA3LjAxMi4wMTQuMDIyLjAyMi4wMzJsLjAwMS4wMDJ2LjAwMWExMC42MzQgMTAuNjM0IDAgMDAuMjk4LjQxN2wuMDA2LjAwOGE5Ljk2MyA5Ljk2MyAwIDAwLjI5LjM2OGwuMDMzLjA0Yy4wNDMuMDUyLjA4Ni4xMDMuMTMuMTUzbC4wNTcuMDY1LjExMi4xMjcuMDY0LjA2OS4wMjkuMDMxLjA4My4wOS4wMzUuMDM1Yy4wNDkuMDUxLjA5OC4xMDMuMTQ5LjE1M0w3LjU4IDE2LjQyYTMuODYgMy44NiAwIDAxLS4yODUtLjMyMSA0LjQyMiA0LjQyMiAwIDAxLS4zNTYtLjUwNXptNi40MTYgMS4xMTFjLS4wNS4wNC0uMS4wNzktLjE1LjExNmwuMDExLjAxOCAzLjI1NyA1LjQwN2MuMTUxLS4wOTkuMy0uMi40NDYtLjMwNy4zMTUtLjIzMi42Mi0uNDg0LjkxNC0uNzU2bC00LjQ2LTQuNDZ6bS01LjQ1Ny4wMDNsLS4wMTUuMDE1LTQuNDYgNC40NmE4Ljk2NiA4Ljk2NiAwIDAwLjE5NS4xNzZjLjAyMi4wMi4wNDMuMDQuMDY1LjA1OGwuMTUyLjEzYTEwLjYyMiAxMC42MjIgMCAwMC4yMTUuMTc0bC4wMjMuMDE3LjE5MS4xNDguMDA4LjAwNWMuMjY4LjIuNTQ3LjM4OS44MzQuNTY0bC4wMy4wMTguMTY0LjA5Ny4xMDEuMDU3YTUuNDU4IDUuNDU4IDAgMDAuMjcuMTQ4Yy4wMDguMDA0LjAxNi4wMS4wMjUuMDEzLjE2Mi4wODUuMzI3LjE2NC40OTMuMjRsLjE1OC0uMzg1IDIuMjQzLTUuNDQ4LjAwOS0uMDJhNC4zMjggNC4zMjggMCAwMS0uNzAxLS40Njd6bTQuOTUxLjM1M2MtLjA2MS4wMzctLjEyNC4wNy0uMTg3LjEwNGE0LjMxOCA0LjMxOCAwIDAxLTMuMjcxLjMzNmMtLjA2OS0uMDItLjEzNS0uMDQ3LS4yMDMtLjA3MS0uMDY3LS4wMjQtLjEzNi0uMDQ0LS4yMDItLjA3MmwtMi4yNDIgNS40NDQtLjA4OC4yMTMtLjA3NS4xODN2LjAwMWwuMDE3LjAwN2EuMTM3LjEzNyAwIDAwLjAxOS4wMDdsLjAwNS4wMDNjLjA1Mi4wMjEuMTA2LjA0LjE1OS4wNi4wNjcuMDI3LjEzMy4wNTMuMi4wNzdsLjEwMi4wNGMuNzAyLjI0NyAxLjQzLjQyIDIuMTY4LjUxOGwuMDg3LjAxMi4wOS4wMS4xNzIuMDE5YTcuMTczIDcuMTczIDAgMDAuMjUyLjAyMmMuMDIzLjAwMS4wNDguMDAxLjA3MS4wMDNsLjE4NC4wMTEuMTEyLjAwNWE3LjA2IDcuMDYgMCAwMC4zNTguMDA3aC4wNWExMC42NjcgMTAuNjY3IDAgMDAxLjc5My0uMTVsLjE4NS0uMDM0LjEwNS0uMDIuMTA5LS4wMjMuMTgtLjA0LjAzMi0uMDA4YTEwLjY4NCAxMC42ODQgMCAwMDIuNTUtLjk1Yy4wNTItLjAyOC4xMDQtLjA2LjE1Ni0uMDg5LjA2My0uMDM0LjEyNS0uMDcuMTg3LS4xMDUuMDQzLS4wMjQuMDg3LS4wNDcuMTMtLjA3M2guMDAxbC4wMDItLjAwMi4wMDItLjAwMS4wMDItLjAwMS4wMDctLjAwNC4wNDItLjAyNS0uMTEtLjE4My0uMTEtLjE4NHptMy4yNjIgNS40MTRsLS4wNDIuMDI1LjA0Mi0uMDI0em0tLjA1LjAyOXptLS4wMDUuMDA0aC0uMDAyeiIvPjwvc3ZnPg==" alt="OpenAPI logo" /></div>
            <div class="row" style="flex:1;"><h3>@hono/zod-openapi</h3><span class="ver">^1.4.0</span></div>
          </div>
          <p>OpenAPI 3 spec generation backed by Zod schemas.</p>
          <span class="tag">openapi</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjODVFQTJEIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+U3dhZ2dlcjwvdGl0bGU+PHBhdGggZD0iTTEyIDBDNS4zODMgMCAwIDUuMzgzIDAgMTJzNS4zODMgMTIgMTIgMTJjNi42MTYgMCAxMi01LjM4MyAxMi0xMlMxOC42MTYgMCAxMiAwem0wIDEuMTQ0YzUuOTk1IDAgMTAuODU2IDQuODYgMTAuODU2IDEwLjg1NiAwIDUuOTk1LTQuODYgMTAuODU2LTEwLjg1NiAxMC44NTYtNS45OTYgMC0xMC44NTYtNC44Ni0xMC44NTYtMTAuODU2QzEuMTQ0IDYuMDA0IDYuMDA0IDEuMTQ0IDEyIDEuMTQ0ek04LjM3IDUuODY4YTYuNzA3IDYuNzA3IDAgMCAwLS40MjMuMDA1Yy0uOTgzLjA1Ni0xLjU3My41MTctMS43MzUgMS40NzItLjExNS42NjUtLjA5NiAxLjM0OC0uMTQzIDIuMDE3LS4wMTMuMzUtLjA1LjY5Ny0uMTE1IDEuMDM4LS4xMzQuNjA5LS4zOTcuNzk4LTEuMDE2LjgzYTIuNjUgMi42NSAwIDAgMC0uMjQ0LjA0MnYxLjQ2M2MxLjEyNi4wNTUgMS4yNzguNDUyIDEuMzcgMS42MjkuMDMzLjQyOS0uMDEzLjg1OC4wMTUgMS4yODcuMDE4LjQwNi4wNzMuODA4LjE1NiAxLjIuMjU5IDEuMDc1IDEuMzA3IDEuNDM1IDIuNTc1IDEuMjE4di0xLjI4M2MtLjIwMyAwLS4zODMuMDA1LS41NTggMC0uNDMtLjAxMy0uNTkxLS4xMi0uNjMyLS41MzUtLjA1Ni0uNTM1LS4wNDItMS4wOC0uMDc1LTEuNjItLjA2NC0xLjAwMS0uMTc1LTEuOTg4LTEuMTUzLTIuNjI1LjUwMy0uMzcuODY4LS44MTIuOTgzLTEuMzk4LjA4My0uNDEuMTM0LS44MjEuMTY2LTEuMjM3LjAyOC0uNDE1LS4wMjMtLjg0LjAxNC0xLjI1LjA2LS42NjUuMTAyLS45MzcuOS0uOTEuMTIgMCAuMjM1LS4wMTcuMzY5LS4wMjd2LTEuMzFjLS4xNiAwLS4zMS0uMDA0LS40NTQtLjAwNnptNy41OTMuMDA5YTQuMjQ3IDQuMjQ3IDAgMCAwLS44MTMuMDZ2MS4yNzRjLjI0NSAwIC40MzQgMCAuNjIzLjAwNS4zMjguMDA0LjU3Ny4xMy42MS40OTQuMDMyLjMzMi4wMzEuNjY5LjA2NCAxLjAwNi4wNjUuNjY5LjEwMSAxLjM0Ny4yMTcgMi4wMDcuMTAyLjU0NC40NzUuOTUuOTQxIDEuMjgzLS44MTcuNTQ5LTEuMDU3IDEuMzMzLTEuMDk4IDIuMjE1LS4wMjMuNjA0LS4wMzcgMS4yMTMtLjA2OSAxLjgyMi0uMDI4LjU1NC0uMjIyLjczNC0uNzguNzQ4LS4xNTcuMDA0LS4zMS4wMTgtLjQ4NC4wMjh2MS4zMDVjLjMyNyAwIC42MjcuMDE5LjkyNyAwIC45MzItLjA1NSAxLjQ5NS0uNTA3IDEuNjgtMS40MTIuMDc4LS40OTguMTI0LTEgLjEzOC0xLjUwNC4wMzItLjQ2MS4wMjgtLjkyNy4wNzQtMS4zODQuMDY5LS43MTUuMzk3LTEuMDEgMS4xMTItMS4wNTdhLjk3Mi45NzIgMCAwIDAgLjE5OS0uMDQ2di0xLjQ2M2MtLjEyLS4wMTQtLjIwNC0uMDI3LS4yOTEtLjAzMi0uNTM2LS4wMjMtLjgwNC0uMjAzLS45MzctLjcxYTUuMTQ2IDUuMTQ2IDAgMCAxLS4xNTItLjk5M2MtLjAzNy0uNjE4LS4wMzMtMS4yNDEtLjA3NC0xLjg2LS4wOC0xLjE5Mi0uNzk0LTEuNzUzLTEuODg3LTEuNzg2em0tNi44OSA1LjI4YS44NDQuODQ0IDAgMCAwLS4wODMgMS42ODRoLjA1NWEuODMuODMgMCAwIDAgLjg3Ny0uNzh2LS4wNDZhLjg0NS44NDUgMCAwIDAtLjgzLS44NTh6bTIuOTExIDBhLjgwOC44MDggMCAwIDAtLjgzNC43OGMwIC4wMjcgMCAuMDUuMDA0LjA3OCAwIC41MDMuMzQyLjgyNi44NTkuODI2LjUwNyAwIC44MjYtLjMzMi44MjYtLjg1My0uMDA1LS41MDMtLjM0Mi0uODM2LS44NTUtLjgzMXptMi45NjMgMGEuODYxLjg2MSAwIDAgMC0uODc2LjgzNWMwIC40Ny4zNzguODQ5Ljg0OS44NDloLjAwOWMuNDI1LjA3NC44NTMtLjMzNy44ODEtLjgzLjAyMy0uNDU3LS4zOTItLjg1NC0uODYzLS44NTR6Ii8+PC9zdmc+" alt="Swagger logo" /></div>
            <div class="row" style="flex:1;"><h3>@hono/swagger-ui</h3><span class="ver">^0.6.1</span></div>
          </div>
          <p>Swagger UI middleware for interactive API docs.</p>
          <span class="tag">docs</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRTM2MDAyIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SG9ubzwvdGl0bGU+PHBhdGggZD0iTTEyLjQ0NS4wMDJhNDUuNTI5IDQ1LjUyOSAwIDAgMC01LjI1MiA4LjE0NiA4LjU5NSA4LjU5NSAwIDAgMS0uNTU1LS41MyAyNy43OTYgMjcuNzk2IDAgMCAwLTEuMjA1LTEuNTQyIDguNzYyIDguNzYyIDAgMCAwLTEuMjUxIDIuMTIgMjAuNzQzIDIwLjc0MyAwIDAgMC0xLjQ0OCA1Ljg4IDguODY3IDguODY3IDAgMCAwIC4zMzggMy40NjhjMS4zMTIgMy40OCAzLjc5NCA1LjU5MyA3LjQ0NSA2LjMzNyAzLjA1NS40MzggNS43NTUtLjMzMyA4LjA5Ny0yLjMxMiAyLjY3Ny0yLjU5IDMuMzU5LTUuNjM0IDIuMDQ3LTkuMTMyYTMzLjI4NyAzMy4yODcgMCAwIDAtMi45ODgtNS41OUE5MS4zNCA5MS4zNCAwIDAgMCAxMi42MTUuMDUzYS4yMTYuMjE2IDAgMCAwLS4xNy0uMDUxWm0tLjMzNiAzLjkwNmE1MC45MyA1MC45MyAwIDAgMSA0Ljc5NCA2LjU1MmMuNDQ4Ljc2Ny44MTcgMS41NyAxLjEwOCAyLjQxLjYwNiAyLjM4Ni0uMDQ0IDQuMzU0LTEuOTUxIDUuOTA0LTEuODQ1IDEuMjk4LTMuODcgMS42ODMtNi4wNzIgMS4xNTYtMi4zNzYtLjczNy0zLjc1LTIuMzM1LTQuMTIxLTQuNzk0YTUuMTA3IDUuMTA3IDAgMCAxIC4yNDItMi4yNjZjLjM1OC0uOTA4Ljc5LTEuNzc0IDEuMy0yLjYwMWwxLjQ0Ni0yLjEyMWEzOTcuMzMgMzk3LjMzIDAgMCAwIDMuMjU0LTQuMjRaIi8+PC9zdmc+" alt="Hono logo" /></div>
            <div class="row" style="flex:1;"><h3>@hono/standard-validator</h3><span class="ver">^0.2.2</span></div>
          </div>
          <p>Standard Schema validator middleware for request validation.</p>
          <span class="tag">validation</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjM0U2N0IxIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Wm9kPC90aXRsZT48cGF0aCBkPSJNMi41ODQgMy41ODJhMi4yNDcgMi4yNDcgMCAwIDEgMi4xMTItMS40NzloMTQuNjE3Yy45NDggMCAxLjc5NC41OTUgMi4xMTUgMS40ODdsMi40NCA2Ljc3N2EyLjI0OCAyLjI0OCAwIDAgMS0uNjI0IDIuNDQzbC05LjYxIDguNTJhMi4yNDcgMi4yNDcgMCAwIDEtMi45NjMuMDE4TC43NzYgMTIuNzczYTIuMjQ4IDIuMjQ4IDAgMCAxLS42NC0yLjQ2N1ptMTIuMDM4IDQuODg3LTkuMTEgNS41MzcgNS43NCA1LjAwN2MuNDU2LjM5OSAxLjEzOS4zOTYgMS41OTMtLjAwNmw1LjY0My01LjAwMUgxNC40bDYuMjM5LTMuOTU3Yy40ODgtLjMyOC42OS0uOTQ3LjQ5MS0xLjVsLTEuMjQtMy40NDZhMS41MzUgMS41MzUgMCAwIDAtMS40NTYtMS4wMTVINS41NDVhMS41MzUgMS41MzUgMCAwIDAtMS40MzEgMS4wMWwtMS4yMjggMy4zN3oiLz48L3N2Zz4=" alt="Zod logo" /></div>
            <div class="row" style="flex:1;"><h3>Zod</h3><span class="ver">^4.4.3</span></div>
          </div>
          <p>TypeScript-first schema declaration and validation.</p>
          <span class="tag">schema</span>
        </div>

        <div class="stack-card">
          <div class="head">
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="51.657" viewBox="0 0 400 51.657">
    <path fill="#fff" fill-rule="evenodd"
        d="M0 25.83v22.84h15.33V33.5h15v15.17H61V3H30.33v15.17h-15V3H0zm80.11-14.89c-.06.07-.11 7.6-.11 16.75v16.64h7.23c10.6 0 12.86-.66 15.18-4.48 1.14-1.89 1.34-6.58.36-8.48-.8-1.54-3.19-3.87-3.97-3.87-.13 0-.6-.12-1.02-.27l-.78-.26 1.34-.68c2.7-1.36 3.75-3.17 3.74-6.46-.01-5.1-3-8.2-8.51-8.82-1.63-.2-13.28-.24-13.46-.07m28.72 16.64v16.75h20.67V40.5h-16.33v-11h15v-3.67h-15v-11h16.18l-.05-1.95-.05-1.96-10.2-.05-10.22-.04zm24.58-16.53c-.05.12-.07 1-.04 1.96l.05 1.74 5.29.04 5.29.05v29.49h4.17v-29.5h10.5v-4h-12.6c-10.25 0-12.6.04-12.66.22m28.53-.1c-.06.06-.1.96-.1 2v1.88h10.66v29.5h4.17v-29.5H187v-4h-12.47c-6.86 0-12.52.05-12.59.11m30.17 0c-.06.07-.11 7.6-.11 16.75v16.64h20.83V40.5H196.5v-11h15v-3.67h-15v-11h16v-4h-10.14c-5.58 0-10.19.05-10.25.11m26.56 16.64v16.75h4.16v-13h7.96l.22.55c.12.3.52 1.06.89 1.7.37.65.94 1.7 1.28 2.34a90 90 0 0 0 2.52 4.7c.08.1.56.97 1.04 1.91l.89 1.72 2.52.05c1.38.02 2.52 0 2.52-.04 0-.2-.58-1.26-.68-1.26-.06 0-.16-.2-.21-.46a6 6 0 0 0-.7-1.37c-.32-.5-.75-1.26-.95-1.67a34 34 0 0 0-1.16-2.1c-.44-.74-.8-1.4-.8-1.48 0-.07-.38-.75-.84-1.5-.46-.76-.83-1.45-.83-1.53s-.26-.58-.58-1.1c-.7-1.16-.7-1.1-.15-1.3 5.73-2.18 7.6-12.18 3.08-16.4l-.65-.64c-1.93-2.02-5.02-2.61-13.66-2.61h-5.87zm57.27-15.67c-.24.6-.44 1.2-.44 1.31s-.37 1.14-.83 2.26a20 20 0 0 0-.84 2.27c0 .12-.4 1.25-.91 2.5-.5 1.26-.92 2.39-.92 2.5s-.37 1.1-.82 2.2-.9 2.32-1.01 2.72-.53 1.54-.94 2.53c-.4 1-.73 1.91-.73 2.03 0 .13-.41 1.25-.92 2.5a27 27 0 0 0-.91 2.46c0 .1-.42 1.22-.92 2.5-.5 1.26-.92 2.4-.92 2.54 0 .13-.14.56-.33.96-.53 1.18-.58 1.14 1.9 1.14h2.23l.11-.45c.07-.25.25-.75.42-1.12s.47-1.2.68-1.84a105 105 0 0 1 1.94-5.3l.27-.62h13.06l.35.88c.2.48.63 1.7.97 2.7s.74 2.14.9 2.5c.17.37.47 1.25.68 1.96l.38 1.3h2.3c1.38 0 2.31-.07 2.31-.17 0-.09-.34-.99-.75-2a17 17 0 0 1-.75-2.08c0-.12-.37-1.15-.83-2.27a22 22 0 0 1-.84-2.26c0-.1-.4-1.2-.89-2.42a38 38 0 0 1-1-2.72 37 37 0 0 0-.95-2.54 20 20 0 0 1-.82-2.27c0-.13-.37-1.12-.8-2.21-.45-1.1-.9-2.32-1.03-2.73-.11-.42-.54-1.56-.94-2.55s-.74-1.89-.74-2-.45-1.33-.99-2.7l-.98-2.5-2.16-.05-2.16-.05zm20.96-.86c-.26.68.04 24.04.33 25.02a12.3 12.3 0 0 0 8.35 8.36c2.93.88 8.97.33 11.3-1.04a7 7 0 0 1 1.1-.57c.54 0 3.85-3.71 3.85-4.32 0-.15.11-.43.25-.62.96-1.37 1-2 1-14.97v-12h-4.33l-.08 11.91c-.1 12.97-.06 12.53-1.06 14.21-3.34 5.67-13.32 4.99-15.71-1.08l-.48-1.21-.09-11.92-.08-11.91-2.13-.05c-1.7-.04-2.14 0-2.22.19m31.27 1.77v2h10.33v29.5h4.5v-29.5h10.33v-4h-25.16zm30.16 14.75v16.75h4.34V29.5h17.5v14.83h4.16v-33.5h-4.16v15h-17.5v-15h-4.34zM95 15.3c3.37 1.28 4.08 5.96 1.29 8.48-.37.33-1.16.84-1.77 1.12l-1.1.53-4.55.05-4.54.05V14.81l4.88.07c4.43.06 4.96.1 5.79.41m138.25 0c2.71.88 4.2 3.66 3.73 6.99-.58 4.19-2.23 5.1-9.35 5.19l-4.8.05V14.81l4.63.06c4.26.05 4.72.08 5.79.43m45.92 2.8c0 .19.9 2.72 1.47 4.15.08.18.3.86.52 1.5.2.64.61 1.8.91 2.58a97 97 0 0 1 1.56 4.46c.06.16-1.04.21-5.13.21-4.14 0-5.17-.04-5.04-.2.1-.12.25-.55.34-.97.1-.4.51-1.63.94-2.72s.76-2.09.76-2.23c0-.13.1-.48.24-.77.4-.86 1.6-4.1 1.6-4.3 0-.18.53-1.62 1.04-2.84l.19-.44.3.67c.16.37.3.77.3.9m-233.5 7.73v7.5H30.5v-15h15.17zM246 27.67v1.83h15v-3.67h-15zM94.8 29.55c3.43 1.32 5.34 4.6 4.31 7.4-.24.65-.47.98-1.47 2.06-1.05 1.15-3 1.49-8.65 1.49h-4.66V29.14l4.88.06c4.05.06 5 .12 5.6.35m297.6 9.21c-2.61 1.37-2.13 5.38.71 5.84 2.46.39 4.1-1.69 3.38-4.28-.38-1.37-2.73-2.27-4.08-1.56" />
</svg>
            <div class="row" style="flex:1;"><span class="ver">^1.6.9</span></div>
          </div>
          <p>Comprehensive authentication framework for TypeScript.</p>
          <span class="tag">auth</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjQzVGNzRGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RHJpenpsZTwvdGl0bGU+PHBhdGggZD0iTTUuMzUzIDExLjgyM2ExLjAzNiAxLjAzNiAwIDAgMC0uMzk1LTEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwLTEuNDM3LjM5OUwuMTM4IDE2LjcwMmExLjAzNSAxLjAzNSAwIDAgMCAuMzk1IDEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwIDEuNDM3LS4zOThsMy4zODMtNS45MDNabTExLjIxNiAwYTEuMDM2IDEuMDM2IDAgMCAwLS4zOTQtMS40MjIgMS4wNjQgMS4wNjQgMCAwIDAtMS40MzguMzk5bC0zLjM4MiA1LjkwMmExLjAzNiAxLjAzNiAwIDAgMCAuMzk0IDEuNDIyYy41MDYuMjgzIDEuMTUuMTA0IDEuNDM4LS4zOThsMy4zODItNS45MDNabTcuMjkzLTQuNTI1YTEuMDM2IDEuMDM2IDAgMCAwLS4zOTUtMS40MjIgMS4wNjIgMS4wNjIgMCAwIDAtMS40MzcuMzk5bC0zLjM4MyA1LjkwMmExLjAzNiAxLjAzNiAwIDAgMCAuMzk1IDEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwIDEuNDM3LS4zOTlsMy4zODMtNS45MDJabS0xMS4yMTkgMGExLjAzNSAxLjAzNSAwIDAgMC0uMzk0LTEuNDIyIDEuMDY0IDEuMDY0IDAgMCAwLTEuNDM4LjM5OGwtMy4zODIgNS45MDNhMS4wMzYgMS4wMzYgMCAwIDAgLjM5NCAxLjQyMmMuNTA2LjI4MiAxLjE1LjEwNCAxLjQzOC0uMzk5bDMuMzgyLTUuOTAyWiIvPjwvc3ZnPg==" alt="Drizzle logo" /></div>
            <div class="row" style="flex:1;"><h3>Drizzle ORM</h3><span class="ver">^0.45.2</span></div>
          </div>
          <p>Headless TypeScript ORM with a SQL-like query builder.</p>
          <span class="tag">orm</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNDE2OUUxIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UG9zdGdyZVNRTDwvdGl0bGU+PHBhdGggZD0iTTIzLjU1OTQgMTQuNzIyOGEuNTI2OS41MjY5IDAgMCAwLS4wNTYzLS4xMTkxYy0uMTM5LS4yNjMyLS40NzY4LS4zNDE4LTEuMDA3NC0uMjMyMS0xLjY1MzMuMzQxMS0yLjI5MzUuMTMxMi0yLjUyNTYtLjAxOTEgMS4zNDItMi4wNDgyIDIuNDQ1LTQuNTIyIDMuMDQxMS02LjgyOTcuMjcxNC0xLjA1MDcuNzk4Mi0zLjUyMzcuMTIyMi00LjczMTZhMS41NjQxIDEuNTY0MSAwIDAgMC0uMTUwOS0uMjM1QzIxLjY5MzEuOTA4NiAxOS44MDA3LjAyNDggMTcuNTA5OS4wMDA1Yy0xLjQ5NDctLjAxNTgtMi43NzA1LjM0NjEtMy4xMTYxLjQ3OTRhOS40NDkgOS40NDkgMCAwIDAtLjUxNTktLjA4MTYgOC4wNDQgOC4wNDQgMCAwIDAtMS4zMTE0LS4xMjc4Yy0xLjE4MjItLjAxODQtMi4yMDM4LjI2NDItMy4wNDk4Ljg0MDYtLjg1NzMtLjMyMTEtNC43ODg4LTEuNjQ1LTcuMjIxOS4wNzg4Qy45MzU5IDIuMTUyNi4zMDg2IDMuODczMy40MzAyIDYuMzA0M2MuMDQwOS44MTguNTA2OSAzLjMzNCAxLjI0MjMgNS43NDM2LjQ1OTggMS41MDY1LjkzODcgMi43MDE5IDEuNDMzNCAzLjU4Mi41NTMuOTk0MiAxLjEyNTkgMS41OTMzIDEuNzE0MyAxLjc4OTUuNDQ3NC4xNDkxIDEuMTMyNy4xNDQxIDEuODU4MS0uNzI3OS44MDEyLS45NjM1IDEuNTkwMy0xLjgyNTggMS45NDQ2LTIuMjA2OS40MzUxLjIzNTUuOTA2NC4zNjI1IDEuMzkuMzc3MmEuMDU2OS4wNTY5IDAgMCAwIC4wMDA0LjAwNDEgMTEuMDMxMiAxMS4wMzEyIDAgMCAwLS4yNDcyLjMwNTRjLS4zMzg5LjQzMDItLjQwOTQuNTE5Ny0xLjUwMDIuNzQ0My0uMzEwMi4wNjQtMS4xMzQ0LjIzMzktMS4xNDY0LjgxMTUtLjAwMjUuMTIyNC4wMzI5LjIzMDkuMDkxOS4zMjY4LjIyNjkuNDIzMS45MjE2LjYwOTcgMS4wMTUuNjMzMSAxLjMzNDUuMzMzNSAyLjUwNDQuMDkyIDMuMzcxNC0uNjc4Ny0uMDE3IDIuMjMxLjA3NzUgNC40MTc0LjM0NTQgNS4wODc0LjIyMTIuNTUyOS43NjE4IDEuOTA0NSAyLjQ2OTIgMS45MDQzLjI1MDUgMCAuNTI2My0uMDI5MS44Mjk2LS4wOTQxIDEuNzgxOS0uMzgyMSAyLjU1NTctMS4xNjk2IDIuODU1LTIuOTA1OS4xNTAzLS44NzA3LjQwMTYtMi44NzUzLjUzODgtNC4xMDEyLjAxNjktLjA3MDMuMDM1Ny0uMTIwNy4wNTctLjEzNjIuMDAwNy0uMDAwNS4wNjk3LS4wNDcxLjQyNzIuMDMwN2EuMzY3My4zNjczIDAgMCAwIC4wNDQzLjAwNjhsLjI1MzkuMDIyMy4wMTQ5LjAwMWMuODQ2OC4wMzg0IDEuOTExNC0uMTQyNiAyLjUzMTItLjQzMDguNjQzOC0uMjk4OCAxLjgwNTctMS4wMzIzIDEuNTk1MS0xLjY2OTh6TTIuMzcxIDExLjg3NjVjLS43NDM1LTIuNDM1OC0xLjE3NzktNC44ODUxLTEuMjEyMy01LjU3MTktLjEwODYtMi4xNzE0LjQxNzEtMy42ODI5IDEuNTYyMy00LjQ5MjcgMS44MzY3LTEuMjk4NiA0LjgzOTgtLjU0MDggNi4xMDgtLjEzLS4wMDMyLjAwMzItLjAwNjYuMDA2MS0uMDA5OC4wMDk0LTIuMDIzOCAyLjA0NC0xLjk3NTggNS41MzYtMS45NzA4IDUuNzQ5NS0uMDAwMi4wODIzLjAwNjYuMTk4OS4wMTYyLjM1OTMuMDM0OC41ODczLjA5OTYgMS42ODA0LS4wNzM1IDIuOTE4NC0uMTYwOSAxLjE1MDQuMTkzNyAyLjI3NjQuOTcyOCAzLjA4OTIuMDgwNi4wODQxLjE2NDguMTYzMS4yNTE4LjIzNzQtLjM0NjguMzcxNC0xLjEwMDQgMS4xOTI2LTEuOTAyNSAyLjE1NzYtLjU2NzcuNjgyNS0uOTU5Ny41NTE3LTEuMDg4Ni41MDg3LS4zOTE5LS4xMzA3LS44MTMtLjU4NzEtMS4yMzgxLTEuMzIyMy0uNDc5Ni0uODM5LS45NjM1LTIuMDMxNy0xLjQxNTUtMy41MTI2em02LjAwNzIgNS4wODcxYy0uMTcxMS0uMDQyOC0uMzI3MS0uMTEzMi0uNDMyMi0uMTc3Mi4wODg5LS4wMzk0LjIzNzQtLjA5MDIuNDgzMy0uMTQwOSAxLjI4MzMtLjI2NDEgMS40ODE1LS40NTA2IDEuOTE0My0xLjAwMDIuMDk5Mi0uMTI2LjIxMTYtLjI2ODcuMzY3My0uNDQyNmEuMzU0OS4zNTQ5IDAgMCAwIC4wNzM3LS4xMjk4Yy4xNzA4LS4xNTEzLjI3MjQtLjEwOTkuNDM2OS0uMDQxNy4xNTYuMDY0Ni4zMDc4LjI2LjM2OTUuNDc1Mi4wMjkxLjEwMTYuMDYxOS4yOTQ1LS4wNDUyLjQ0NDQtLjkwNDMgMS4yNjU4LTIuMjIxNiAxLjI0OTQtMy4xNjc2IDEuMDEyOHptMi4wOTQtMy45ODgtLjA1MjUuMTQxYy0uMTMzLjM1NjYtLjI1NjcuNjg4MS0uMzMzNCAxLjAwMy0uNjY3NC0uMDAyMS0xLjMxNjgtLjI4NzItMS44MTA1LS44MDI0LS42Mjc5LS42NTUxLS45MTMxLTEuNTY2NC0uNzgyNS0yLjUwMDQuMTgyOC0xLjMwNzkuMTE1My0yLjQ0NjguMDc5LTMuMDU4Ni0uMDA1LS4wODU3LS4wMDk1LS4xNjA3LS4wMTIyLS4yMTk5LjI5NTctLjI2MjEgMS42NjU5LS45OTYyIDIuNjQyOS0uNzcyNC40NDU5LjEwMjIuNzE3Ni40MDU3LjgzMDUuOTI4LjU4NDYgMi43MDM4LjA3NzQgMy44MzA3LS4zMzAyIDQuNzM2My0uMDg0LjE4NjYtLjE2MzMuMzYyOS0uMjMxMS41NDU0em03LjM2MzcgNC41NzI1Yy0uMDE2OS4xNzY4LS4wMzU4LjM3Ni0uMDYxOC41OTU5bC0uMTQ2LjQzODNhLjM1NDcuMzU0NyAwIDAgMC0uMDE4Mi4xMDc3Yy0uMDA1OS40NzQ3LS4wNTQuNjQ4OS0uMTE1Ljg2OTMtLjA2MzQuMjI5Mi0uMTM1My40ODkxLS4xNzk0IDEuMDU3NS0uMTEgMS40MTQzLS44NzgyIDIuMjI2Ny0yLjQxNzIgMi41NTY1LTEuNTE1NS4zMjUxLTEuNzg0My0uNDk2OC0yLjAyMTItMS4yMjE3YTYuNTgyNCA2LjU4MjQgMCAwIDAtLjA3NjktLjIyNjZjLS4yMTU0LS41ODU4LS4xOTExLTEuNDExOS0uMTU3NC0yLjU1NTEuMDE2NS0uNTYxMi0uMDI0OS0xLjkwMTMtLjMzMDItMi42NDYyLjAwNDQtLjI5MzIuMDEwNi0uNTkwOS4wMTktLjg5MThhLjM1MjkuMzUyOSAwIDAgMC0uMDE1My0uMTEyNiAxLjQ5MjcgMS40OTI3IDAgMCAwLS4wNDM5LS4yMDhjLS4xMjI2LS40MjgzLS40MjEzLS43ODY2LS43Nzk3LS45MzUxLS4xNDI0LS4wNTktLjQwMzgtLjE2NzItLjcxNzgtLjA4NjkuMDY3LS4yNzYuMTgzMS0uNTg3NS4zMDktLjkyNDlsLjA1MjktLjE0MmMuMDU5NS0uMTYuMTM0LS4zMjU3LjIxMy0uNTAxMi40MjY1LS45NDc2IDEuMDEwNi0yLjI0NTMuMzc2Ni01LjE3NzItLjIzNzQtMS4wOTgxLTEuMDMwNC0xLjYzNDMtMi4yMzI0LTEuNTA5OC0uNzIwNy4wNzQ2LTEuMzc5OS4zNjU0LTEuNzA4OC41MzIxYTUuNjcxNiA1LjY3MTYgMCAwIDAtLjE5NTguMTA0MWMuMDkxOC0xLjEwNjQuNDM4Ni0zLjE3NDEgMS43MzU3LTQuNDgyM2E0LjAzMDYgNC4wMzA2IDAgMCAxIC4zMDMzLS4yNzYuMzUzMi4zNTMyIDAgMCAwIC4xNDQ3LS4wNjQ0Yy43NTI0LS41NzA2IDEuNjk0NS0uODUwNiAyLjgwMi0uODMyNS40MDkxLjAwNjcuODAxNy4wMzM5IDEuMTc0Mi4wODEgMS45MzkuMzU0NCAzLjI0MzkgMS40NDY4IDQuMDM1OSAyLjM4MjcuODE0My45NjIzIDEuMjU1MiAxLjkzMTUgMS40MzEyIDIuNDU0My0xLjMyMzItLjEzNDYtMi4yMjM0LjEyNjgtMi42Nzk3Ljc3OS0uOTkyNiAxLjQxODkuNTQzIDQuMTcyOSAxLjI4MTEgNS40OTY0LjEzNTMuMjQyNi4yNTIyLjQ1MjIuMjg4OS41NDEzLjI0MDMuNTgyNS41NTE1Ljk3MTMuNzc4NyAxLjI1NTIuMDY5Ni4wODcuMTM3Mi4xNzE0LjE4ODUuMjQ1LS40MDA4LjExNTUtMS4xMjA4LjM4MjUtMS4wNTUyIDEuNzE3LS4wMTIzLjE1NjMtLjA0MjMuNDQ2OS0uMDgzNC44MTQ4LS4wNDYxLjIwNzctLjA3MDIuNDYwMy0uMDk5NC43NjYyem0uODkwNS0xLjYyMTFjLS4wNDA1LS44MzE2LjI2OTEtLjkxODUuNTk2Ny0xLjAxMDVhMi44NTY2IDIuODU2NiAwIDAgMCAuMTM1LS4wNDA2IDEuMjAyIDEuMjAyIDAgMCAwIC4xMzQyLjEwM2MuNTcwMy4zNzY1IDEuNTgyMy40MjEzIDMuMDA2OC4xMzQ0LS4yMDE2LjE3NjktLjUxODkuMzk5NC0uOTUzMy42MDExLS40MDk4LjE5MDMtMS4wOTU3LjMzMy0xLjc0NzMuMzYzNi0uNzE5Ny4wMzM2LTEuMDg1OS0uMDgwNy0xLjE3MjEtLjE1MXptLjU2OTUtOS4yNzEyYy0uMDA1OS4zNTA4LS4wNTQyLjY2OTItLjEwNTQgMS4wMDE3LS4wNTUuMzU3Ni0uMTEyLjcyNzQtLjEyNjQgMS4xNzYyLS4wMTQyLjQzNjguMDQwNC44OTA5LjA5MzIgMS4zMzAxLjEwNjYuODg3LjIxNiAxLjgwMDMtLjIwNzUgMi43MDE0YTMuNTI3MiAzLjUyNzIgMCAwIDEtLjE4NzYtLjM4NTZjLS4wNTI3LS4xMjc2LS4xNjY5LS4zMzI2LS4zMjUxLS42MTYyLS42MTU2LTEuMTA0MS0yLjA1NzQtMy42ODk2LTEuMzE5My00Ljc0NDYuMzc5NS0uNTQyNyAxLjM0MDgtLjU2NjEgMi4xNzgxLS40NjN6bS4yMjg0IDcuMDEzN2ExMi4zNzYyIDEyLjM3NjIgMCAwIDAtLjA4NTMtLjEwNzRsLS4wMzU1LS4wNDQ0Yy43MjYyLTEuMTk5NS41ODQyLTIuMzg2Mi40NTc4LTMuNDM4NS0uMDUxOS0uNDMxOC0uMTAwOS0uODM5Ni0uMDg4NS0xLjIyMjYuMDEyOS0uNDA2MS4wNjY2LS43NTQzLjExODUtMS4wOTExLjA2MzktLjQxNS4xMjg4LS44NDQzLjExMDktMS4zNTA1LjAxMzQtLjA1MzEuMDE4OC0uMTE1OC4wMTE4LS4xOTAyLS4wNDU3LS40ODU1LS41OTk5LTEuOTM4LTEuNzI5NC0zLjI1My0uNjA3Ni0uNzA3My0xLjQ4OTYtMS40OTcyLTIuNjg4OS0yLjAzOTUuNTI1MS0uMTA2NiAxLjIzMjgtLjIwMzUgMi4wMjQ0LS4xODU5IDIuMDUxNS4wNDU2IDMuNjc0Ni44MTM1IDQuODI0MiAyLjI4MjRhLjkwOC45MDggMCAwIDEgLjA2NjcuMTAwMmMuNzIzMSAxLjM1NTYtLjI3NjIgNi4yNzUxLTIuOTg2NyAxMC41NDA1em0tOC44MTY2LTYuMTE2MmMtLjAyNS4xNzk0LS4zMDg5LjQyMjUtLjYyMTEuNDIyNWEuNTgyMS41ODIxIDAgMCAxLS4wODA5LS4wMDU2Yy0uMTg3My0uMDI2LS4zNzY1LS4xNDQtLjUwNTktLjMxNTYtLjA0NTgtLjA2MDUtLjEyMDMtLjE3OC0uMTA1NS0uMjg0NC4wMDU1LS4wNDAxLjAyNjEtLjA5ODUuMDkyNS0uMTQ4OC4xMTgyLS4wODk0LjM1MTgtLjEyMjYuNjA5Ni0uMDg2Ny4zMTYzLjA0NDEuNjQyNi4xOTM4LjYxMTMuNDE4NnptNy45MzA1LS40MTE0Yy4wMTExLjA3OTItLjA0OS4yMDEtLjE1MzEuMzEwMi0uMDY4My4wNzE3LS4yMTIuMTk2MS0uNDA3OS4yMjMyYS41NDU2LjU0NTYgMCAwIDEtLjA3NS4wMDUyYy0uMjkzNSAwLS41NDE0LS4yMzQ0LS41NjA3LS4zNzE3LS4wMjQtLjE3NjUuMjY0MS0uMzEwNi41NjExLS4zNTIuMjk3LS4wNDE0LjYxMTEuMDA4OC42MzU2LjE4NTF6Ii8+PC9zdmc+" alt="PostgreSQL logo" /></div>
            <div class="row" style="flex:1;"><h3>pg</h3><span class="ver">^8.20.0</span></div>
          </div>
          <p>Non-blocking PostgreSQL client for Node.js.</p>
          <span class="tag">database</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRUNENTNGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+LkVOVjwvdGl0bGU+PHBhdGggZD0iTTI0IDB2MjRIMFYwaDI0Wk0xMC45MzMgMTUuODlINi44NHY1LjUyaDQuMTk4di0uOTNINy45NTV2LTEuNTAzaDIuNzd2LS45M2gtMi43N3YtMS4yMjRoMi45Nzh2LS45MzRabTIuMTQ2IDBoLTEuMDg0djUuNTJoMS4wMzV2LTMuNmwyLjIyNiAzLjZoMS4xMTh2LTUuNTJoLTEuMDM2djMuNjg2bC0yLjI1OS0zLjY4N1ptNS4xMTcgMGgtMS4yMDhsMS45NzMgNS41MmgxLjE5bDEuOTc2LTUuNTJoLTEuMTgybC0xLjM1MiA0LjA4NS0xLjM5Ny00LjA4NlpNNS40IDE5LjY4SDMuNzJ2MS42OEg1LjR2LTEuNjhaIi8+PC9zdmc+" alt="dotenv logo" /></div>
            <div class="row" style="flex:1;"><h3>dotenv</h3><span class="ver">^17.4.2</span></div>
          </div>
          <p>Loads environment variables from a .env file into process.env.</p>
          <span class="tag">config</span>
        </div>

      </div>
    </div>
  </section>

  <section id="tooling">
    <div class="container">
      <div class="section-head">
        <h2>Dev Tooling</h2>
        <p>Build, type-checking, and database migration tools used in development.</p>
      </div>
      <div class="stack-grid">

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMzE3OEM2IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VHlwZVNjcmlwdDwvdGl0bGU+PHBhdGggZD0iTTEuMTI1IDBDLjUwMiAwIDAgLjUwMiAwIDEuMTI1djIxLjc1QzAgMjMuNDk4LjUwMiAyNCAxLjEyNSAyNGgyMS43NWMuNjIzIDAgMS4xMjUtLjUwMiAxLjEyNS0xLjEyNVYxLjEyNUMyNCAuNTAyIDIzLjQ5OCAwIDIyLjg3NSAwem0xNy4zNjMgOS43NWMuNjEyIDAgMS4xNTQuMDM3IDEuNjI3LjExMWE2LjM4IDYuMzggMCAwIDEgMS4zMDYuMzR2Mi40NThhMy45NSAzLjk1IDAgMCAwLS42NDMtLjM2MSA1LjA5MyA1LjA5MyAwIDAgMC0uNzE3LS4yNiA1LjQ1MyA1LjQ1MyAwIDAgMC0xLjQyNi0uMmMtLjMgMC0uNTczLjAyOC0uODE5LjA4NmEyLjEgMi4xIDAgMCAwLS42MjMuMjQyYy0uMTcuMTA0LS4zLjIyOS0uMzkzLjM3NGEuODg4Ljg4OCAwIDAgMC0uMTQuNDljMCAuMTk2LjA1My4zNzMuMTU2LjUyOS4xMDQuMTU2LjI1Mi4zMDQuNDQzLjQ0NHMuNDIzLjI3Ni42OTYuNDFjLjI3My4xMzUuNTgyLjI3NC45MjYuNDE2LjQ3LjE5Ny44OTIuNDA3IDEuMjY2LjYyOC4zNzQuMjIyLjY5NS40NzMuOTYzLjc1My4yNjguMjc5LjQ3Mi41OTguNjE0Ljk1Ny4xNDIuMzU5LjIxNC43NzYuMjE0IDEuMjUzIDAgLjY1Ny0uMTI1IDEuMjEtLjM3MyAxLjY1NmEzLjAzMyAzLjAzMyAwIDAgMS0xLjAxMiAxLjA4NSA0LjM4IDQuMzggMCAwIDEtMS40ODcuNTk2Yy0uNTY2LjEyLTEuMTYzLjE4LTEuNzkuMThhOS45MTYgOS45MTYgMCAwIDEtMS44NC0uMTY0IDUuNTQ0IDUuNTQ0IDAgMCAxLTEuNTEyLS40OTN2LTIuNjNhNS4wMzMgNS4wMzMgMCAwIDAgMy4yMzcgMS4yYy4zMzMgMCAuNjI0LS4wMy44NzItLjA5LjI0OS0uMDYuNDU2LS4xNDQuNjIzLS4yNS4xNjYtLjEwOC4yOS0uMjM0LjM3My0uMzhhMS4wMjMgMS4wMjMgMCAwIDAtLjA3NC0xLjA4OSAyLjEyIDIuMTIgMCAwIDAtLjUzNy0uNSA1LjU5NyA1LjU5NyAwIDAgMC0uODA3LS40NDQgMjcuNzIgMjcuNzIgMCAwIDAtMS4wMDctLjQzNmMtLjkxOC0uMzgzLTEuNjAyLS44NTItMi4wNTMtMS40MDUtLjQ1LS41NTMtLjY3Ni0xLjIyMi0uNjc2LTIuMDA1IDAtLjYxNC4xMjMtMS4xNDEuMzY5LTEuNTgyLjI0Ni0uNDQxLjU4LS44MDQgMS4wMDQtMS4wODlhNC40OTQgNC40OTQgMCAwIDEgMS40Ny0uNjI5IDcuNTM2IDcuNTM2IDAgMCAxIDEuNzctLjIwMXptLTE1LjExMy4xODhoOS41NjN2Mi4xNjZIOS41MDZ2OS42NDZINi43ODl2LTkuNjQ2SDMuMzc1eiIvPjwvc3ZnPg==" alt="TypeScript logo" /></div>
            <div class="row" style="flex:1;"><h3>TypeScript</h3><span class="ver">^5.8.3</span></div>
          </div>
          <p>Strongly-typed JavaScript that compiles to clean output.</p>
          <span class="tag dev">dev dependency</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkJGMERGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QnVuPC90aXRsZT48cGF0aCBkPSJNMTIgMjIuNTk2YzYuNjI4IDAgMTItNC4zMzggMTItOS42ODggMC0zLjMxOC0yLjA1Ny02LjI0OC01LjIxOS03Ljk4Ni0xLjI4Ni0uNzE1LTIuMjk3LTEuMzU3LTMuMTM5LTEuODlDMTQuMDU4IDIuMDI1IDEzLjA4IDEuNDA0IDEyIDEuNDA0Yy0xLjA5NyAwLTIuMzM0Ljc4NS0zLjk2NiAxLjgyMWE0OS45MiA0OS45MiAwIDAgMS0yLjgxNiAxLjY5N0MyLjA1NyA2LjY2IDAgOS41OSAwIDEyLjkwOGMwIDUuMzUgNS4zNzIgOS42ODcgMTIgOS42ODd2LjAwMVpNMTAuNTk5IDQuNzE1Yy4zMzQtLjc1OS41MDMtMS41OC40OTgtMi40MDkgMC0uMTQ1LjIwMi0uMTg3LjIzLS4wMjkuNjU4IDIuNzgzLS45MDIgNC4xNjItMi4wNTcgNC42MjQtLjEyNC4wNDgtLjE5OS0uMTIxLS4xMDMtLjIwOWE1Ljc2MyA1Ljc2MyAwIDAgMCAxLjQzMi0xLjk3N1ptMi4wNTgtLjEwMmE1LjgyIDUuODIgMCAwIDAtLjc4Mi0yLjMwNnYtLjAxNmMtLjA2OS0uMTIzLjA4Ni0uMjYzLjE4NS0uMTcyIDEuOTYyIDIuMTExIDEuMzA3IDQuMDY3LjU1NiA1LjA1MS0uMDgyLjEwMy0uMjMtLjAwMy0uMTg5LS4xMjZhNS44NSA1Ljg1IDAgMCAwIC4yMy0yLjQzMVptMS43NzYtLjU2MWE1LjcyNyA1LjcyNyAwIDAgMC0xLjYxMi0xLjgwNnYtLjAxNGMtLjExMi0uMDg1LS4wMjQtLjI3NC4xMTQtLjIxOCAyLjU5NSAxLjA4NyAyLjc3NCAzLjE4IDIuNDU5IDQuNDA3YS4xMTYuMTE2IDAgMCAxLS4wNDkuMDcxLjExLjExIDAgMCAxLS4xNTMtLjAyNi4xMjIuMTIyIDAgMCAxLS4wMjItLjA4MyA1Ljg5MSA1Ljg5MSAwIDAgMC0uNzM3LTIuMzMxWm0tNS4wODcuNTYxYy0uNjE3LjU0Ni0xLjI4Mi43Ni0yLjA2MyAxLS4xMTcgMC0uMTk1LS4wNzgtLjE1Ni0uMTgxIDEuNzUyLS45MDkgMi4zNzYtMS42NDkgMi45OTktMi43NzggMCAwIC4xNTUtLjExOC4xODguMDg1IDAgLjMwNC0uMzQ5IDEuMzI5LS45NjggMS44NzRabTQuOTQ1IDExLjIzN2EyLjk1NyAyLjk1NyAwIDAgMS0uOTM3IDEuNTUzYy0uMzQ2LjM0Ni0uOC41NjUtMS4yODYuNjJhMi4xNzggMi4xNzggMCAwIDEtMS4zMjctLjYyIDIuOTU1IDIuOTU1IDAgMCAxLS45MjUtMS41NTMuMjQ0LjI0NCAwIDAgMSAuMDY0LS4xOTguMjM0LjIzNCAwIDAgMSAuMTkzLS4wNjloMy45NjVhLjIyNi4yMjYgMCAwIDEgLjE5LjA3Yy4wNS4wNTMuMDczLjEyNS4wNjMuMTk3Wm0tNS40NTgtMi4xNzZhMS44NjIgMS44NjIgMCAwIDEtMi4zODQtLjI0NSAxLjk4IDEuOTggMCAwIDEtLjIzMy0yLjQ0N2MuMjA3LS4zMTkuNTAzLS41NjYuODQ4LS43MTNhMS44NCAxLjg0IDAgMCAxIDEuMDkyLS4xMWMuMzY2LjA3NS43MDMuMjYxLjk2Ny41MzFhMS45OCAxLjk4IDAgMCAxIC40MDggMi4xMTQgMS45MzEgMS45MzEgMCAwIDEtLjY5OC44Njl2LjAwMVptOC40OTUuMDA1YTEuODYgMS44NiAwIDAgMS0yLjM4MS0uMjUzIDEuOTY0IDEuOTY0IDAgMCAxLS41NDctMS4zNjZjMC0uMzg0LjExLS43Ni4zMi0xLjA3OS4yMDctLjMxOS41MDMtLjU2Ny44NDktLjcxM2ExLjg0NCAxLjg0NCAwIDAgMSAxLjA5My0uMTA4Yy4zNjcuMDc2LjcwNC4yNjIuOTY4LjUzNGExLjk4IDEuOTggMCAwIDEgLjQgMi4xMTcgMS45MzIgMS45MzIgMCAwIDEtLjcwMi44NjhaIi8+PC9zdmc+" alt="Bun logo" /></div>
            <div class="row" style="flex:1;"><h3>Bun Types</h3><span class="ver">^1.3.14</span></div>
          </div>
          <p>Type definitions for the Bun runtime APIs.</p>
          <span class="tag dev">dev dependency</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMzE3OEM2IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VHlwZVNjcmlwdDwvdGl0bGU+PHBhdGggZD0iTTEuMTI1IDBDLjUwMiAwIDAgLjUwMiAwIDEuMTI1djIxLjc1QzAgMjMuNDk4LjUwMiAyNCAxLjEyNSAyNGgyMS43NWMuNjIzIDAgMS4xMjUtLjUwMiAxLjEyNS0xLjEyNVYxLjEyNUMyNCAuNTAyIDIzLjQ5OCAwIDIyLjg3NSAwem0xNy4zNjMgOS43NWMuNjEyIDAgMS4xNTQuMDM3IDEuNjI3LjExMWE2LjM4IDYuMzggMCAwIDEgMS4zMDYuMzR2Mi40NThhMy45NSAzLjk1IDAgMCAwLS42NDMtLjM2MSA1LjA5MyA1LjA5MyAwIDAgMC0uNzE3LS4yNiA1LjQ1MyA1LjQ1MyAwIDAgMC0xLjQyNi0uMmMtLjMgMC0uNTczLjAyOC0uODE5LjA4NmEyLjEgMi4xIDAgMCAwLS42MjMuMjQyYy0uMTcuMTA0LS4zLjIyOS0uMzkzLjM3NGEuODg4Ljg4OCAwIDAgMC0uMTQuNDljMCAuMTk2LjA1My4zNzMuMTU2LjUyOS4xMDQuMTU2LjI1Mi4zMDQuNDQzLjQ0NHMuNDIzLjI3Ni42OTYuNDFjLjI3My4xMzUuNTgyLjI3NC45MjYuNDE2LjQ3LjE5Ny44OTIuNDA3IDEuMjY2LjYyOC4zNzQuMjIyLjY5NS40NzMuOTYzLjc1My4yNjguMjc5LjQ3Mi41OTguNjE0Ljk1Ny4xNDIuMzU5LjIxNC43NzYuMjE0IDEuMjUzIDAgLjY1Ny0uMTI1IDEuMjEtLjM3MyAxLjY1NmEzLjAzMyAzLjAzMyAwIDAgMS0xLjAxMiAxLjA4NSA0LjM4IDQuMzggMCAwIDEtMS40ODcuNTk2Yy0uNTY2LjEyLTEuMTYzLjE4LTEuNzkuMThhOS45MTYgOS45MTYgMCAwIDEtMS44NC0uMTY0IDUuNTQ0IDUuNTQ0IDAgMCAxLTEuNTEyLS40OTN2LTIuNjNhNS4wMzMgNS4wMzMgMCAwIDAgMy4yMzcgMS4yYy4zMzMgMCAuNjI0LS4wMy44NzItLjA5LjI0OS0uMDYuNDU2LS4xNDQuNjIzLS4yNS4xNjYtLjEwOC4yOS0uMjM0LjM3My0uMzhhMS4wMjMgMS4wMjMgMCAwIDAtLjA3NC0xLjA4OSAyLjEyIDIuMTIgMCAwIDAtLjUzNy0uNSA1LjU5NyA1LjU5NyAwIDAgMC0uODA3LS40NDQgMjcuNzIgMjcuNzIgMCAwIDAtMS4wMDctLjQzNmMtLjkxOC0uMzgzLTEuNjAyLS44NTItMi4wNTMtMS40MDUtLjQ1LS41NTMtLjY3Ni0xLjIyMi0uNjc2LTIuMDA1IDAtLjYxNC4xMjMtMS4xNDEuMzY5LTEuNTgyLjI0Ni0uNDQxLjU4LS44MDQgMS4wMDQtMS4wODlhNC40OTQgNC40OTQgMCAwIDEgMS40Ny0uNjI5IDcuNTM2IDcuNTM2IDAgMCAxIDEuNzctLjIwMXptLTE1LjExMy4xODhoOS41NjN2Mi4xNjZIOS41MDZ2OS42NDZINi43ODl2LTkuNjQ2SDMuMzc1eiIvPjwvc3ZnPg==" alt="TypeScript logo" /></div>
            <div class="row" style="flex:1;"><h3>tsx</h3><span class="ver">^4.21.0</span></div>
          </div>
          <p>TypeScript execute — run TS files directly in Node.</p>
          <span class="tag dev">dev dependency</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjQzVGNzRGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RHJpenpsZTwvdGl0bGU+PHBhdGggZD0iTTUuMzUzIDExLjgyM2ExLjAzNiAxLjAzNiAwIDAgMC0uMzk1LTEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwLTEuNDM3LjM5OUwuMTM4IDE2LjcwMmExLjAzNSAxLjAzNSAwIDAgMCAuMzk1IDEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwIDEuNDM3LS4zOThsMy4zODMtNS45MDNabTExLjIxNiAwYTEuMDM2IDEuMDM2IDAgMCAwLS4zOTQtMS40MjIgMS4wNjQgMS4wNjQgMCAwIDAtMS40MzguMzk5bC0zLjM4MiA1LjkwMmExLjAzNiAxLjAzNiAwIDAgMCAuMzk0IDEuNDIyYy41MDYuMjgzIDEuMTUuMTA0IDEuNDM4LS4zOThsMy4zODItNS45MDNabTcuMjkzLTQuNTI1YTEuMDM2IDEuMDM2IDAgMCAwLS4zOTUtMS40MjIgMS4wNjIgMS4wNjIgMCAwIDAtMS40MzcuMzk5bC0zLjM4MyA1LjkwMmExLjAzNiAxLjAzNiAwIDAgMCAuMzk1IDEuNDIyIDEuMDYzIDEuMDYzIDAgMCAwIDEuNDM3LS4zOTlsMy4zODMtNS45MDJabS0xMS4yMTkgMGExLjAzNSAxLjAzNSAwIDAgMC0uMzk0LTEuNDIyIDEuMDY0IDEuMDY0IDAgMCAwLTEuNDM4LjM5OGwtMy4zODIgNS45MDNhMS4wMzYgMS4wMzYgMCAwIDAgLjM5NCAxLjQyMmMuNTA2LjI4MiAxLjE1LjEwNCAxLjQzOC0uMzk5bDMuMzgyLTUuOTAyWiIvPjwvc3ZnPg==" alt="Drizzle logo" /></div>
            <div class="row" style="flex:1;"><h3>Drizzle Kit</h3><span class="ver">^0.31.10</span></div>
          </div>
          <p>Migrations and schema management CLI for Drizzle ORM.</p>
          <span class="tag dev">dev dependency</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMzM5OTMzIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Tm9kZS5qczwvdGl0bGU+PHBhdGggZD0iTTExLjk5OCwyNGMtMC4zMjEsMC0wLjY0MS0wLjA4NC0wLjkyMi0wLjI0N2wtMi45MzYtMS43MzdjLTAuNDM4LTAuMjQ1LTAuMjI0LTAuMzMyLTAuMDgtMC4zODMgYzAuNTg1LTAuMjAzLDAuNzAzLTAuMjUsMS4zMjgtMC42MDRjMC4wNjUtMC4wMzcsMC4xNTEtMC4wMjMsMC4yMTgsMC4wMTdsMi4yNTYsMS4zMzljMC4wODIsMC4wNDUsMC4xOTcsMC4wNDUsMC4yNzIsMGw4Ljc5NS01LjA3NiBjMC4wODItMC4wNDcsMC4xMzQtMC4xNDEsMC4xMzQtMC4yMzhWNi45MjFjMC0wLjA5OS0wLjA1My0wLjE5Mi0wLjEzNy0wLjI0MmwtOC43OTEtNS4wNzJjLTAuMDgxLTAuMDQ3LTAuMTg5LTAuMDQ3LTAuMjcxLDAgTDMuMDc1LDYuNjhDMi45OSw2LjcyOSwyLjkzNiw2LjgyNSwyLjkzNiw2LjkyMXYxMC4xNWMwLDAuMDk3LDAuMDU0LDAuMTg5LDAuMTM5LDAuMjM1bDIuNDA5LDEuMzkyIGMxLjMwNywwLjY1NCwyLjEwOC0wLjExNiwyLjEwOC0wLjg5VjcuNzg3YzAtMC4xNDIsMC4xMTQtMC4yNTMsMC4yNTYtMC4yNTNoMS4xMTVjMC4xMzksMCwwLjI1NSwwLjExMiwwLjI1NSwwLjI1M3YxMC4wMjEgYzAsMS43NDUtMC45NSwyLjc0NS0yLjYwNCwyLjc0NWMtMC41MDgsMC0wLjkwOSwwLTIuMDI2LTAuNTUxTDIuMjgsMTguNjc1Yy0wLjU3LTAuMzI5LTAuOTIyLTAuOTQ1LTAuOTIyLTEuNjA0VjYuOTIxIGMwLTAuNjU5LDAuMzUzLTEuMjc1LDAuOTIyLTEuNjAzbDguNzk1LTUuMDgyYzAuNTU3LTAuMzE1LDEuMjk2LTAuMzE1LDEuODQ4LDBsOC43OTQsNS4wODJjMC41NywwLjMyOSwwLjkyNCwwLjk0NCwwLjkyNCwxLjYwMyB2MTAuMTVjMCwwLjY1OS0wLjM1NCwxLjI3My0wLjkyNCwxLjYwNGwtOC43OTQsNS4wNzhDMTIuNjQzLDIzLjkxNiwxMi4zMjQsMjQsMTEuOTk4LDI0eiBNMTkuMDk5LDEzLjk5MyBjMC0xLjktMS4yODQtMi40MDYtMy45ODctMi43NjNjLTIuNzMxLTAuMzYxLTMuMDA5LTAuNTQ4LTMuMDA5LTEuMTg3YzAtMC41MjgsMC4yMzUtMS4yMzMsMi4yNTgtMS4yMzMgYzEuODA3LDAsMi40NzMsMC4zODksMi43NDcsMS42MDdjMC4wMjQsMC4xMTUsMC4xMjksMC4xOTksMC4yNDcsMC4xOTloMS4xNDFjMC4wNzEsMCwwLjEzOC0wLjAzMSwwLjE4Ni0wLjA4MSBjMC4wNDgtMC4wNTQsMC4wNzQtMC4xMjMsMC4wNjctMC4xOTZjLTAuMTc3LTIuMDk4LTEuNTcxLTMuMDc2LTQuMzg4LTMuMDc2Yy0yLjUwOCwwLTQuMDA0LDEuMDU4LTQuMDA0LDIuODMzIGMwLDEuOTI1LDEuNDg4LDIuNDU3LDMuODk1LDIuNjk1YzIuODgsMC4yODIsMy4xMDMsMC43MDMsMy4xMDMsMS4yNjljMCwwLjk4My0wLjc4OSwxLjQwMi0yLjY0MiwxLjQwMiBjLTIuMzI3LDAtMi44MzktMC41ODQtMy4wMTEtMS43NDJjLTAuMDItMC4xMjQtMC4xMjYtMC4yMTUtMC4yNTMtMC4yMTVoLTEuMTM3Yy0wLjE0MSwwLTAuMjU0LDAuMTEyLTAuMjU0LDAuMjUzIGMwLDEuNDgyLDAuODA2LDMuMjQ4LDQuNjU1LDMuMjQ4QzE3LjUwMSwxNy4wMDcsMTkuMDk5LDE1LjkxLDE5LjA5OSwxMy45OTN6Ii8+PC9zdmc+" alt="Node.js logo" /></div>
            <div class="row" style="flex:1;"><h3>@types/node</h3><span class="ver">^20.11.17</span></div>
          </div>
          <p>TypeScript definitions for the Node.js standard library.</p>
          <span class="tag dev">dev dependency</span>
        </div>

        <div class="stack-card">
          <div class="head">
            <div class="logo-img"><img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNDE2OUUxIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+UG9zdGdyZVNRTDwvdGl0bGU+PHBhdGggZD0iTTIzLjU1OTQgMTQuNzIyOGEuNTI2OS41MjY5IDAgMCAwLS4wNTYzLS4xMTkxYy0uMTM5LS4yNjMyLS40NzY4LS4zNDE4LTEuMDA3NC0uMjMyMS0xLjY1MzMuMzQxMS0yLjI5MzUuMTMxMi0yLjUyNTYtLjAxOTEgMS4zNDItMi4wNDgyIDIuNDQ1LTQuNTIyIDMuMDQxMS02LjgyOTcuMjcxNC0xLjA1MDcuNzk4Mi0zLjUyMzcuMTIyMi00LjczMTZhMS41NjQxIDEuNTY0MSAwIDAgMC0uMTUwOS0uMjM1QzIxLjY5MzEuOTA4NiAxOS44MDA3LjAyNDggMTcuNTA5OS4wMDA1Yy0xLjQ5NDctLjAxNTgtMi43NzA1LjM0NjEtMy4xMTYxLjQ3OTRhOS40NDkgOS40NDkgMCAwIDAtLjUxNTktLjA4MTYgOC4wNDQgOC4wNDQgMCAwIDAtMS4zMTE0LS4xMjc4Yy0xLjE4MjItLjAxODQtMi4yMDM4LjI2NDItMy4wNDk4Ljg0MDYtLjg1NzMtLjMyMTEtNC43ODg4LTEuNjQ1LTcuMjIxOS4wNzg4Qy45MzU5IDIuMTUyNi4zMDg2IDMuODczMy40MzAyIDYuMzA0M2MuMDQwOS44MTguNTA2OSAzLjMzNCAxLjI0MjMgNS43NDM2LjQ1OTggMS41MDY1LjkzODcgMi43MDE5IDEuNDMzNCAzLjU4Mi41NTMuOTk0MiAxLjEyNTkgMS41OTMzIDEuNzE0MyAxLjc4OTUuNDQ3NC4xNDkxIDEuMTMyNy4xNDQxIDEuODU4MS0uNzI3OS44MDEyLS45NjM1IDEuNTkwMy0xLjgyNTggMS45NDQ2LTIuMjA2OS40MzUxLjIzNTUuOTA2NC4zNjI1IDEuMzkuMzc3MmEuMDU2OS4wNTY5IDAgMCAwIC4wMDA0LjAwNDEgMTEuMDMxMiAxMS4wMzEyIDAgMCAwLS4yNDcyLjMwNTRjLS4zMzg5LjQzMDItLjQwOTQuNTE5Ny0xLjUwMDIuNzQ0My0uMzEwMi4wNjQtMS4xMzQ0LjIzMzktMS4xNDY0LjgxMTUtLjAwMjUuMTIyNC4wMzI5LjIzMDkuMDkxOS4zMjY4LjIyNjkuNDIzMS45MjE2LjYwOTcgMS4wMTUuNjMzMSAxLjMzNDUuMzMzNSAyLjUwNDQuMDkyIDMuMzcxNC0uNjc4Ny0uMDE3IDIuMjMxLjA3NzUgNC40MTc0LjM0NTQgNS4wODc0LjIyMTIuNTUyOS43NjE4IDEuOTA0NSAyLjQ2OTIgMS45MDQzLjI1MDUgMCAuNTI2My0uMDI5MS44Mjk2LS4wOTQxIDEuNzgxOS0uMzgyMSAyLjU1NTctMS4xNjk2IDIuODU1LTIuOTA1OS4xNTAzLS44NzA3LjQwMTYtMi44NzUzLjUzODgtNC4xMDEyLjAxNjktLjA3MDMuMDM1Ny0uMTIwNy4wNTctLjEzNjIuMDAwNy0uMDAwNS4wNjk3LS4wNDcxLjQyNzIuMDMwN2EuMzY3My4zNjczIDAgMCAwIC4wNDQzLjAwNjhsLjI1MzkuMDIyMy4wMTQ5LjAwMWMuODQ2OC4wMzg0IDEuOTExNC0uMTQyNiAyLjUzMTItLjQzMDguNjQzOC0uMjk4OCAxLjgwNTctMS4wMzIzIDEuNTk1MS0xLjY2OTh6TTIuMzcxIDExLjg3NjVjLS43NDM1LTIuNDM1OC0xLjE3NzktNC44ODUxLTEuMjEyMy01LjU3MTktLjEwODYtMi4xNzE0LjQxNzEtMy42ODI5IDEuNTYyMy00LjQ5MjcgMS44MzY3LTEuMjk4NiA0LjgzOTgtLjU0MDggNi4xMDgtLjEzLS4wMDMyLjAwMzItLjAwNjYuMDA2MS0uMDA5OC4wMDk0LTIuMDIzOCAyLjA0NC0xLjk3NTggNS41MzYtMS45NzA4IDUuNzQ5NS0uMDAwMi4wODIzLjAwNjYuMTk4OS4wMTYyLjM1OTMuMDM0OC41ODczLjA5OTYgMS42ODA0LS4wNzM1IDIuOTE4NC0uMTYwOSAxLjE1MDQuMTkzNyAyLjI3NjQuOTcyOCAzLjA4OTIuMDgwNi4wODQxLjE2NDguMTYzMS4yNTE4LjIzNzQtLjM0NjguMzcxNC0xLjEwMDQgMS4xOTI2LTEuOTAyNSAyLjE1NzYtLjU2NzcuNjgyNS0uOTU5Ny41NTE3LTEuMDg4Ni41MDg3LS4zOTE5LS4xMzA3LS44MTMtLjU4NzEtMS4yMzgxLTEuMzIyMy0uNDc5Ni0uODM5LS45NjM1LTIuMDMxNy0xLjQxNTUtMy41MTI2em02LjAwNzIgNS4wODcxYy0uMTcxMS0uMDQyOC0uMzI3MS0uMTEzMi0uNDMyMi0uMTc3Mi4wODg5LS4wMzk0LjIzNzQtLjA5MDIuNDgzMy0uMTQwOSAxLjI4MzMtLjI2NDEgMS40ODE1LS40NTA2IDEuOTE0My0xLjAwMDIuMDk5Mi0uMTI2LjIxMTYtLjI2ODcuMzY3My0uNDQyNmEuMzU0OS4zNTQ5IDAgMCAwIC4wNzM3LS4xMjk4Yy4xNzA4LS4xNTEzLjI3MjQtLjEwOTkuNDM2OS0uMDQxNy4xNTYuMDY0Ni4zMDc4LjI2LjM2OTUuNDc1Mi4wMjkxLjEwMTYuMDYxOS4yOTQ1LS4wNDUyLjQ0NDQtLjkwNDMgMS4yNjU4LTIuMjIxNiAxLjI0OTQtMy4xNjc2IDEuMDEyOHptMi4wOTQtMy45ODgtLjA1MjUuMTQxYy0uMTMzLjM1NjYtLjI1NjcuNjg4MS0uMzMzNCAxLjAwMy0uNjY3NC0uMDAyMS0xLjMxNjgtLjI4NzItMS44MTA1LS44MDI0LS42Mjc5LS42NTUxLS45MTMxLTEuNTY2NC0uNzgyNS0yLjUwMDQuMTgyOC0xLjMwNzkuMTE1My0yLjQ0NjguMDc5LTMuMDU4Ni0uMDA1LS4wODU3LS4wMDk1LS4xNjA3LS4wMTIyLS4yMTk5LjI5NTctLjI2MjEgMS42NjU5LS45OTYyIDIuNjQyOS0uNzcyNC40NDU5LjEwMjIuNzE3Ni40MDU3LjgzMDUuOTI4LjU4NDYgMi43MDM4LjA3NzQgMy44MzA3LS4zMzAyIDQuNzM2My0uMDg0LjE4NjYtLjE2MzMuMzYyOS0uMjMxMS41NDU0em03LjM2MzcgNC41NzI1Yy0uMDE2OS4xNzY4LS4wMzU4LjM3Ni0uMDYxOC41OTU5bC0uMTQ2LjQzODNhLjM1NDcuMzU0NyAwIDAgMC0uMDE4Mi4xMDc3Yy0uMDA1OS40NzQ3LS4wNTQuNjQ4OS0uMTE1Ljg2OTMtLjA2MzQuMjI5Mi0uMTM1My40ODkxLS4xNzk0IDEuMDU3NS0uMTEgMS40MTQzLS44NzgyIDIuMjI2Ny0yLjQxNzIgMi41NTY1LTEuNTE1NS4zMjUxLTEuNzg0My0uNDk2OC0yLjAyMTItMS4yMjE3YTYuNTgyNCA2LjU4MjQgMCAwIDAtLjA3NjktLjIyNjZjLS4yMTU0LS41ODU4LS4xOTExLTEuNDExOS0uMTU3NC0yLjU1NTEuMDE2NS0uNTYxMi0uMDI0OS0xLjkwMTMtLjMzMDItMi42NDYyLjAwNDQtLjI5MzIuMDEwNi0uNTkwOS4wMTktLjg5MThhLjM1MjkuMzUyOSAwIDAgMC0uMDE1My0uMTEyNiAxLjQ5MjcgMS40OTI3IDAgMCAwLS4wNDM5LS4yMDhjLS4xMjI2LS40MjgzLS40MjEzLS43ODY2LS43Nzk3LS45MzUxLS4xNDI0LS4wNTktLjQwMzgtLjE2NzItLjcxNzgtLjA4NjkuMDY3LS4yNzYuMTgzMS0uNTg3NS4zMDktLjkyNDlsLjA1MjktLjE0MmMuMDU5NS0uMTYuMTM0LS4zMjU3LjIxMy0uNTAxMi40MjY1LS45NDc2IDEuMDEwNi0yLjI0NTMuMzc2Ni01LjE3NzItLjIzNzQtMS4wOTgxLTEuMDMwNC0xLjYzNDMtMi4yMzI0LTEuNTA5OC0uNzIwNy4wNzQ2LTEuMzc5OS4zNjU0LTEuNzA4OC41MzIxYTUuNjcxNiA1LjY3MTYgMCAwIDAtLjE5NTguMTA0MWMuMDkxOC0xLjEwNjQuNDM4Ni0zLjE3NDEgMS43MzU3LTQuNDgyM2E0LjAzMDYgNC4wMzA2IDAgMCAxIC4zMDMzLS4yNzYuMzUzMi4zNTMyIDAgMCAwIC4xNDQ3LS4wNjQ0Yy43NTI0LS41NzA2IDEuNjk0NS0uODUwNiAyLjgwMi0uODMyNS40MDkxLjAwNjcuODAxNy4wMzM5IDEuMTc0Mi4wODEgMS45MzkuMzU0NCAzLjI0MzkgMS40NDY4IDQuMDM1OSAyLjM4MjcuODE0My45NjIzIDEuMjU1MiAxLjkzMTUgMS40MzEyIDIuNDU0My0xLjMyMzItLjEzNDYtMi4yMjM0LjEyNjgtMi42Nzk3Ljc3OS0uOTkyNiAxLjQxODkuNTQzIDQuMTcyOSAxLjI4MTEgNS40OTY0LjEzNTMuMjQyNi4yNTIyLjQ1MjIuMjg4OS41NDEzLjI0MDMuNTgyNS41NTE1Ljk3MTMuNzc4NyAxLjI1NTIuMDY5Ni4wODcuMTM3Mi4xNzE0LjE4ODUuMjQ1LS40MDA4LjExNTUtMS4xMjA4LjM4MjUtMS4wNTUyIDEuNzE3LS4wMTIzLjE1NjMtLjA0MjMuNDQ2OS0uMDgzNC44MTQ4LS4wNDYxLjIwNzctLjA3MDIuNDYwMy0uMDk5NC43NjYyem0uODkwNS0xLjYyMTFjLS4wNDA1LS44MzE2LjI2OTEtLjkxODUuNTk2Ny0xLjAxMDVhMi44NTY2IDIuODU2NiAwIDAgMCAuMTM1LS4wNDA2IDEuMjAyIDEuMjAyIDAgMCAwIC4xMzQyLjEwM2MuNTcwMy4zNzY1IDEuNTgyMy40MjEzIDMuMDA2OC4xMzQ0LS4yMDE2LjE3NjktLjUxODkuMzk5NC0uOTUzMy42MDExLS40MDk4LjE5MDMtMS4wOTU3LjMzMy0xLjc0NzMuMzYzNi0uNzE5Ny4wMzM2LTEuMDg1OS0uMDgwNy0xLjE3MjEtLjE1MXptLjU2OTUtOS4yNzEyYy0uMDA1OS4zNTA4LS4wNTQyLjY2OTItLjEwNTQgMS4wMDE3LS4wNTUuMzU3Ni0uMTEyLjcyNzQtLjEyNjQgMS4xNzYyLS4wMTQyLjQzNjguMDQwNC44OTA5LjA5MzIgMS4zMzAxLjEwNjYuODg3LjIxNiAxLjgwMDMtLjIwNzUgMi43MDE0YTMuNTI3MiAzLjUyNzIgMCAwIDEtLjE4NzYtLjM4NTZjLS4wNTI3LS4xMjc2LS4xNjY5LS4zMzI2LS4zMjUxLS42MTYyLS42MTU2LTEuMTA0MS0yLjA1NzQtMy42ODk2LTEuMzE5My00Ljc0NDYuMzc5NS0uNTQyNyAxLjM0MDgtLjU2NjEgMi4xNzgxLS40NjN6bS4yMjg0IDcuMDEzN2ExMi4zNzYyIDEyLjM3NjIgMCAwIDAtLjA4NTMtLjEwNzRsLS4wMzU1LS4wNDQ0Yy43MjYyLTEuMTk5NS41ODQyLTIuMzg2Mi40NTc4LTMuNDM4NS0uMDUxOS0uNDMxOC0uMTAwOS0uODM5Ni0uMDg4NS0xLjIyMjYuMDEyOS0uNDA2MS4wNjY2LS43NTQzLjExODUtMS4wOTExLjA2MzktLjQxNS4xMjg4LS44NDQzLjExMDktMS4zNTA1LjAxMzQtLjA1MzEuMDE4OC0uMTE1OC4wMTE4LS4xOTAyLS4wNDU3LS40ODU1LS41OTk5LTEuOTM4LTEuNzI5NC0zLjI1My0uNjA3Ni0uNzA3My0xLjQ4OTYtMS40OTcyLTIuNjg4OS0yLjAzOTUuNTI1MS0uMTA2NiAxLjIzMjgtLjIwMzUgMi4wMjQ0LS4xODU5IDIuMDUxNS4wNDU2IDMuNjc0Ni44MTM1IDQuODI0MiAyLjI4MjRhLjkwOC45MDggMCAwIDEgLjA2NjcuMTAwMmMuNzIzMSAxLjM1NTYtLjI3NjIgNi4yNzUxLTIuOTg2NyAxMC41NDA1em0tOC44MTY2LTYuMTE2MmMtLjAyNS4xNzk0LS4zMDg5LjQyMjUtLjYyMTEuNDIyNWEuNTgyMS41ODIxIDAgMCAxLS4wODA5LS4wMDU2Yy0uMTg3My0uMDI2LS4zNzY1LS4xNDQtLjUwNTktLjMxNTYtLjA0NTgtLjA2MDUtLjEyMDMtLjE3OC0uMTA1NS0uMjg0NC4wMDU1LS4wNDAxLjAyNjEtLjA5ODUuMDkyNS0uMTQ4OC4xMTgyLS4wODk0LjM1MTgtLjEyMjYuNjA5Ni0uMDg2Ny4zMTYzLjA0NDEuNjQyNi4xOTM4LjYxMTMuNDE4NnptNy45MzA1LS40MTE0Yy4wMTExLjA3OTItLjA0OS4yMDEtLjE1MzEuMzEwMi0uMDY4My4wNzE3LS4yMTIuMTk2MS0uNDA3OS4yMjMyYS41NDU2LjU0NTYgMCAwIDEtLjA3NS4wMDUyYy0uMjkzNSAwLS41NDE0LS4yMzQ0LS41NjA3LS4zNzE3LS4wMjQtLjE3NjUuMjY0MS0uMzEwNi41NjExLS4zNTIuMjk3LS4wNDE0LjYxMTEuMDA4OC42MzU2LjE4NTF6Ii8+PC9zdmc+" alt="PostgreSQL logo" /></div>
            <div class="row" style="flex:1;"><h3>@types/pg</h3><span class="ver">^8.20.0</span></div>
          </div>
          <p>TypeScript definitions for the node-postgres driver.</p>
          <span class="tag dev">dev dependency</span>
        </div>

      </div>
    </div>
  </section>

  <section id="scripts">
    <div class="container">
      <div class="section-head">
        <h2>Scripts</h2>
        <p>Commands defined in package.json — run with <code>bun run &lt;name&gt;</code>.</p>
      </div>
      <div class="scripts">
        <div class="script">
          <div class="name">dev</div>
          <div class="cmd">bun --watch src/index.tsx</div>
        </div>
        <div class="script">
          <div class="name">build</div>
          <div class="cmd">tsc</div>
        </div>
        <div class="script">
          <div class="name">start</div>
          <div class="cmd">bun run src/index.tsx</div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="container">examination-platform-api · ESM · Built with Bun</div>
</footer>

</body>
</html>

`;
