import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canManageAdmins,
  isAdminRole,
  parseAdminUser,
} from "./roles.ts";

describe("admin role helpers", () => {
  it("accepts only supported admin roles", () => {
    assert.equal(isAdminRole("admin"), true);
    assert.equal(isAdminRole("super_admin"), true);
    assert.equal(isAdminRole("member"), false);
    assert.equal(isAdminRole(""), false);
  });

  it("parses active admin rows", () => {
    const parsed = parseAdminUser({
      created_at: "2026-06-29T00:00:00Z",
      email: "Admin@EliteGold.com",
      id: "role-id",
      is_active: true,
      role: "super_admin",
      user_id: "user-id",
    });

    assert.deepEqual(parsed, {
      createdAt: "2026-06-29T00:00:00Z",
      email: "admin@elitegold.com",
      id: "role-id",
      isActive: true,
      role: "super_admin",
      userId: "user-id",
    });
  });

  it("allows only super admins to manage admin users", () => {
    assert.equal(canManageAdmins("super_admin"), true);
    assert.equal(canManageAdmins("admin"), false);
    assert.equal(canManageAdmins(null), false);
  });
});
