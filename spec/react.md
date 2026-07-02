# React for the PEWS Chart — a discussion

*Status: discussion / decision pending. Author: pairing session, 2026-07-02. No code
committed to act on this — it's for you to read and decide.*

## TL;DR

- The things you liked about the **Digital Growth Charts (dGC) React component** —
  *"import it cleanly into other software"*, typed props, CDN loading — are **real and
  worth having**. But most of them come from **packaging** (a published NPM package with a
  UMD/CDN build + TypeScript types), **not from React itself**.
- React's core superpower is **declarative rendering with diffing**. dGC gets full value
  from that because it draws with **Victory (declarative SVG)**. Our PEWS chart draws with
  **imperative Canvas 2D** — ~1,750 lines and ~280 `ctx.*` calls in `chart.js`. Almost none
  of that benefits from React; it would sit essentially unchanged inside a `useEffect`.
- So React would make the **shell** (header/toolbar/sidebar/footer) a little tidier and give
  us **typed props + team familiarity + dGC consistency**, while doing **nothing** for the
  90% that is hard (the canvas engine) — and it would cost us a **build pipeline** and a
  runtime **dependency** in a tool whose pitch is "vendor-neutral, no lock-in".
- **My recommendation:** don't adopt React *just* to wrap canvas. Get the exact ergonomics
  you liked — a drop-in `<npews-chart>` element, JSON props, CDN + Subresource Integrity —
  from a **framework-neutral Web Component (Custom Element)** that keeps the canvas engine
  inside. Add **TypeScript types** for the props (the separable, high-value win). This works
  *identically* in React, Angular, Vue, plain HTML, or an EHR iframe — which is a stronger
  NHS story than "you need React to use our chart".
- **But** if "one team, one stack" (shared tooling, everyone already fluent in the dGC repo)
  matters more to you than the canvas mismatch, React is a **legitimate, defensible** choice —
  just do it properly, mirroring the dGC setup so muscle memory transfers.

The rest of this document explains the reasoning so you can disagree with it from an informed
position.

---

## 1. What you actually liked about the dGC component

From the dGC library (`@rcpch/digital-growth-charts-react-component-library`, v7.5.2):

- You pass in a **`MeasurementObject`** (raw JSON from the dGC API) and it renders. Clean data
  boundary.
- Consumers `npm install` it and `import { RCPCHChart } from '@rcpch/...'`. Nice DX for a React
  shop.
- For non-React / no-build deployments, you ship a **UMD bundle** (`unpkg` / `jsdelivr` fields
  in `package.json` → `build/umd/…umd.min.js`) loadable via a `<script>` tag, with a
  **`generate-sri`** step producing a Subresource Integrity hash. Good for locked-down NHS
  environments.
- **TypeScript** types travel with the package (`types: build/index.d.ts`), so editors
  autocomplete the props.
- Team familiarity: you and the team already think in this stack.

Notice that of those five, only *one* ("import a React component") is React-specific. The
others — JSON-in data boundary, UMD/CDN + SRI, typed props — are **packaging and language
choices** that we can have with or without React. Our recent refactor already gave PEWS the
JSON-in boundary: `render({ patient, observations })` is a props call in all but name.

## 2. The question is really three questions

It helps to unbundle "should we use React?" into three **independent** axes. You can pick a
different answer on each.

| Axis | Options | What it really controls |
|------|---------|-------------------------|
| **A. Rendering tech** | Canvas (now) ↔ SVG/declarative (Victory-style) | How much React can help, and clinical pixel-fidelity risk |
| **B. Distribution** | Static demo (now) ↔ published component (NPM + UMD/CDN + types) | "Can other software import it?" |
| **C. Framework** | Vanilla / Web Component ↔ React | Consumer coupling, team ergonomics, build pipeline |

The trap is treating these as one decision ("go React and everything gets clean"). In dGC they
happened to line up (SVG + published + React). For PEWS they **don't** line up the same way,
because of Axis A.

## 3. The crux: Canvas vs SVG is why React helped dGC more than it will help us

React shines when the UI is a **declarative function of state**: you describe *what* the DOM/SVG
should look like, React diffs and patches it. dGC's charts are Victory `<VictoryLine>` /
`<VictoryScatter>` components — literally "here are the centile lines and the measurement dots
as JSX". Adding a point re-renders declaratively. That is the sweet spot.

Our PEWS chart is **imperative canvas**: we `getContext('2d')` and issue hundreds of
`fillRect` / `stroke` / `fillText` calls to paint colour bands, gridlines, trend lines, value
labels, the birthday-boundary divider, etc. Canvas is a **pixel buffer**, not a retained scene
graph — React has nothing to diff. In a React version you would still write *all* of that
drawing code, unchanged, inside:

```jsx
function PewsRow({ observations, band }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    // ... the same ~280 imperative ctx.* calls we already have ...
  }, [observations, band]);
  return <canvas ref={ref} />;
}
```

So React would wrap the canvas but **not simplify it**. The genuinely hard, safety-critical part
of this project — matching the NHS paper chart pixel-for-pixel — is exactly the part React can't
touch. You'd take on a framework and a build step to tidy the *easy* part (the shell), which is
already only ~100 lines of static markup in `chart-shell.js`.

**Corollary:** the way to make PEWS "feel as clean as dGC in React" is not really *React* — it's
**switching the renderer to declarative SVG** (Axis A). That's a separate, larger, riskier
decision (see Option C). It's the real lever; React is just the thing that would sit on top of
it.

## 4. The options

### Option A — Stay vanilla (status quo, now props-driven)

We already did the important structural work: the chart is a props-driven visualisation device
(`render({ patient, observations })`), data is separated from presentation, and there's a
dependency-free demo harness.

- **Pros:** zero dependencies; no build step; smallest possible attack surface and supply chain
  (matters for NHS assurance); fastest to load; nothing to keep up to date; the "no framework"
  hard constraint in `CLAUDE.md` stays true; strongest anti-lock-in story.
- **Cons:** consuming it from another app today means "drop these files / load these scripts",
  not `npm install`. No typed props. Shell composition is hand-rolled. Not as instantly familiar
  to the team as the dGC repo.
- **Best if:** the near-term goal is *demonstrations and a reference implementation*, not yet a
  distributed library.

### Option B — Wrap the current canvas engine in React

Keep `chart.js` more or less as-is; expose `<NpewsChart patient={…} observations={…} />` whose
`useEffect` drives the existing engine.

- **Pros:** typed props; `npm install` + `import` DX for React consumers; team familiarity; can
  reuse the dGC build/publish/CDN recipe; relatively low effort (you're wrapping, not rewriting).
- **Cons:** you pay for React (build pipeline, ~40 KB runtime for consumers who don't already
  have it, a dependency) but get **little rendering benefit** — the canvas code is untouched. You
  now maintain a React harness *and* an imperative engine. It also **couples consumers to React**
  (or to the UMD/global-React shim) for a chart that has no reason to care what framework hosts
  it.
- **Best if:** you're confident the primary consumers are React apps (or the wider RCPCH stack
  is React) and "consistency with dGC" is the deciding value.

### Option C — Rewrite rendering in React + declarative SVG (true dGC parity)

Replace the canvas engine with SVG components (roll-your-own or Victory/visx), the way dGC does.

- **Pros:** *this* is where React genuinely pays off — declarative, testable-by-DOM, the code
  reads like the chart; consistent with dGC's approach and tooling; SVG is crisp at any zoom and
  inspectable/accessible per element.
- **Cons:** it's a **rewrite of the riskiest, most safety-critical code** in the project. Pixel-
  fidelity to the paper chart is the entire clinical value, and canvas currently gives us exact
  control. SVG at our data density (many observations × colour-banded backgrounds × dividers ×
  labels) means **lots of DOM nodes** — performance and layout quirks to manage. Highest effort,
  highest regression risk, must be gated by visual-regression baselines throughout.
- **Best if:** you've decided PEWS should be a first-class React/SVG sibling of dGC long-term and
  you're willing to fund a careful, visually-regression-tested migration.

### Option D — Framework-neutral Web Component (Custom Element) — **recommended**

Wrap the existing canvas engine in a **Custom Element**, e.g. `<npews-chart>`, that takes a JSON
property and renders into its own (optionally shadow) DOM.

```html
<!-- Any page, any framework, or none: -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@rcpch/digital-pews@1/dist/npews-chart.js"
        integrity="sha384-…" crossorigin="anonymous"></script>

<npews-chart id="c"></npews-chart>
<script>
  document.getElementById('c').data = { patient, observations }; // JSON props
</script>
```

```jsx
// …and in a React app it's just an element:
<npews-chart ref={el => { el.data = { patient, observations }; }} />
```

- **Pros:**
  - Gives you the ergonomics you liked — a **drop-in element**, **JSON props**, **CDN + SRI** —
    without adopting a framework.
  - **Works identically in React, Angular, Vue, Svelte, plain HTML, and inside an EHR/SMART-on-
    FHIR iframe.** For an open-source tool pitched as the *escape* from a single vendor's stack,
    "framework-agnostic component" is a materially stronger message than "React component".
  - Keeps the canvas engine (no rewrite), stays close to zero-dependency, keeps load fast.
  - Encapsulation (Shadow DOM) means our styles won't collide with a host EHR's CSS — a real
    problem when embedding in Epic/Cerner shells.
  - Still publishable to NPM with types, and still CDN-loadable exactly like dGC's UMD bundle.
- **Cons:** Web Components have their own small learning curve; some older tooling has rough
  edges passing rich objects (mitigated by setting a `.data` property rather than a stringified
  attribute); it's not the stack the team already knows from dGC.
- **Best if** (my view): you want a **distributable, importable component** *and* the broadest,
  most lock-in-resistant reach — which is exactly the PEWS pitch.

## 5. Cross-cutting: TypeScript (decide this separately — it's the cheap win)

Most of the "typed props autocomplete" niceness you valued in dGC is **TypeScript**, not React.
You can have it three ways, in increasing commitment:

1. **JSDoc + `// @ts-check`** on the current `.js` files, plus a hand-written `npews-chart.d.ts`
   describing `ObservationsObject`. Editors get autocomplete and type-checking; **no build step**;
   files still run as-is in the browser. Very low cost, keeps Option A/D pure.
2. **A single `types.d.ts`** shipped with a published package so consumers get typed props.
3. **Full TypeScript source** (implies a build step) — natural *if* you go Option B/C.

Given the clinical domain (an `ObservationsObject` with many optional vitals, units, and
derogation codes), formalising the shape as types is worthwhile regardless of the framework
decision. I'd do (1) soon.

## 6. Cross-cutting: distribution & CDN (works for every option)

The dGC CDN story is not React-specific. Any of these can be published as:

- **NPM package** with `main`/`module`/`types` for build-pipeline consumers, and
- a **single-file bundle** (UMD for React, or a plain ESM/IIFE file for vanilla/Web Component)
  referenced from **unpkg/jsDelivr** with a **Subresource Integrity** hash (reuse dGC's
  `generate-sri` recipe).

So "loadable from CDN for trusts without a build pipeline" is achievable in Option A/D **more
easily** than in React (no need to also provide React/ReactDOM globals). This argument does *not*
favour React.

## 7. Cross-cutting: testing

- **Now:** vitest in Node for the pure logic (scoring, age-band maths, FHIR round-trip) + headless
  Chrome screenshots for the render. This split is healthy and framework-independent.
- **React (B/C):** adds Jest/Vitest + jsdom + Testing Library for component tests. Note jsdom
  **doesn't implement canvas**, so for Option B your canvas render is still only verifiable via a
  real browser (same as now) — React buys little test value there. For Option C (SVG) you'd gain
  DOM-queryable assertions ("is there a line at y=…"), which is genuinely nice.
- Visual regression (PNG baselines via Playwright/headless Chrome) is the same story in all
  options and remains the right safety net.

## 8. Cross-cutting: clinical safety & the anti-lock-in narrative

- Two things are sacred here: **pixel-fidelity to the NHS paper chart** and **computed-not-typed
  scores**. Neither is helped by React. Canvas currently gives us the tightest control over the
  former; the scorer already guarantees the latter.
- The **pitch** is a vendor-neutral, open alternative to a proprietary (Oracle/Cerner) offering.
  "Framework-agnostic Web Component you can drop into anything" reinforces that pitch;
  "you need React" slightly undercuts it. A dependency-free or framework-neutral core is also an
  **easier NHS security/assurance conversation** (smaller supply chain).

## 9. Cross-cutting: FHIR / SMART-on-FHIR fit

The product direction is SMART-on-FHIR. That *strengthens* the framework-neutral case: a chart
embedded in an EHR is typically loaded in an **iframe or as a web component inside a host app you
don't control**, where Shadow DOM style encapsulation (Option D) is a real asset. The
FHIR→`ObservationsObject` mapping (`fhir-adapter.js`) is already framework-neutral and should
stay that way — keep the FHIR boundary independent of whatever renders the chart.

## 10. Side-by-side summary

| Concern | A. Vanilla (now) | B. React-wrap-canvas | C. React + SVG | D. Web Component ★ |
|---|---|---|---|---|
| Rendering benefit from framework | n/a | ~none (canvas untouched) | **high** | ~none (canvas untouched) |
| Effort / risk | done | low–med | **high** (rewrite of safety-critical code) | low–med |
| `npm install` + typed import | ✗ (until published) | ✓ | ✓ | ✓ |
| CDN + SRI | ✓ (easy) | ✓ (needs React globals) | ✓ (needs React globals) | ✓ (easy) |
| Consumer coupling | none | React | React | **none (any framework)** |
| Team familiarity / dGC consistency | low | **high** | **high** | medium |
| Style isolation in a host EHR | manual | manual | manual | **built-in (Shadow DOM)** |
| Supply chain / assurance | **smallest** | +React +build | +React +build +Victory | small |
| "No framework" pitch intact | ✓ | ✗ | ✗ | ✓ (framework-neutral) |

## 11. Recommendation & a phased path

**Recommended:** Option **D + TypeScript(1)** — keep the canvas engine, expose it as a
framework-neutral `<npews-chart>` Custom Element with JSON props, publish it to NPM with a
CDN/UMD-style bundle + SRI (reusing the dGC recipe), and add JSDoc/`.d.ts` types for the
`ObservationsObject`. This delivers everything you valued about the dGC component while keeping
the anti-lock-in, low-dependency, clinically-conservative posture that suits PEWS.

Suggested sequence (each step independently valuable, low regression risk):

1. **Formalise the props type.** Write `ObservationsObject` / `PatientObject` as JSDoc + a
   `types.d.ts`. No behaviour change. (Also documents the boundary the FHIR adapter targets.)
2. **Wrap the engine in a Custom Element** (`<npews-chart>` with a `.data` setter that calls the
   existing `render(...)`). The current demo harness becomes a thin consumer of the element —
   proving the "embed anywhere" story to yourself.
3. **Package & publish.** Add a minimal bundle step (esbuild/Rollup — for *distribution only*,
   the source stays plain modules), `unpkg`/`jsdelivr` fields, and an SRI step. Document CDN usage.
4. **Revisit React later, deliberately.** If a concrete consumer needs a React wrapper, a
   Custom Element is trivially wrappable in a ~20-line React component — you can offer
   `@rcpch/digital-pews-react` as a *thin optional wrapper* over the neutral core, getting dGC
   consistency for React shops **without** forcing React on everyone else.

**Choose React (Option B) instead if** you decide that team/tooling consistency with dGC is the
overriding value and your consumers are overwhelmingly React. In that case, mirror dGC exactly
(Rollup, TS, peerDeps on React 18/19, UMD + SRI) so the team's existing knowledge transfers — and
budget Option C (SVG) as a *separate*, visual-regression-gated project if/when you want the chart
code itself to feel as clean as dGC's.

**Avoid** jumping straight to Option C (React + SVG rewrite) until there's a clear driver — it
puts the safety-critical renderer at risk for benefits that are mostly developer-ergonomic.

## 12. Open questions for you

1. **Who are the real first consumers?** Reference demo only, an RCPCH-hosted app, or third-party
   trust/EHR integrations? (Pushes toward D if "anyone", toward B if "React apps we control".)

> We are preparing this work for a trust (GESH) which would like to implement the chart on Oracle, using SMART-on-FHIR

2. **Is "one team, one stack" with dGC a hard requirement** or a nice-to-have? That's the single
   biggest thumb on the scale for React.

> Not really, having both projects on React would be a nice-to-have but not a hard requirement. It's only really worth it if both projects benefit from using React. WebComponents are a good alternative.

3. **Do we ever want to leave canvas for SVG?** If yes someday, that's the moment React earns its
   place — plan it as its own project, not a side-effect of packaging.

> This perhaps needs further discussion pros/cons. 

4. **Are you happy to introduce a build step for *distribution* only**, while the source stays
   plain modules? (Needed for any published bundle, React or not.)

> yes

5. **Should the `CLAUDE.md` "no framework" hard constraint be softened** to "framework-neutral
   core; optional framework wrappers"? (Recommended wording if we go D.)

> yes
