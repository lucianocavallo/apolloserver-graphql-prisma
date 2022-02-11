import type { Attributes, Avocado, PrismaClient, Prisma } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-express';

type ResolverContext = {
  orm: PrismaClient;
  user: Express.User | undefined;
};

export function findAll(
  parent: unknown,
  arg: { skip?: number; take?: number; where: Prisma.AvocadoWhereInput },
  context: ResolverContext
): Promise<Avocado[]> {
  try {
    return context.orm.avocado.findMany({
      include: { attributes: true },
      skip: arg.skip,
      take: arg.take,
      where: arg.where,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function findOne(
  parent: unknown,
  args: { id: string },
  context: ResolverContext
): Promise<Avocado | null> {
  return context.orm.avocado.findUnique({
    where: { id: parseInt(args.id) },
    include: { attributes: true },
  });
}

export const resolver: Record<
  keyof (Avocado & { attributes: Attributes }),
  (parent: Avocado & { attributes: Attributes }) => unknown
> = {
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
  { orm, user }: ResolverContext
): Promise<Avocado> {
  if (user === undefined) {
    throw new AuthenticationError('Unauthenticated request');
  }
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
