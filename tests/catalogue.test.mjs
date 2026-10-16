import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const products = read("../src/app/data/artceramic.json");
const registry = read("../src/app/data/sourceRegistry.json");
test("catalogue products have unique IDs, slugs and primary images", () => {
  assert.ok(products.length > 0);
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(new Set(products.map(p => p.slug)).size, products.length);
  for (const product of products) {
    assert.ok(product.name && product.size && product.image && Array.isArray(product.tiles));
    assert.ok(product.image.startsWith("https://"));
  }
});
test("40 tracked sources remain unique", () => {
  assert.equal(registry.sources.length, 40);
  assert.equal(new Set(registry.sources.map(s => s.source_id)).size, 40);
});
