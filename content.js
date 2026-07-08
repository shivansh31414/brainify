/**
 * Muted Web - Sensory Reduction Content Script
 * 
 * Target: High-frequency event loops, physics engines, dynamic layout shifts.
 * Strategy: Runs in the MAIN context at document_start.
 * - Overrides requestAnimationFrame and cancelAnimationFrame to freeze rendering loops.
 * - Throttles or blocks high-frequency setInterval and setTimeout calls.
 * - Intercepts addEventListener to decouple mousemove, mouseover, touch, and drag event listeners on window/document/body.
 * - Monitors DOM mutations to identify and flatten elements under active physics/layout manipulation.
 */

(function () {
  'use strict';

  console.log('[Muted Web] Sensory reduction script initialized in page context.');

  // =========================================================================
  // 1. Overriding requestAnimationFrame Loops (Physics & Render Freezing)
  // =========================================================================
  const noopRAF = function (callback) {
    // Return a dummy frame ID but do not execute the callback
    return 1;
  };
  const noopCancel = function (id) {
    // No-op
  };

  // Override standard and vendor-specific requestAnimationFrame/cancelAnimationFrame
  const rafProperties = [
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'webkitRequestAnimationFrame',
    'webkitCancelAnimationFrame',
    'mozRequestAnimationFrame',
    'mozCancelAnimationFrame',
    'msRequestAnimationFrame',
    'msCancelAnimationFrame'
  ];

  rafProperties.forEach(prop => {
    if (prop.includes('cancel') || prop.includes('Cancel')) {
      Object.defineProperty(window, prop, {
        value: noopCancel,
        writable: false,
        configurable: true
      });
    } else {
      Object.defineProperty(window, prop, {
        value: noopRAF,
        writable: false,
        configurable: true
      });
    }
  });

  // =========================================================================
  // 2. Throttling and Blocking High-Frequency Timers (setInterval/setTimeout)
  // =========================================================================
  const originalSetInterval = window.setInterval;
  const originalSetTimeout = window.setTimeout;

  // Intercept setInterval to block updates faster than 10Hz (100ms)
  window.setInterval = function (callback, delay, ...args) {
    if (typeof delay === 'number' && delay < 100) {
      console.log(`[Muted Web] Blocked high-frequency setInterval loop (delay: ${delay}ms).`);
      return -1; // Return a dummy interval ID
    }
    return originalSetInterval.call(window, callback, delay, ...args);
  };

  // Intercept setTimeout to throttle recursive execution cascades
  window.setTimeout = function (callback, delay, ...args) {
    // If delay is extremely low (< 20ms) and represents potential rendering loops, push it to a harmless delay
    let finalDelay = delay;
    if (typeof delay === 'number' && delay < 20) {
      finalDelay = 100; // Throttle to a calm interval
    }
    return originalSetTimeout.call(window, callback, finalDelay, ...args);
  };

  // =========================================================================
  // 3. Event Loop Decoupling (Nullifying aggressive mouse and dragging input)
  // =========================================================================
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const hyperStimulatingEvents = [
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseenter',
    'mouseleave',
    'pointermove',
    'pointerover',
    'pointerout',
    'touchmove',
    'drag',
    'dragstart',
    'dragend',
    'dragover',
    'wheel',
    'mousewheel'
  ];

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    // Intercept event bindings on core global objects (window, document, body)
    if (hyperStimulatingEvents.includes(type)) {
      const isGlobalTarget = (
        this === window ||
        this === document ||
        this === document.body ||
        this === document.documentElement ||
        (this instanceof Element && this.tagName === 'BODY')
      );

      if (isGlobalTarget) {
        // Discard high-frequency input event bindings to prevent physics engines from tracking cursor vectors
        console.log(`[Muted Web] Blocked event listener registration: '${type}' on global context.`);
        return;
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Block inline handlers (e.g. window.onmousemove) on window, document, and document.body
  hyperStimulatingEvents.forEach(evt => {
    const propName = `on${evt}`;
    
    // Window block
    Object.defineProperty(window, propName, {
      get: () => null,
      set: (val) => {
        console.log(`[Muted Web] Blocked inline listener assignment: window.${propName}`);
      },
      configurable: true
    });

    // Document block
    Object.defineProperty(document, propName, {
      get: () => null,
      set: (val) => {
        console.log(`[Muted Web] Blocked inline listener assignment: document.${propName}`);
      },
      configurable: true
    });
  });

  // =========================================================================
  // 4. Dynamic Stability (MutationObserver to capture & flatten physics nodes)
  // =========================================================================
  const styleChangeTracker = new Map();

  function sanitizeElement(el) {
    if (el.tagName === 'CANVAS') {
      // Force disable layout and mouse interaction for canvas-based engines
      el.style.setProperty('pointer-events', 'none', 'important');
      el.style.setProperty('display', 'none', 'important');
      console.log(`[Muted Web] Canvas element frozen and hidden.`);
    }
    sanitizeStyle(el);
  }

  function sanitizeStyle(el) {
    // Don't inspect elements without inline styles
    const styleAttr = el.getAttribute('style');
    if (!styleAttr) return;

    const now = performance.now();
    let record = styleChangeTracker.get(el);

    if (!record) {
      record = { count: 0, lastTime: now };
      styleChangeTracker.set(el, record);
    }

    // Heuristic: If style changes more than twice in under 500ms, it is a high-frequency animation/physics updates loop
    if (now - record.lastTime < 500) {
      record.count++;
    } else {
      record.count = 1;
    }
    record.lastTime = now;

    if (record.count >= 3) {
      // Add visual flattening class
      el.classList.add('muted-web-flattened');

      // Intercept and strip physics movement inline properties
      el.style.removeProperty('position');
      el.style.removeProperty('transform');
      el.style.removeProperty('left');
      el.style.removeProperty('top');
      el.style.removeProperty('right');
      el.style.removeProperty('bottom');
      
      console.log(`[Muted Web] Dynamic physics element flattened:`, el);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            sanitizeElement(node);
            node.querySelectorAll('*').forEach(sanitizeElement);
          }
        });
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target.nodeType === Node.ELEMENT_NODE) {
          // Temporarily pause observer to prevent circular triggering while we modify style attributes
          observer.disconnect();
          sanitizeStyle(target);
          startObserver();
        }
      }
    }
  });

  function startObserver() {
    const root = document.documentElement || document;
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }
  }

  // Initialize MutationObserver safely as soon as document structure is ready
  if (document.documentElement) {
    startObserver();
  } else {
    const docCheck = originalSetInterval.call(window, () => {
      if (document.documentElement) {
        clearInterval(docCheck);
        startObserver();
      }
    }, 1);
  }

})();
