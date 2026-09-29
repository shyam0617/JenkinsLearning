// A tiny pure function. We keep the "logic" separate from the server so we can
// TEST it easily (see test/greet.test.js). This makes the pipeline's Test stage
// actually meaningful.
export function greet(name) {
  if (!name) return "Hello, world!";
  return `Hello, ${name}!`;
}
