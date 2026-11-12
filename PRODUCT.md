# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript on Vite (user asked for React and the JavaScript ecosystem; the rest was delegated). Static build deployed to GitHub Pages from the owner's personal GitHub account. End-to-end tests in Python with pytest + Playwright (user requirement).

## Users

- Primary: the author presenting the project in the course "Qualidade e Teste de Software" (Sistemas de Informação, 7º/8º período, UNESC Colatina), and the professor and classmates watching a live demo of the store and its automated tests.
- In-fiction: a shopper browsing a catalog of invented objects, adding them to a cart and completing a simulated checkout.

## Product Purpose

Armazém Ficção is a fully working e-commerce storefront whose every product is invented. It exists to be the system under test for an automated test suite: it must have enough real behavior (search, filters, variants, stock limits, cart, coupons, shipping by CEP, form validation, sign-in, order history) for the tests to be meaningful and hard. Success: the demo works end to end in production, and the Playwright suite proves it, including failure cases.

## Positioning

Every object is fictional, named and described with dry humor, and openly labeled as not real. Nothing is charged, shipped, or stored outside the visitor's own browser.

## Operating Context

- Shown live on a projector during a class presentation, and opened by the professor on a laptop.
- Delivered alongside a Word report (system, tool, test routine, results) uploaded to the university portal (Moodle).
- CI on GitHub Actions runs the Playwright suite on every push and deploys only when it passes.

## Capabilities and Constraints

- Static site, no backend: catalog served as a JSON file; cart, session and orders live in localStorage.
- Payments are simulated; card numbers are validated by format (Luhn) only and never leave the page.
- Language: Brazilian Portuguese, prices in BRL.
- Every interactive element needs a stable accessible name so tests can target it by role.

## Brand Commitments

- Name: Armazém Ficção. Tone: dry, deadpan humor about impossible objects; never mocking the shopper.

## Evidence on Hand

- No real products, customers, reviews, or sales numbers exist. Any review or rating shown is synthetic and labeled as such.

## Product Principles

1. Fiction in the catalog, honesty in the interface: the store's behavior is real and predictable even though its products are not.
2. Every rule a shopper meets (stock limit, coupon, CEP, card) is visible and explained, so it can be tested.
3. Testability is a feature: stable labels, roles, and states over clever markup.

## Accessibility & Inclusion

WCAG 2.1 AA target; verified with automated axe checks in the test suite. Full keyboard operation and reduced-motion support.
