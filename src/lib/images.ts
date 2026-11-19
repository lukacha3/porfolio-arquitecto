import { urlFor } from './sanity';
import type { SanityCoverImage, SanityPlanImage } from './queries';

export interface ImageProps {
  src: string;
  srcset: string;
  lightboxSrc: string;
  lightboxSrcset: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
}

export function getImageProps(coverImage?: SanityCoverImage | SanityPlanImage | null): ImageProps | null {
  if (!coverImage || !coverImage.asset) {
    return null;
  }

  const width = coverImage.dimensions?.width ?? 1200;
  const height = coverImage.dimensions?.height ?? 800;

  const widths = [480, 800, 1200, 1600];
  const srcset = widths
    .map((w) => `${urlFor(coverImage).width(w).auto('format').quality(85).url()} ${w}w`)
    .join(', ');

  const src = urlFor(coverImage).width(1200).auto('format').quality(85).url();

  const lightboxWidths = [1200, 1800, 2400];
  const lightboxSrcset = lightboxWidths
    .map((w) => `${urlFor(coverImage).width(w).auto('format').quality(85).url()} ${w}w`)
    .join(', ');

  const lightboxSrc = urlFor(coverImage).width(2400).auto('format').quality(85).url();

  const hotspot = 'hotspot' in coverImage ? coverImage.hotspot : null;
  const objectPosition = hotspot
    ? `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`
    : '50% 50%';

  return {
    src,
    srcset,
    lightboxSrc,
    lightboxSrcset,
    width,
    height,
    objectPosition,
    alt: coverImage.alt || '',
  };
}
