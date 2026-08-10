import { test } from "node:test";
import assert from "node:assert/strict";

function makeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

async function load() {
  const { migrateKey } = await import("./storage.ts");
  return migrateKey;
}

test("copies the old value to the new key and clears the old", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({ "devup.path.v1": '{"stage":2}' });
  migrateKey("devup.path.v1", "hfph.path.v1");
  assert.equal(localStorage.getItem("hfph.path.v1"), '{"stage":2}');
  assert.equal(localStorage.getItem("devup.path.v1"), null);
});

test("never overwrites an existing new-key value", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({
    "devup.labs.v1": "old",
    "hfph.labs.v1": "current",
  });
  migrateKey("devup.labs.v1", "hfph.labs.v1");
  assert.equal(localStorage.getItem("hfph.labs.v1"), "current");
});

test("copies malformed values verbatim without parsing or throwing", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({ "devup.labs.v1": "{not json" });
  assert.doesNotThrow(() => migrateKey("devup.labs.v1", "hfph.labs.v1"));
  assert.equal(localStorage.getItem("hfph.labs.v1"), "{not json");
});

test("no-ops when the old key is absent", async () => {
  const migrateKey = await load();
  globalThis.localStorage = makeStorage({});
  migrateKey("devup.path.v1", "hfph.path.v1");
  assert.equal(localStorage.getItem("hfph.path.v1"), null);
});

test("swallows a throwing storage rather than breaking render", async () => {
  const migrateKey = await load();
  globalThis.localStorage = {
    getItem() { throw new DOMException("denied", "SecurityError"); },
    setItem() {},
    removeItem() {},
  };
  assert.doesNotThrow(() => migrateKey("devup.path.v1", "hfph.path.v1"));
});
