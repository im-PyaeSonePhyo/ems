import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDaysRequested } from "../utils/leaveDays.js";

test("counts inclusive calendar days", () => {
  assert.equal(
    calculateDaysRequested("2026-07-10", "2026-07-12"),
    3
  );
});

test("subtracts half a day for start or end half-day", () => {
  assert.equal(
    calculateDaysRequested("2026-07-20", "2026-07-20", { type: "start" }),
    0.5
  );
});
