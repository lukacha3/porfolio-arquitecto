import { sanityClient } from 'sanity:client';

export interface SanityDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SanityCoverImage {
  alt?: string | null;
  asset: {
    _ref: string;
    _type?: string;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  } | null;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
  dimensions?: SanityDimensions | null;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: string;
}

export interface SanityProject {
  _id: string;
  title: string;
  slug: string;
  year?: number | null;
  category?: {
    title: string;
    slug: string;
  } | null;
  coverImage: SanityCoverImage;
}

export interface SanitySiteSettings {
  studioName?: string | null;
  headline?: string | null;
  about?: string | null;
  services?: string[] | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  featuredProject?: SanityProject | null;
}

export const PROJECTS_QUERY = `*[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))] | order(defined(order) desc, order asc, year desc) {
  _id,
  title,
  "slug": slug.current,
  year,
  "category": category->{
    title,
    "slug": slug.current
  },
  coverImage {
    alt,
    asset,
    hotspot,
    crop,
    "dimensions": asset->metadata.dimensions {
      width,
      height,
      aspectRatio
    }
  }
}`;

export const CATEGORIES_QUERY = `*[_type == "category" && defined(slug.current) && count(*[_type == "project" && references(^._id) && !(_id in path("drafts.**"))]) > 0] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0] {
  studioName,
  headline,
  about,
  services,
  email,
  instagram,
  linkedin,
  featuredProject-> {
    _id,
    title,
    "slug": slug.current,
    year,
    "category": category->{
      title,
      "slug": slug.current
    },
    coverImage {
      alt,
      asset,
      hotspot,
      crop,
      "dimensions": asset->metadata.dimensions {
        width,
        height,
        aspectRatio
      }
    }
  }
}`;

function checkEnv(): void {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    const missing: string[] = [];
    if (!projectId) missing.push('PUBLIC_SANITY_PROJECT_ID');
    if (!dataset) missing.push('PUBLIC_SANITY_DATASET');
    throw new Error(
      `[Sanity] Saknar miljövariabler: ${missing.join(', ')}. Kontrollera din .env eller GitHub Actions repository variables.`
    );
  }
}

export async function getProjects(): Promise<SanityProject[]> {
  checkEnv();
  try {
    return await sanityClient.fetch<SanityProject[]>(PROJECTS_QUERY);
  } catch (error) {
    throw new Error(
      `[Sanity] Fel vid hämtning av projekt (PROJECTS_QUERY): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getCategories(): Promise<SanityCategory[]> {
  checkEnv();
  try {
    return await sanityClient.fetch<SanityCategory[]>(CATEGORIES_QUERY);
  } catch (error) {
    throw new Error(
      `[Sanity] Fel vid hämtning av kategorier (CATEGORIES_QUERY): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  checkEnv();
  try {
    return await sanityClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS_QUERY);
  } catch (error) {
    throw new Error(
      `[Sanity] Fel vid hämtning av webbplatsinställningar (SITE_SETTINGS_QUERY): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
