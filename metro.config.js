const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// --- metro 0.84 compatibility shim for nativewind / react-native-css-interop ---
// On CSS hot-reload, react-native-css-interop emits a haste-change event that
// metro 0.84 doesn't understand. Two bad shapes are seen in the wild:
//   - legacy:  `{ eventsQueue: [...] }`
//   - current: `{ addedFiles, removedFiles, changedFiles }` (top-level, no `.changes`)
// Metro 0.84 requires `{ changes: { addedFiles, modifiedFiles, removedFiles }, rootDir }`.
// Either way `.changes` is absent => crash:
//   "Cannot read properties of undefined (reading 'addedFiles')".
// Normalize ANY event missing `.changes` into the expected shape; carry over the
// legacy queue when present, otherwise empty Maps (still triggers a resolver rebuild).
// (nativewind 4.2.4 + interop 0.2.4 are the latest and don't support metro 0.84.)
const DependencyGraph = require(
  path.join(__dirname, "node_modules/metro/src/node-haste/DependencyGraph.js"),
).default;
const originalOnHasteChange = DependencyGraph.prototype._onHasteChange;
DependencyGraph.prototype._onHasteChange = function (event) {
  if (!event || !event.changes) {
    const queue = event && event.eventsQueue;
    event = {
      changes: {
        addedFiles: new Map(),
        modifiedFiles: new Map(
          Array.isArray(queue) ? queue.map((e) => [e.filePath, e.metadata]) : [],
        ),
        removedFiles: new Map(),
      },
      rootDir: (event && event.rootDir) || "",
    };
  }
  return originalOnHasteChange.call(this, event);
};

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
