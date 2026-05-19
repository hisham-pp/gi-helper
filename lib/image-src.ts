export function localImageSrc(src: string) {
  if (!src.startsWith("/images/")) {
    return src;
  }

  return `/api/local-image/${src.slice("/images/".length)}`;
}
