import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Webbplatsinställningar',
  type: 'document',
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
      type: 'string',
      initialValue: 'Byggnader som växer ur platsen.',
    }),
    defineField({
      name: 'about',
      title: 'Om studion',
      type: 'text',
      rows: 4,
      initialValue:
        'Arkitektstudio som följer projektet hela vägen, från första skiss till byggledning. Färre gester, mer precision.',
    }),
    defineField({
      name: 'services',
      title: 'Tjänster',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.max(3).error('Max 3 tjänster tillåtna'),
      initialValue: ['Projektering', 'Byggledning', 'Interiör'],
    }),
    defineField({
      name: 'featuredProject',
      title: 'Huvudprojekt',
      type: 'reference',
      to: [{ type: 'project' }],
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
