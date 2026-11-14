const { ObjectId } = require('mongodb');

class User {
    constructor(db) {
        this.col = db.collection('users');
    }
    async findAll() { return await this.col.find({}).toArray(); }
    async findById(id) { return await this.col.findOne({ _id: new ObjectId(id) }); }
    async findByEmail(email) { return await this.col.findOne({ email }); }
    async create(d) {
        const r = await this.col.insertOne({ ...d, created_at: new Date() });
        return { _id: r.insertedId, ...d };
    }
    async update(id, d) {
        await this.col.updateOne({ _id: new ObjectId(id) }, { $set: d });
        return this.findById(id);
    }
    async delete(id) { return await this.col.deleteOne({ _id: new ObjectId(id) }); }
}
module.exports = User;