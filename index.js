"use strict";

const fs = require("fs");
const { formatSchema } = require("@prisma/sdk");
const { schema: jsonSchema } = require("./output/schema.js");

const parseRelationship = (relation) => {
  if (!relation) {
    return "";
  }

  const parseRelationshipArg = (fields) => {
    return "[" + fields.join(",") + "]";
  };

  const relationName = relation.name ? `"${relation.name}"` : "";
  const prependRelationFields = relation.name ? ", " : "";
  const relationFields = relation.fields
    ? `${prependRelationFields}fields: ${parseRelationshipArg(
        relation.fields
      )}, `
    : "";
  const relationReferences = relation.references
    ? `references: ${parseRelationshipArg(relation.references)}`
    : "";

  return ` @relation(${relationName}${relationFields}${relationReferences})`;
};

const parseModelFields = (fields) => {
  return fields.map(
    ({
      name,
      type,
      list,
      required,
      isId,
      relation,
      unique: isUnique,
      ...rest
    }) => {
      const array = list ? "[]" : "";
      const optional = list ? "" : required ? "" : "?";
      const id = isId ? " @id" : "";
      const unique = isUnique ? " @unique" : "";
      const relationship = parseRelationship(relation);

      return `    ${name} ${type}${array}${optional}${id}${unique}${relationship}`;
    }
  );
};

const parseModels = (models) => {
  return models.reduce((a, { name, fields, ...rest }) => {
    return [...a, `model ${name} {`, ...parseModelFields(fields), "}", "", ""];
  }, []);
};

const parseEnumFields = (fields) => {
  return fields.map((field) => `  ${field}`);
};

const parseEnums = (enums) => {
  return enums.reduce((a, { name, fields }) => {
    return [...a, `enum ${name} {`, ...parseEnumFields(fields), "}"];
  }, []);
};

const prismaSchema = Object.entries(jsonSchema).reduce((a, [type, values]) => {
  
    if (type === "models") {
    return [...a, ...parseModels(values)];
  }

  if (type === "enums") {
    return [...a, ...parseEnums(values)];
  }

  return a;
}, []);

fs.writeFileSync("./output/schema.prisma", prismaSchema.join("\n"));
