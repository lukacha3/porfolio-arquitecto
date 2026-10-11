import { defineArrayMember, defineField, defineType } from 'sanity';
import { slugify } from '../slugify';

export const project = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  orderings: [
    {
      title: 'Ordning (stigande)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  fields: [
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
              name: 'alt',
              title: 'Alternativ text (alt)',
              description: 'Beskriver bilden för personer med synnedsättning.',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'photographer',
      title: 'Fotograf',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Ordning',
      description: 'Ett lägre nummer visas först i projektlistan.',
      type: 'number',
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
