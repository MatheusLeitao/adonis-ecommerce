'use strict'

const Database = use('Database')

class OrderService {
    constructor(model, trx = null) {
        this.model = model
        this.trx = trx
    }

    async syncItems(items) {
        if (!Array.isArray(items)) return false;
        await this.model.items().delete(this.trx)
        await this.model.items().createMany(items, this.trx)
    }

    async updateItems(items) {
        if (!Array.isArray(items)) return false;
        let currentItems = await this.model.items().whereIn('id', items.map(item => item.id))
            .fetch(this.trx)

        await this.model.items().whereNotIn('id', items.map(items => item.id))
            .delete(this.trx)

        console.log(currentItems);
        await Promise.all(currentItems.rows.map(async item => {
            item.fill(item.find(n => n.id === item.id))
            await item.save(this.trx)
        }))

    }

    async canApplyDiscount(coupon) {
        const couponProducts = await Database.from('coupon_products').where('coupon_id', coupon.id).pluck('product_id')
        const couponClients = await Database.from('coupon_user').where('coupon_id', coupon.id).pluck('user_id')
        const now = new Date().getTime()

        if(now > coupon.valid_from.getTime() || (typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)) return false;

        /**
         * Rule below certifies that the coupon applied isn't associated to none rule, so you can use it freely.
         * Ex: if couponProduct > 1, it means that the coupon user sent, has its rules which must be followed
         */

        if (Array.isArray(couponProducts) && couponProducts.length < 1 && Array.isArray(couponClients) && couponClients.length < 1) return true;

        let isAssociatedToProducts = false, isAssociatedToClients = false

        if (Array.isArray(couponProducts) && couponProducts.length > 0) isAssociatedToProducts = true
        if (Array.isArray(couponClients) && couponClients.length > 0) isAssociatedToClients = true

        const productsMatch = await Database.from('order_items').where('order_id', this.model.id).whereIn('product_id', couponProducts).pluck('product_id')

        /**
         * In case where Coupon is associated to products and clients
         */

        if (isAssociatedToProducts && isAssociatedToClients) {
            const clientMatch = couponClients.find(client => client == this.model.user_id)
            if (clientMatch && Array.isArray(productsMatch) && productsMatch.length > 0) return true;
        }

        /**
         * In case where coupon is associated to products only.
         */

        if (isAssociatedToProducts && Array.isArray(productsMatch) && productsMatch.length > 0) return true;

        /**
         * In case where coupon is associated to one or many clients (none products)
         */

        if (isAssociatedToClients && Array.isArray(couponClients) && couponClients.length > 0) {
            const match = couponClients.find(client => client === this.model.user_id)
            if (match) return true
        }

        /**
         * In case none of the statements above is true, then either the client or product is not eligible.
         */


        return false;
    }
}


module.exports = OrderService