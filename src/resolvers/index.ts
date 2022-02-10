import * as avo from './avocado.resolver';
import * as scalars from './scalars.resolver';

export default {
  ...scalars,
  Query: {
    avo: avo.findOne,
    avos: avo.findAll,
  },
  Mutation: {
    createAvo: avo.createAvo,
  },
  Avocado: avo.resolver,
};
