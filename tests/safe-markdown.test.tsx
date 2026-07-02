import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SafeMarkdown } from "../src/components/report/safe-markdown";

describe("SafeMarkdown", () => {
  it("removes unsafe links while preserving safe external links", () => {
    const html = renderToStaticMarkup(
      <SafeMarkdown>
        {"[bad](javascript:alert(1)) [good](https://example.com/report)"}
      </SafeMarkdown>,
    );

    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://example.com/report"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

