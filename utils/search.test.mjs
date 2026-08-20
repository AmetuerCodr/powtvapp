import assert from "node:assert/strict";
import test from "node:test";

import {
  escapeLikePattern,
  isVideoCategory,
  normalizeSearchTerm,
} from "./search.ts";

test("normalizes surrounding and repeated whitespace", () => {
  assert.equal(
    normalizeSearchTerm("  faith\n  over\tfear  "),
    "faith over fear",
  );
  assert.equal(normalizeSearchTerm(" \n\t "), "");
});

test("accepts only canonical video category values", () => {
  assert.equal(isVideoCategory("Music & Worship"), true);
  assert.equal(isVideoCategory("music & worship"), false);
  assert.equal(isVideoCategory(undefined), false);
});

test("escapes LIKE wildcards and the escape character", () => {
  assert.equal(
    escapeLikePattern(String.raw`100%_faith\path`),
    String.raw`100\%\_faith\\path`,
  );
});
