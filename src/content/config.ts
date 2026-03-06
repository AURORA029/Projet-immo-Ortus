import { defineCollection, z } from 'astro:content';

const actualitesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titre: z.string(),
    date: z.date(),
    image: z.string().optional(),
    extrait: z.string(),
  }),
});

export const collections = {
  'actualites': actualitesCollection,
};