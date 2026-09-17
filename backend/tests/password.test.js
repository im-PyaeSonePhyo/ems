import { test } from "node:test";
import assert from "node:assert/strict";
import { isStrongPassword } from "../utils/password.js";

test("requires uppercase and a special character", () => {
  assert.equal(isStrongPassword("Admin@123"), true);
  assert.equal(isStrongPassword("admin123"), false);
  assert.equal(isStrongPassword("Admin123"), false);
});
