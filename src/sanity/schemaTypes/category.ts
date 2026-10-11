import { defineField, defineType } from 'sanity';
import { slugify } from '../slugify';

export const category = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Namn',
      type: 'string',
      validation: (Rule) => Rule.required().error('Kategorinamn är obligatoriskt'),
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
  ],
});
