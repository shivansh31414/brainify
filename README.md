# Muted Web

A sensory reduction Chrome extension designed to instantly neutralize hyper-stimulating, volatile, and hyper-interactive layouts. It minimizes sensory overload by freezing physics loops, throttling timers, disabling micro-animations, standardizing typography, and flattening dynamic styling on any website.

## Features

### 🚫 Physics & Render Freezing
* Overrides `requestAnimationFrame` (and vendor-specific prefixes) to freeze heavy rendering loops, canvas-based physics engines, and continuous screen updates.

### ⏱️ Timer Throttling
* Intercepts `setInterval` to block loops executing at intervals faster than 10Hz (100ms).
* Throttles low-delay `setTimeout` calls (less than 20ms) to a calm, flat 100ms delay to prevent cascade animation rendering.

### 🔌 Event Decoupling
* Intercepts and blocks high-frequency interaction event listeners (`mousemove`, `mouseover`, `pointermove`, `touchmove`, `drag`, `wheel`, etc.) on global contexts like `window`, `document`, and `document.body`.
* Prevents interactive elements and tracking scripts from reacting dynamically to mouse vector movements.
* Disables inline listener assignments (e.g., `window.onmousemove`).

### 📐 Dynamic Stability & DOM Flattening
* Leverages a `MutationObserver` to watch styling mutations. If an element updates its styles more than twice within 500ms, it is classified as a high-frequency layout/animation node, and is stripped of dynamic properties (like `position`, `transform`, `left`, `top`, `right`, `bottom`).
* Freezes and hides all canvas-based interactive elements automatically.

### 🎨 Visual & Typographical Neutralization
* **Grayscale Filter:** Applies `filter: grayscale(85%)` globally to reduce sensory color fatigue while preserving basic usability.
* **Muted Color Scheme:** Forces a warm, non-harsh background (`#f7f7f7`) and soft dark text (`#333333`).
* **Animation resets:** Disables transitions and CSS keyframe animations globally.
* **Standardized Typography:** Forces clean, readable sans-serif system fonts.
* **Static Hover States:** Disables hover transformations (`scale`, `transform`, `box-shadow`) and keeps hover cursor interactions simple and uniform.

---

## File Structure

* [manifest.json](file:///e:/d1/brainify/manifest.json) — Extension manifest (Version 3) that loads content scripts.
* [content.js](file:///e:/d1/brainify/content.js) — Injected script running in the `MAIN` world at `document_start` to intercept global browser APIs (RAF, timers, event listeners).
* [content.css](file:///e:/d1/brainify/content.css) — Custom stylesheet injected at `document_start` to override visual layouts and behavior.

---

## Installation

To load and use **Muted Web** in your browser:

1. Open your Chromium-based browser (Chrome, Edge, Brave, etc.) and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (usually a toggle in the top-right corner).
3. Click **Load unpacked** in the top-left corner.
4. Select the `brainify` project directory containing these files.

---

## License

This project is licensed under the MIT License.
