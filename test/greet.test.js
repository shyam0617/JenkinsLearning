// A real test using Node's built-in test runner (no extra dependencies).
// The pipeline's "Test" stage runs `npm test`, which runs this file.
import test from "node:test";
import assert from "node:assert";
import { greet } from "../greet.js";

test("greets the world by default", () => {
  assert.strictEqual(greet(), "Hello, world!");
});

test("greets a person by name", () => {
  assert.strictEqual(greet("Shyam"), "Hello, Shyam!");
});
