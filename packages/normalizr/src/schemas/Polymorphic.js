import { isImmutable } from './ImmutableUtils';

export default class PolymorphicSchema {
  constructor(definition, schemaAttribute) {
    if (schemaAttribute) {
      this._schemaAttribute =
        typeof schemaAttribute === 'string'
          ? input => input[schemaAttribute]
          : schemaAttribute;
    }
    this.define(definition);
  }

  get isSingleSchema() {
    return !this._schemaAttribute;
  }

  define(definition) {
    this.schema = definition;
  }

  getSchemaAttribute(input, parent, key) {
    return !this.isSingleSchema && this._schemaAttribute(input, parent, key);
  }

  inferSchema(input, parent, key) {
    if (this.isSingleSchema) {
      return this.schema;
    }

    const attr = this.getSchemaAttribute(input, parent, key);
    return this.schema[attr];
  }

  normalizeValue(value, parent, key, visit, addEntity, visitedEntities) {
    const schema = this.inferSchema(value, parent, key);
    if (!schema) {
      if (process.env.NODE_ENV !== 'production') {
        const attr = this.getSchemaAttribute(value, parent, key);
        console.warn(
          `Schema attribute ${JSON.stringify(
            attr,
            undefined,
            2,
          )} is not expected.
Expected one of: ${Object.keys(this.schema)
            .map(k => `"${k}"`)
            .join(', ')}

Value: ${JSON.stringify(value, undefined, 2)}`,
        );
      }
      return value;
    }
    const normalizedValue = visit(
      value,
      parent,
      key,
      schema,
      addEntity,
      visitedEntities,
    );
    return this.isSingleSchema ||
      normalizedValue === undefined ||
      normalizedValue === null
      ? normalizedValue
      : {
          id: normalizedValue,
          schema: this.getSchemaAttribute(value, parent, key),
        };
  }

  denormalizeValue(value, unvisit) {
    if (value === undefined) {
      return [value, false, false];
    }
    const schemaKey = isImmutable(value) ? value.get('schema') : value.schema;
    if (!this.isSingleSchema && !schemaKey) {
      return [value, true, false];
    }
    const id = this.isSingleSchema
      ? undefined
      : isImmutable(value)
      ? value.get('id')
      : value.id;
    const schema = this.isSingleSchema ? this.schema : this.schema[schemaKey];
    return unvisit(id || value, schema);
  }
}
