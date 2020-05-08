import SimpleRecord, { SimpleRecordSchema } from './SimpleRecord';
import { isImmutable, denormalizeImmutable } from '../schemas/ImmutableUtils';
import * as schema from '../schema';
import { AbstractInstanceType, Schema } from '../types';

/** Represents data that should be deduped by specifying a primary key. */
export default abstract class Entity extends SimpleRecord {
  /**
   * A unique identifier for each Entity
   *
   * @param [parent] When normalizing, the object which included the entity
   * @param [key] When normalizing, the key where this entity was found
   */
  abstract pk(parent?: any, key?: string): string | undefined;

  /** Returns the globally unique identifier for the static Entity */
  static get key(): string {
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production' && this.name === '')
      throw new Error(
        'Entity classes without a name must define `static get key()`',
      );
    return this.name;
  }

  /** Defines indexes to enable lookup by */
  declare static indexes?: readonly string[];

  /**
   * A unique identifier for each Entity
   *
   * @param [value] POJO of the entity or subset used
   * @param [parent] When normalizing, the object which included the entity
   * @param [key] When normalizing, the key where this entity was found
   */
  static pk<T extends typeof Entity>(
    this: T,
    value: Partial<AbstractInstanceType<T>>,
    parent?: any,
    key?: string,
  ): string | undefined {
    return this.prototype.pk.call(value, parent, key) || key;
  }

  static normalize(
    input: any,
    parent: any,
    key: string | undefined,
    visit: Function,
    addEntity: Function,
    visitedEntities: Record<string, any>,
  ): any {
    // TODO: what's store needs to be a differing type from fromJS
    const processedEntity = this.fromJS(input, parent, key);
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const instanceSample = new (this as any)();
      const keysOfRecord = new Set(Object.keys(instanceSample));
      let [sameCount, diffCount] = [0, 0];
      let extraKey = false;
      for (const keyOfProps of this.keysDefined(processedEntity)) {
        if (keysOfRecord.has(keyOfProps)) {
          sameCount++;
        } else {
          diffCount++;
          extraKey = true;
        }
      }
      diffCount += keysOfRecord.size - sameCount;
      if (diffCount > sameCount && keysOfRecord.size && extraKey) {
        const error = new Error(
          `Attempted to initialize ${
            this.name
          } with substantially different than expected keys

  This is likely due to a malformed response.
  Try inspecting the network response or fetch() return value.

  Expected keys: ${Object.keys(instanceSample)}
  Value: ${JSON.stringify(this.toObjectDefined(processedEntity), null, 2)}`,
        );
        (error as any).status = 400;
        throw error;
      }
    }
    const id = processedEntity.pk(parent, key);
    if (id === undefined || id === '') {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        const error = new Error(
          `Missing usable resource key when normalizing response.

  This is likely due to a malformed response.
  Try inspecting the network response or fetch() return value.

  Entity: ${this.name}
  Value: ${input && JSON.stringify(input, null, 2)}
  `,
        );
        (error as any).status = 400;
        throw error;
      } else {
        throw new Error('undefined pk');
      }
    }
    const entityType = this.key;

    if (!(entityType in visitedEntities)) {
      visitedEntities[entityType] = {};
    }
    if (!(id in visitedEntities[entityType])) {
      visitedEntities[entityType][id] = [];
    }
    if (
      visitedEntities[entityType][id].some((entity: any) => entity === input)
    ) {
      return id;
    }
    visitedEntities[entityType][id].push(input);

    Object.keys(this.schema).forEach(key => {
      if (
        Object.hasOwnProperty.call(processedEntity, key) &&
        typeof processedEntity[key] === 'object'
      ) {
        const schema = this.schema[key];
        processedEntity[key] = visit(
          processedEntity[key],
          processedEntity,
          key,
          schema,
          addEntity,
          visitedEntities,
        );
      }
    });

    addEntity(this, processedEntity, processedEntity, parent, key);
    return id;
  }

  static denormalize<T extends typeof SimpleRecord>(
    this: T,
    entity: AbstractInstanceType<T>,
    unvisit: schema.UnvisitFunction,
  ): [AbstractInstanceType<T>, boolean] {
    if (isImmutable(entity)) {
      const [denormEntity, found] = denormalizeImmutable(
        this.schema,
        entity,
        unvisit,
      );
      return [this.fromJS(denormEntity.toObject()), found];
    }
    let found = true;
    const denormEntity = entity;

    Object.keys(this.schema).forEach(key => {
      const schema = this.schema[key];
      const [value, foundItem] = unvisit(entity[key], schema);
      if (!foundItem) {
        found = false;
      }
      if (this.hasDefined(entity, key as any) && denormEntity[key] !== value) {
        denormEntity[key] = value;
      }
    });

    return [denormEntity as any, found];
  }
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  // for those not using TypeScript this is a good catch to ensure they are defining
  // the abstract members
  Entity.fromJS = function fromJS<T extends typeof SimpleRecord>(
    this: T,
    props: Partial<AbstractInstanceType<T>>,
  ): AbstractInstanceType<T> {
    if ((this as any).prototype.pk === undefined)
      throw new Error('cannot construct on abstract types');
    return SimpleRecord.fromJS.call(this, props) as any;
  };
}

export type EntitySchema<E extends typeof SimpleRecord> = SimpleRecordSchema<E>;

export function isEntity(schema: Schema | null): schema is typeof Entity {
  return schema !== null && (schema as any).pk !== undefined;
}
