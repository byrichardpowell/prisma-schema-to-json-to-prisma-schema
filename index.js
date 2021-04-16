"use strict";

const fs = require("fs");
const rawdata = fs.readFileSync("./schema-to-json/json-schema.json");
const schemaJSON = JSON.parse(rawdata);

const TYPE_MAP = {
    integer: 'Int',
    string: 'String',
    'date-time': 'DateTime',
    number: 'Float',
    boolean: 'Boolean',
    object: 'Json'
}

const getRef = ({$ref}) => {
    return $ref.split('/').pop()
}

let schemaPrismaArray = Object.entries(
  schemaJSON.definitions
).reduce((a, [model, {properties}]) => {

    a.push(`model ${model} {`)

    Object.entries(properties).forEach(([attributeName, config]) => {
        let type = '';

        if (config.format) {
            type = TYPE_MAP[config.format]
        } else if (config.type === 'array') {

            if (config.items['$ref']) {
                type = `${getRef(config.items)}[]`
            } else if (config.items.type) {
                type = `${TYPE_MAP[config.items.type]}[]`
            }

        } else if (config.anyOf) {

            type = config.anyOf.map((item) => {

                if (item.$ref) {
                    return getRef(item)
                }

                if (item.type === "null") {
                    return "?"
                }

                throw new Error(` Uncaught item ${JSON.stringify(item)} for ${attributeName}`)

            } ).join("")

        } else if (typeof config.type === 'string') {
            type = TYPE_MAP[config.type]
        } else if (config.type?.length) {
            type = TYPE_MAP[config.type[0]]

            if (config.type[1] === "null") {
                type += '?'
            } else {
                throw newErro(`Uncaught config.type[1] for ${attributName}, ${config.type[1]}`)
            }
        } else {
            throw new Error(` Uncaught type for ${attributeName}`)
        }
        
        a.push(`  ${attributeName}  ${type}`)
    })

    a.push("}\n\n")

    return a
}, []);

const newSchema = schemaPrismaArray.join('\n')

fs.writeFileSync('./json-to-schema/schema.prisma', newSchema)


