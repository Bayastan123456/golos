import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL не задан');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const words = [
  {
    word: 'Лаконичный',
    meaning: 'Краткий, но ясный и содержательный.',
    example: 'Он дал лаконичный ответ.',
  },
  {
    word: 'Убедительный',
    meaning: 'Способный заставить поверить или согласиться.',
    example: 'Он привёл убедительные аргументы.',
  },
  {
    word: 'Нюанс',
    meaning: 'Небольшая, но важная особенность.',
    example: 'Есть один нюанс в этом решении.',
  },
  {
    word: 'Осмысленный',
    meaning: 'Имеющий понятный смысл и продуманную цель.',
    example: 'Это было осмысленное решение.',
  },
  {
    word: 'Последовательный',
    meaning: 'Логичный, соблюдающий определённый порядок.',
    example: 'Его рассказ был последовательным.',
  },
];

async function main() {
  for (const word of words) {
    await prisma.vocabularyWord.upsert({
      where: { word: word.word },
      update: {
        meaning: word.meaning,
        example: word.example,
      },
      create: word,
    });
  }

  console.log(`Готово! Добавлено или обновлено ${words.length} слов.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
