import { sanityClient } from 'sanity:client';
import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { isPreview } from './preview';

export { sanityClient };

let previewClient: SanityClient | null = null;

export function getClient(): SanityClient {
  if (!isPreview) {
    return sanityClient;
  }

  if (!previewClient) {
    const projectId =
      import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
      (typeof process !== 'undefined' && process.env.PUBLIC_SANITY_PROJECT_ID);
    const dataset =
      import.meta.env.PUBLIC_SANITY_DATASET ||
      (typeof process !== 'undefined' && process.env.PUBLIC_SANITY_DATASET) ||
      'production';
    const token =
      import.meta.env.SANITY_API_READ_TOKEN ||
      (typeof process !== 'undefined' && process.env.SANITY_API_READ_TOKEN);

    if (!token) {
      throw new Error(
        'Missing required SANITY_API_READ_TOKEN in preview mode. Please set SANITY_API_READ_TOKEN in your .env file.'
      );
    }

    if (!projectId) {
      throw new Error(
        'Missing required PUBLIC_SANITY_PROJECT_ID. Please set PUBLIC_SANITY_PROJECT_ID in your .env file.'
      );
    }

    previewClient = createClient({
      projectId,
      dataset,
      apiVersion: '2025-02-19',
      useCdn: false,
      token,
      perspective: 'drafts',
    });
  }

  return previewClient;
}

export function urlFor(source: SanityImageSource) {
  const client = getClient();
  return createImageUrlBuilder(client).image(source);
}
