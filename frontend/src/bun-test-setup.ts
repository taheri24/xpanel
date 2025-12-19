// Test setup for Bun tests with jsdom
import { JSDOM } from "jsdom";

// Create a jsdom instance
const dom = new JSDOM("<!DOCTYPE html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
});

// Set up global DOM APIs
const w = dom.window;
globalThis.window = w as unknown as Window & typeof globalThis;
globalThis.document = w.document;
globalThis.navigator = w.navigator;
globalThis.HTMLElement = w.HTMLElement;
globalThis.Element = w.Element;
globalThis.Node = w.Node;
globalThis.Text = w.Text;
globalThis.DocumentFragment = w.DocumentFragment;
globalThis.Event = w.Event;
globalThis.MouseEvent = w.MouseEvent;
globalThis.KeyboardEvent = w.KeyboardEvent;
globalThis.CustomEvent = w.CustomEvent;
globalThis.MutationObserver = w.MutationObserver;
globalThis.getComputedStyle = w.getComputedStyle;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (h: number) => clearTimeout(h);
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};
globalThis.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
};

// Extend matchers for testing-library
import "@testing-library/jest-dom";
