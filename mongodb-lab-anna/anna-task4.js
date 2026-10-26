require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
    const cli = new MongoClient(process.env.MONGO_URI);
    await cli.connect();
    const db = cli.db(process.env.DB_NAME);
    const col = db.collection('students');

    await col.deleteMany({});

    console.log('=== Транзакция (успех) ===');
    const s1 = cli.startSession();
    try {
        s1.startTransaction();
        console.log('[BEGIN]');
        await col.insertOne({ name: 'Анна', group_name: 'ББМО-01-23', grade: 4.5 }, { session: s1 });
        await col.insertOne({ name: 'Иван', group_name: 'ББМО-01-23', grade: 3.8 }, { session: s1 });
        await col.updateOne({ name: 'Анна' }, { $set: { grade: 4.8 } }, { session: s1 });
        await s1.commitTransaction();
        console.log('[COMMIT] ✔ Данные сохранены');
    } catch (e) {
        await s1.abortTransaction();
        console.log('[ABORT] ' + e.message);
    } finally {
        await s1.endSession();
    }

    console.log('\n=== Транзакция (откат) ===');
    const s2 = cli.startSession();
    try {
        s2.startTransaction();
        console.log('[BEGIN]');
        await col.insertOne({ _id: 'fixed', name: 'Петр', group_name: 'ББМО-01-23' }, { session: s2 });
        await col.insertOne({ _id: 'fixed', name: 'Дубль', group_name: 'ББМО-01-23' }, { session: s2 });
        await s2.commitTransaction();
        console.log('[COMMIT]');
    } catch (e) {
        await s2.abortTransaction();
        console.log('[ABORT] ' + e.message);
    } finally {
        await s2.endSession();
    }

    const total = await col.countDocuments();
    console.log('Проверка: студентов = ' + total);

    console.log('\n=== Change Streams ===');
    const stream = col.watch();
    console.log('[WATCH]');
    stream.on('change', (c) => {
        console.log('[CHANGE] ' + c.operationType + ': ' + JSON.stringify(c.fullDocument || c.documentKey));
    });

    await col.insertOne({ name: 'Тест', group_name: 'ББМО-01-23', grade: 4.0 });
    await new Promise(r => setTimeout(r, 500));
    await col.updateOne({ name: 'Тест' }, { $set: { grade: 5.0 } });
    await new Promise(r => setTimeout(r, 500));
    await col.deleteOne({ name: 'Тест' });
    await new Promise(r => setTimeout(r, 1000));

    await stream.close();
    console.log('[WATCH] Закрыт');

    await cli.close();
})();