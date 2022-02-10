import { createHash } from 'crypto';
import { baseModelResolver } from '../base/base.resolver';
import type { Attributes, Avocado, PrismaClient } from '@prisma/client';

type ResolverContext = {
  orm: PrismaClient;
};

export function findAll(
  parent: unknown,
  arg: unknown,
  context: ResolverContext
): Promise<Avocado[]> {
  try {
    return context.orm.avocado.findMany();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// export function findOne(id: string): Avocado | null {
//   return avos[0];
// }

export const resolver: Record<
  keyof (Avocado & { attributes: Attributes }),
  (parent: Avocado & { attributes: Attributes }) => unknown
> = {
  ...baseModelResolver,
  id: (parent) => parent.id,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
  deletedAt: (parent) => parent.deletedAt,
  sku: (parent) => parent.sku,
  name: (parent) => parent.name,
  price: (parent) => parent.price,
  image: (parent) => parent.image,
  attributes: (parent) => ({
    description: parent.attributes.description,
    shape: parent.attributes.shape,
    hardiness: parent.attributes.hardiness,
    taste: parent.attributes.taste,
  }),
};

export function createAvo(
  parent: unknown,
  { data }: { data: Pick<Avocado, 'name' | 'price' | 'image'> & Attributes },
  { orm }: { orm: PrismaClient }
): Promise<Avocado> {
  const { name, price, image, ...attributes } = data;

  return orm.avocado.create({
    data: {
      name,
      price,
      image,
      sku: new Date().getTime().toString(),
      attributes: {
        create: {
          ...attributes,
        },
      },
    },
    include: { attributes: true },
  });
}
