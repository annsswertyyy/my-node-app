require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
    const cli = new MongoClient(process.env.MONGO_URI);
    await cli.connect();
    const db = cli.db(process.env.DB_NAME);
    const col = db.collection('students');

    console.log('=== Курсоры ===');
    const cur = col.find({});
    let cnt = 0;
    for await (const doc of cur) cnt++;
    console.log('for await: получено ' + cnt + ' документов');

    console.log('\n=== Агрегации ===');
    const avg = await col.aggregate([
        { $group: { _id: '$group_name', avgGrade: { $avg: '$grade' } } },
        { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Средний балл по группам:');
    avg.forEach(g => console.log(' - ' + g._id + ': ' + g.avgGrade.toFixed(2)));

    const byCourse = await col.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nПо курсам:');
    byCourse.forEach(c => console.log(' - ' + c._id + ': ' + c.count));

    console.log('\n=== Индексы ===');
    await col.createIndex({ group_name: 1 });
    console.log(' group_name_1');
    await col.createIndex({ group_name: 1, grade: -1 });
    console.log(' group_name_1_grade_-1');
    await col.createIndex({ name: 'text' });
    console.log(' name_text');

    console.log('\n=== explain без индекса ===');
    const e1 = await col.find({ name: 'Иван' }).explain('executionStats');
    console.log('time: ' + e1.executionStats.executionTimeMillis);
    console.log('docs: ' + e1.executionStats.totalDocsExamined);

    console.log('\n=== explain с текстовым индексом ===');
    const e2 = await col.find({ $text: { $search: 'Иван' } }).explain('executionStats');
    console.log('time: ' + e2.executionStats.executionTimeMillis);
    console.log('docs: ' + e2.executionStats.totalDocsExamined);

    console.log('\n=== Текстовый поиск ===');
    const found = await col.find({ $text: { $search: 'Иван' } }).toArray();
    console.log('Найдено: ' + found.length);

    await cli.close();
})();