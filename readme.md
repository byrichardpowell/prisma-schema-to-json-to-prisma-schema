# Readme

## What is this?

A proof of concept to convert a `schema.prisma` file to JSON and back. If the concept was proven, you could convert `schema.prisma` to `JSON`, then back to `schema.prisma` ending with output that matches the input.

## Why does this matter?

In theory, an application could provide a UI for creating and editing a `schema.prisma` file. The UI would deal with `JSON`. The Backend would parse that `JSON` to a `schema.prisma`, and then run `prisma generate` to create the database.

## How to run this

```
yarn install
yarn run parse
```

The output will be in `./json-to-schema`. As you can see, there are some problems (see is the concept proven).

## Is the concept proven?

Partially. To convert `schema.prisma` to `JSON` we use [prisma-json-schema-generator](https://github.com/valentinpalkovic/prisma-json-schema-generator). Unfortunately this skips vital information such as `@id @default(autoincrement())` (Everything after @). Without this information, we can not generate a valid `schema.prisma`.

This is a very solveable problem though. We could extend [prisma-json-schema-generator](https://github.com/valentinpalkovic/prisma-json-schema-generator)
