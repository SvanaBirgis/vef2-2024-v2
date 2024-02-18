import { createSchema, insertDummyData, dropSchema, end } from './lib/db.js';

async function createDummyData() {
  const drop = await dropSchema();

  if (drop) {
    console.info('schema dropped');
  } else {
    console.info('schema not dropped, exiting');
    process.exit(-1);
  }

  const schemaResult = await createSchema();

  if (schemaResult) {
    console.info('schema created');
  } else {
    console.info('schema not created');
  }

  const insertResult = await insertDummyData();

  if (insertResult) {
    console.info('data inserted');
  } else {
    console.info('data not inserted');
  }

  await end();
}


async function main() {
  await createDummyData();
}


main().catch((e) => console.error(e));