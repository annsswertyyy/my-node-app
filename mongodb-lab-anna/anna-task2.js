require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

(async () => {
    const cli = new MongoClient(process.env.MONGO_URI);
    await cli.connect();
    const db = cli.db(process.env.DB_NAME);
    const col = db.collection('students');

    await col.deleteMany({});
    await col.createIndex({ group_name: 1 });

    console.log('=== INSERT ===');
    const r1 = await col.insertOne({ name: 'Анна', group_name: 'ББМО-01-23', course: 2, grade: 4.5, created_at: new Date() });
    console.log(' insertedId=' + r1.insertedId);

    const r2 = await col.insertMany([
        { name: 'Иван', group_name: 'ББМО-01-23', course: 2, grade: 3.8, created_at: new Date() },
        { name: 'Петр', group_name: 'ББМО-01-23', course: 3, grade: 4.2, created_at: new Date() },
        { name: 'Мария', group_name: 'ББМО-02-23', course: 1, grade: 4.9, created_at: new Date() }
    ]);
    console.log(' insertedIds=' + Object.keys(r2.insertedIds).length);

    console.log('\n=== SELECT ===');
    const all = await col.find({}).toArray();
    all.forEach(s => console.log(' - ' + s.name + ', ' + s.group_name + ', ' + s.grade));

    console.log('\nФильтр по группе:');
    const f = await col.find({ group_name: 'ББМО-01-23' }).toArray();
    f.forEach(s => console.log(' - ' + s.name + ': ' + s.grade));

    console.log('\nПроекция (name, grade):');
    const p = await col.find({}, { projection: { name: 1, grade: 1, _id: 0 } }).toArray();
    p.forEach(s => console.log(' - ' + s.name + ': ' + s.grade));

    console.log('\n=== UPDATE ===');
    const u1 = await col.updateOne({ name: 'Анна' }, { $set: { grade: 5.0 } });
    console.log(' updateOne: matched=' + u1.matchedCount + ', modified=' + u1.modifiedCount);

    const u2 = await col.updateMany({ group_name: 'ББМО-01-23' }, { $inc: { course: 1 } });
    console.log(' updateMany: matched=' + u2.matchedCount + ', modified=' + u2.modifiedCount);

    console.log('\n=== DELETE ===');
    const d1 = await col.deleteOne({ name: 'Мария' });
    console.log(' deleteOne: deleted=' + d1.deletedCount);

    const d2 = await col.deleteMany({ grade: { $lt: 3 } });
    console.log(' deleteMany: deleted=' + d2.deletedCount);

    await cli.close();
})();