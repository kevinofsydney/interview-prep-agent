import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

function token(password = "change-me") {
  return createHash("sha256")
    .update(`interview-prep-agent:${password}`)
    .digest("hex");
}

describe("auth gate", () => {
  it("redirects unauthenticated app requests to login", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/admin"));

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows requests with a valid session cookie", async () => {
    const request = new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: `ipa_session=${token()}` },
    });

    const response = await proxy(request);

    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(response.status).toBe(200);
  });
});

