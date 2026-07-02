"use client";

import ReactMarkdown from "react-markdown";
import { isSafeExternalHref, visibleDomain } from "@/lib/security/links";

const allowedElements = [
  "a",
  "blockquote",
  "code",
  "em",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
];

export function SafeMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowedElements={allowedElements}
      unwrapDisallowed
      components={{
        a: ({ href = "", children: linkChildren }) => {
          if (!isSafeExternalHref(href)) {
            return <span>{linkChildren}</span>;
          }

          const domain = visibleDomain(href);

          return (
            <a
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-[#175a63] underline decoration-[#9bbfc3] underline-offset-4"
            >
              {linkChildren}
              {domain ? <span className="sr-only"> ({domain})</span> : null}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

