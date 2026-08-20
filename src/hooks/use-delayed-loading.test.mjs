import assert from "node:assert/strict";
import test from "node:test";

import {
  getSkeletonHideDelay,
  scheduleSkeletonReveal,
  SKELETON_REVEAL_DELAY_MS,
} from "./use-delayed-loading.ts";

test("fast loads never reveal the skeleton", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let visible = false;
  const cancel = scheduleSkeletonReveal(() => {
    visible = true;
  });

  t.mock.timers.tick(SKELETON_REVEAL_DELAY_MS - 1);
  assert.equal(visible, false);

  cancel();
  t.mock.timers.tick(1);
  assert.equal(visible, false);
});

test("slow loads reveal the skeleton after the grace period", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let visible = false;
  scheduleSkeletonReveal(() => {
    visible = true;
  });

  t.mock.timers.tick(SKELETON_REVEAL_DELAY_MS);
  assert.equal(visible, true);
});

test("a revealed skeleton stays visible long enough to avoid a flash", () => {
  assert.equal(getSkeletonHideDelay(1_000, 1_100), 200);
  assert.equal(getSkeletonHideDelay(1_000, 1_300), 0);
});
