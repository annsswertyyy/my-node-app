require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

(async () => {
    console.log('=== Подключение к MongoDB ===');
    const cli = new MongoClient(uri);

    try {
        await cli.connect();
        console.log(' Подключение установлено');

        const admin = cli.db('admin');
        const info = await admin.command({ buildInfo: 1 });
        console.log('Версия MongoDB: ' + info.version);
        console.log('База данных: ' + dbName);

        const db = cli.db(dbName);
        await db.command({ ping: 1 });
        console.log(' ping OK');

        const dbs = await admin.command({ listDatabases: 1 });
        console.log('\n=== Список БД ===');
        dbs.databases.forEach(d => console.log(' - ' + d.name));

        const cols = await db.listCollections().toArray();
        console.log('\nКоллекции: ' + (cols.length ? cols.map(c => c.name).join(', ') : '(пусто)'));

        console.log('\n=== Heartbeat ===');
        cli.on('serverHeartbeatSucceeded', () => {
            console.log('[HEARTBEAT] Успешно: ' + new Date().toISOString());
        });
        cli.on('serverHeartbeatFailed', (e) => {
            console.log('[HEARTBEAT] Ошибка: ' + e.failure.message);
        });

        await new Promise(r => setTimeout(r, 3000));
        console.log('\n Соединение стабильно');
    } catch (e) {
        console.error(' Ошибка: ' + e.message);
    } finally {
        await cli.close();
        console.log(' Соединение закрыто');
    }
})();