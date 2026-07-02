import { describe, expect, it } from "vitest";
import { getGuardrailConfig } from "../src/lib/guardrails/config";
import { isSafeExternalHref } from "../src/lib/security/links";
import { validateFetchUrl } from "../src/lib/security/url";
import { validateUploadCandidate } from "../src/lib/security/uploads";

describe("security guardrails", () => {
  it("blocks unsafe URL schemes and private hosts", async () => {
    await expect(validateFetchUrl("javascript:alert(1)")).resolves.toMatchObject({
      ok: false,
    });
    await expect(validateFetchUrl("http://127.0.0.1:3000/admin")).resolves.toMatchObject({
      ok: false,
    });
  });

  it("allows safe markdown links and rejects script links", () => {
    expect(isSafeExternalHref("https://example.com/report")).toBe(true);
    expect(isSafeExternalHref("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalHref("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("enforces upload MIME and size limits", () => {
    const config = getGuardrailConfig();

    expect(
      validateUploadCandidate(
        { name: "resume.pdf", sizeBytes: 1024, mimeType: "application/pdf" },
        config,
      ),
    ).toMatchObject({ ok: true });
    expect(
      validateUploadCandidate(
        { name: "evil.exe", sizeBytes: 1024, mimeType: "application/x-msdownload" },
        config,
      ),
    ).toMatchObject({ ok: false });
  });
});

