import { defineArrayMember, defineField, defineType } from 'sanity';

const TOOL_OPTIONS = [
  { title: 'Revit', value: 'Revit' },
  { title: 'AutoCAD', value: 'AutoCAD' },
  { title: 'Archicad', value: 'Archicad' },
  { title: 'Lumion', value: 'Lumion' },
  { title: 'Blender', value: 'Blender' },
];

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Webbplatsinställningar',
  type: 'document',
  fieldsets: [
    {
      name: 'omMig',
      title: 'Om mig',
      description: 'Innehåll som visas överst på startsidan (rubrik, presentation, verktyg och porträtt).',
      options: { collapsible: false },
    },
  ],
  fields: [
    defineField({
      name: 'studioName',
      title: 'Studionamn',
      type: 'string',
      initialValue: 'Pedro Forsberg Arkitekt',
    }),
    defineField({
      name: 'headline',
      title: 'Rubrik',
      description: 'Huvudrubrik (H1) som visas överst i Om mig-sektionen.',
      type: 'string',
      fieldset: 'omMig',
      initialValue: 'Byggnader som växer ur platsen.',
    }),
    defineField({
      name: 'aboutText',
      title: 'Om mig',
      description: 'Fri text om arkitekten (stöder stycken, fetstil, kursiv och länkar).',
      type: 'array',
      fieldset: 'omMig',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Fet', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Länk',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }).error('Ange en giltig webbadress (http/https/mailto/tel)'),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'portrait',
      title: 'Porträtt',
      description: 'Porträttbild av arkitekten som visas i högerkolumnen på startsidan.',
      type: 'image',
      fieldset: 'omMig',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ text (alt)',
          description: 'Beskriver bilden för personer med synnedsättning (obligatoriskt om bild laddas upp).',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((alt, context) => {
              const parent = context.parent as { asset?: { _ref?: string } } | undefined;
              if (parent?.asset?._ref && (!alt || !String(alt).trim())) {
                return 'Alternativ text (alt) är obligatorisk när en porträttbild har valts';
              }
              return true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'education',
      title: 'Utbildning',
      description: 'Lägg till din utbildning. Dra för att ändra ordningen.',
      type: 'array',
      fieldset: 'omMig',
      options: {
        sortable: true,
      },
      of: [
        defineArrayMember({
          type: 'object',
          name: 'educationItem',
          title: 'Utbildning',
          fields: [
            defineField({
              name: 'degree',
              title: 'Examen / titel',
              type: 'string',
              validation: (Rule) => Rule.required().error('Examen / titel är obligatorisk'),
            }),
            defineField({
              name: 'institution',
              title: 'Lärosäte',
              type: 'string',
            }),
            defineField({
              name: 'years',
              title: 'År',
              type: 'string',
            }),
            defineField({
              name: 'logo',
              title: 'Logotyp',
              description: 'Helst en PNG, WebP eller SVG med transparent bakgrund.',
              type: 'image',
              options: {
                accept: 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif',
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alternativ text (alt)',
                  description: 'Om fältet lämnas tomt används lärosätets namn.',
                  type: 'string',
                }),
              ],
            }),
          ],
          preview: {
            select: {
              degree: 'degree',
              institution: 'institution',
              years: 'years',
              media: 'logo',
            },
            prepare({ degree, institution, years, media }) {
              const subtitle = [institution, years].filter(Boolean).join(' · ');
              return {
                title: degree || 'Utbildning',
                subtitle: subtitle || undefined,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'tools',
      title: 'Verktyg',
      description: 'Välj vilka program/verktyg som ska visas och dra för att ändra ordning.',
      type: 'array',
      fieldset: 'omMig',
      of: [
        defineArrayMember({
          type: 'string',
          options: {
            list: TOOL_OPTIONS,
          },
        }),
      ],
      options: {
        sortable: true,
      },
      validation: (Rule) => Rule.unique().error('Varje verktyg kan bara väljas en gång'),
      initialValue: ['Revit', 'AutoCAD', 'Archicad', 'Lumion', 'Blender'],
    }),
    defineField({
      name: 'about',
      title: 'Om studion',
      description: 'Lämna tomt för att dölja sektionen Studion på startsidan (visas om minst ett av fälten Om studion eller Tjänster är ifyllt).',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'services',
      title: 'Tjänster',
      description: 'Upp till 3 tjänster. Lämna tomt för att dölja om även Om studion är tomt.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.max(3).error('Max 3 tjänster tillåtna'),
    }),
    defineField({
      name: 'featuredProject',
      title: 'Huvudprojekt',
      type: 'reference',
      to: [{ type: 'project' }],
      hidden: true,
    }),
    defineField({
      name: 'email',
      title: 'E-post',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
          name: 'email',
          invert: false,
        }).error('Ogiltig e-postadress'),
      initialValue: 'hej@exempel.se',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'studioName',
    },
    prepare({ title }) {
      return {
        title: title || 'Webbplatsinställningar',
      };
    },
  },
});
