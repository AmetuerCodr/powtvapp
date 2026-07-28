import assert from "node:assert/strict";
import test from "node:test";

import {
  getPlayableShorts,
  getPublicPlaybackId,
  getVideoFeedItems,
} from "./shorts.ts";

test("returns the first valid public Mux playback ID", () => {
  assert.equal(
    getPublicPlaybackId([
      { id: "signed-id", policy: "signed" },
      { id: "public-id", policy: "public" },
    ]),
    "public-id",
  );
});

test("rejects missing, malformed, and non-public playback IDs", () => {
  assert.equal(getPublicPlaybackId(null), undefined);
  assert.equal(getPublicPlaybackId([{ id: "", policy: "public" }]), undefined);
  assert.equal(getPublicPlaybackId([{ id: "  ", policy: "public" }]), undefined);
  assert.equal(
    getPublicPlaybackId([{ id: "signed-id", policy: "signed" }]),
    undefined,
  );
});

test("keeps playable assets in page order and removes duplicate IDs", () => {
  const shorts = getPlayableShorts([
    [
      { id: "signed", playback_ids: [{ id: "s", policy: "signed" }] },
      { id: "first", playback_ids: [{ id: "p1", policy: "public" }] },
    ],
    [
      { id: "second", playback_ids: [{ id: "p2", policy: "public" }] },
      { id: "first", playback_ids: [{ id: "p1-new", policy: "public" }] },
    ],
  ]);

  assert.deepEqual(
    shorts.map(({ asset }) => asset.id),
    ["first", "second"],
  );
  assert.equal(shorts[0].playbackId, "p1-new");
});

test("makes one 2-4 item shelf per portrait run without reordering", () => {
  const videos = [
    { id: "wide-1", aspect_ratio: "16:9" },
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `short-${index + 1}`,
      aspect_ratio: "9:16",
    })),
    { id: "square", aspect_ratio: "1:1" },
    { id: "short-6", aspect_ratio: "9:16" },
    { id: "wide-2", aspect_ratio: "16:9" },
    ...Array.from({ length: 3 }, (_, index) => ({
      id: `short-${index + 7}`,
      aspect_ratio: "9:16",
    })),
  ];
  const items = getVideoFeedItems(videos);
  const groupedIds = items.flatMap((item) =>
    item.type === "shorts"
      ? item.videos.map(({ id }) => id)
      : [item.video.id],
  );

  assert.deepEqual(groupedIds, videos.map(({ id }) => id));
  assert.deepEqual(
    items.map((item) =>
      item.type === "shorts" ? `shorts:${item.videos.length}` : item.video.id,
    ),
    [
      "wide-1",
      "shorts:4",
      "short-5",
      "square",
      "short-6",
      "wide-2",
      "shorts:3",
    ],
  );
  assert.ok(
    items
      .filter((item) => item.type === "shorts")
      .every((item) => item.videos.length >= 2 && item.videos.length <= 4),
  );
});
