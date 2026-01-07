const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, removeAdditional: 'failing' });
const compiled = new WeakMap();

function getValidator(schema) {
  if (!compiled.has(schema)) {
    compiled.set(schema, ajv.compile(schema));
  }
  return compiled.get(schema);
}

function validate(schema, data) {
  const validator = getValidator(schema);
  const valid = validator(data);
  return { valid, errors: validator.errors ? [...validator.errors] : [] };
}

function formatErrors(errors = []) {
  return errors.map((err) => `${err.instancePath || err.schemaPath} ${err.message}`).join('; ');
}

module.exports = {
  validate,
  formatErrors
};
