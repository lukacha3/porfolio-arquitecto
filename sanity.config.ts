import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';

const projectId =
  (typeof process !== 'undefined' && process.env?.PUBLIC_SANITY_PROJECT_ID) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_PROJECT_ID) ||
  '';

const dataset =
  (typeof process !== 'undefined' && process.env?.PUBLIC_SANITY_DATASET) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SANITY_DATASET) ||
  'production';

// Actions permitted on the singleton document
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);
const singletonTypes = new Set(['siteSettings']);

export default defineConfig({
  name: 'default',
  title: 'Pedro Forsberg Arkitekt',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Innehåll')
          .items([
            // Singleton item for siteSettings
            S.listItem()
              .title('Webbplatsinställningar')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Webbplatsinställningar')
              ),
            S.divider(),
            // Regular document types
            S.documentTypeListItem('project').title('Projekt'),
            S.documentTypeListItem('category').title('Kategorier'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Filter out singleton types from the global "create new document" list
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // For singleton types, filter out actions like duplicate, delete
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
