class UserService {
    constructor(model) { this.model = model; }

    async getAll() { return await this.model.findAll(); }

    async getById(id) {
        const u = await this.model.findById(id);
        if (!u) { const e = new Error('Не найден'); e.status = 404; throw e; }
        return u;
    }

    async create(d) {
        console.log('[SERVICE] Создание: ' + d.email);
        const ex = await this.model.findByEmail(d.email);
        if (ex) { const e = new Error('Email существует'); e.status = 409; throw e; }
        const u = await this.model.create(d);
        console.log('[SERVICE] Email отправлен: ' + d.email);
        return u;
    }

    async update(id, d) { return await this.model.update(id, d); }
    async delete(id) { return await this.model.delete(id); }
}
module.exports = UserService;