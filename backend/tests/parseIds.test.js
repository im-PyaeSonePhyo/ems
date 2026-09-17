import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIdList } from "../utils/parseIds.js";

test("parseIdList returns empty for missing values", () => {
  assert.deepEqual(parseIdList(undefined), []);
  assert.deepEqual(parseIdList(""), []);
});

test("parseIdList accepts arrays and JSON strings", () => {
  assert.deepEqual(parseIdList(["a", "b"]), ["a", "b"]);
  assert.deepEqual(parseIdList('["a","b"]'), ["a", "b"]);
});

test("parseIdList wraps a single id string", () => {
  assert.deepEqual(parseIdList("abc123"), ["abc123"]);
});
