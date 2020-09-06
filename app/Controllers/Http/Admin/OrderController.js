'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')
const Transformer = use('App/Transformers/Admin/OrderTransformer')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const { status, id } = request.only(['status', 'id'])
    const { page, limit } = pagination
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    }
    else if (status)
      query.where('status', status)
    else
      query.where('id', 'LIKE', `%${id}%`)


    var orders = await query.orderBy('id', 'DESC').paginate(page, limit)
    orders = await transform.paginate(orders, Transformer)
    return response.send(orders)
  }


  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      var order = await Order.create({ user_id, status }, trx)
      const service = new Service(order, trx)

      if (items && items.length > 0)
        await service.syncItems(items)

      await trx.commit()
      order = await transform.item(order, Transformer)
      return response.status(201).send(order)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Couldn\'t create order.' })

    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {View} ctx.view
   */
  async show({ params: { id }, response, transform }) {
    var order = Order.findOrFail(id)
    order = await transform.item(order, Transformer)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async update({ params: { id }, request, response, transform }) {
    var order = Order.findOrFail(id)
    const trx = Database.beginTransaction();
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      order = await transform.item(order, Transformer)
      return response.send(order)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Coundn\'t edit order.' })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const order = Order.findOrFail(id)
    const trx = Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()

    } catch (error) {
      trx.rollback()
      return response.status(400).send({ message: 'Couldn\'t delete selected order.' })
    }
  }

  /**
   * Apply discount when all prerequisites are fulfilled.
   *
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async applyDiscount({ params: { id }, request, response }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
    var discount, info = {}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()

      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        info.message = 'Coupon applied with success'
        info.success = true
      } else {
        info.message = 'Coupon couldn\'t be applied'
        info.success = false
      }

      return response.send({ order, info })
    } catch (error) {
      info.message = 'Coupon couldn\'t be applied try'
      info.success = false
      return response.status(400).send({ order, info })
    }
  }

  async removeDiscount({ params: { id }, request, response }) {
    const { discount_id } = request.all()
    const discount = Discount.findOrFail(discount_id)

    await discount.delete()
    return response.status(204).send()

  }

}

module.exports = OrderController
