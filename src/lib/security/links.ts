const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function isSafeExternalHref(href: string) {
  try {
    const url = new URL(href, "https://local.invalid");
    return ALLOWED_LINK_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function visibleDomain(href: string) {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

