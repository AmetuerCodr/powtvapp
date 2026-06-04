const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// --- metro 0.84 compatibility shim for nativewind / react-native-css-interop ---
// On CSS hot-reload, react-native-css-interop emits the LEGACY haste-change
// shape `{ eventsQueue: [...] }`, but metro 0.84 expects
// `{ changes: { addedFiles, modifiedFiles, removedFiles }, rootDir }`.
// Mismatch => crash: "Cannot read properties of undefined (reading 'addedFiles')".
// Adapt the legacy shape here; let every other event pass through untouched.
// (nativewind 4.2.4 + interop 0.2.4 are the latest and don't support metro 0.84.)
const DependencyGraph = require(
  path.join(__dirname, "node_modules/metro/src/node-haste/DependencyGraph.js"),
).default;
const originalOnHasteChange = DependencyGraph.prototype._onHasteChange;
DependencyGraph.prototype._onHasteChange = function (event) {
  if (event && event.eventsQueue && !event.changes) {
    event = {
      changes: {
        addedFiles: new Map(),
        modifiedFiles: new Map(
          event.eventsQueue.map((e) => [e.filePath, e.metadata]),
        ),
        removedFiles: new Map(),
      },
      rootDir: "",
    };
  }
  return originalOnHasteChange.call(this, event);
};

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
