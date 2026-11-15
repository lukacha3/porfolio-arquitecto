import { defineArrayMember, defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { slugify } from '../slugify';

export const project = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  orderings: [
    {
      ...orderRankOrdering,
      title: 'Manuell ordning',
    },
  ],
  fields: [
    orderRankField({ type: 'project', newItemPosition: 'before' }),
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (Rule) => Rule.required().error('Projekttitel är obligatorisk'),
    }),
    defineField({
      name: 'slug',
      title: 'Webbadress',
      type: 'slug',
      options: {
        source: 'title',
        slugify,
      },
      validation: (Rule) => Rule.required().error('Webbadress är obligatorisk'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Omslagsbild',
      description: 'Huvudbilden som visas på startsidan och högst upp i projektet.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'caption',
          title: 'Beskrivning',
          description: 'Valfri kort text som visas under bilden.',
          type: 'string',
          validation: (Rule) =>
            Rule.max(200).error('Beskrivningen får vara högst 200 tecken'),
        }),
        defineField({
          name: 'alt',
          title: 'Alternativ text (alt)',
          description: 'Beskriver bilden för personer med synnedsättning eller när bilden inte kan laddas.',
          type: 'string',
        }),
      ],
      validation: (Rule) => Rule.required().error('Omslagsbild är obligatorisk'),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'year',
      title: 'År',
      type: 'number',
      validation: (Rule) =>
        Rule.integer()
          .min(1900)
          .max(2100)
          .error('Årtalet måste vara ett heltal mellan 1900 och 2100'),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivning',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'gallery',
      title: 'Bildgalleri',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'caption',
              title: 'Beskrivning',
              description: 'Valfri kort text som visas under bilden.',
              type: 'string',
              validation: (Rule) =>
                Rule.max(200).error('Beskrivningen får vara högst 200 tecken'),
            }),
            defineField({
              name: 'alt',
              title: 'Alternativ text (alt)',
              description: 'Beskriver bilden för personer med synnedsättning.',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'alt',
              media: 'asset',
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || subtitle || 'Bild',
                subtitle: title && subtitle ? subtitle : undefined,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'hasPlans',
      title: 'Visa planritningar',
      description: 'Aktivera för att lägga till planritningar i projektet.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'plans',
      title: 'Planritningar',
      type: 'array',
      hidden: ({ parent }) => !parent?.hasPlans,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { hasPlans?: boolean } | undefined;
          if (parent?.hasPlans && (!value || !Array.isArray(value) || value.length === 0)) {
            return 'Lägg till minst en planritning när "Visa planritningar" är aktiverat';
          }
          return true;
        }),
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Planritning',
          fields: [
            defineField({
              name: 'caption',
              title: 'Beskrivning',
              description: 'Kort text som visas under planritningen.',
              type: 'string',
              validation: (Rule) =>
                Rule.max(200).error('Beskrivningen får vara högst 200 tecken'),
            }),
            defineField({
              name: 'alt',
              title: 'Alternativ text (alt)',
              description: 'Beskriver bilden för personer med synnedsättning.',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'alt',
              media: 'asset',
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || subtitle || 'Planritning',
                subtitle: title && subtitle ? subtitle : undefined,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'photographer',
      title: 'Fotograf',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categoryTitle: 'category.title',
      year: 'year',
      media: 'coverImage',
    },
    prepare({ title, categoryTitle, year, media }) {
      const subtitle = [categoryTitle, year].filter(Boolean).join(' • ');
      return {
        title: title || 'Namnlöst projekt',
        subtitle,
        media,
      };
    },
  },
});
