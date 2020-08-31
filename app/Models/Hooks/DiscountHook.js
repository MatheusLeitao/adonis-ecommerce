'use strict'

const DiscountHook = exports = module.exports = {}
const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')
const Database = use('Database')


DiscountHook.calculateValues = async model => {
    var couponProducts, discountItems = []
    model.discount = 0
    const coupon = await Coupon.find(model.coupon_id)
    const order = await Order.find(model.coupon_id)

    switch (coupon.can_use_for) {
        case 'product':
        case 'product_client':
            couponProducts = await Database.from('coupon_product').where('coupon_id', model.coupon_id).pluck('product_id')
            discountItems = await Database.from('order_items').where('order_id', model.order_id).whereIn('product_id', couponProducts)
            if (coupon.type == 'percent') {
                for (let orderItem of discountItems)
                    model.discount += (orderItem.subtotal / 100 * coupon.discount)
            } else if (coupon.type == 'currency') {
                for (let orderItem of discountItems)
                    model.discount += (coupon.discount * orderItem.quantity)
            } else {
                for (let orderItem of discountItems)
                    model.discount += (orderItem.subtotal)
            }
            break;

        default:
            // Client || all
            if (coupon.type == 'percent') model.discout = (order.subtotal / 100 * coupon.discount)
            else if (coupon.type == 'currency') model.discount = (coupon.discount * orderItem.quantity)
            else model.discount = (orderItem.subtotal)
            break;
    }
    return model
}

// Decrements coupons quantity when someone applies it.
DiscountHook.decrementCoupons = async model => {
    const query = Database.from('coupons')
    if (model.$transaction) query.transactiong(model.$transaction)

    await query.where('id', model.coupon_id).decrement('quantity', 1)
}

// Increments coupons quantity when someone delete it's use.
DiscountHook.incrementCoupons = async model => {
    const query = Database.from('coupons')
    if (model.$transaction) query.transactiong(model.$transaction)

    await query.where('id', model.coupon_id).increment('quantity', 1)
}