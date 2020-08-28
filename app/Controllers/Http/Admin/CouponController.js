'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')
const Services = use('App/Services/Coupon/CouponService')
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {

    const code = request.input('code');
    const query = Coupon.query()

    console.log(code);
    if (code) query.where('code', 'LIKE', `%${code}%`)

    const { page, limit } = pagination
    const coupons = await query.paginate(page, limit);

    return response.send(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    /**
     * Rules settings to create a coupon.
     * 1 - Product: Coupon can only be used in a specific products.
     * 2 - Clients: Coupon can only be used from a specific clients
     * 3 - Clients & Products: Coupon can only be used by specific clients and products
     * 4 - No rule, anyone can use it.
     */

    const trx = Database.beginTransaction()

    var canUseFor = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type'
      ])

      const { users, products } = request.only(['users', 'products'])
      const coupon = await Coupon.create(couponData, trx)

      // Service Layer starts
      const service = new Services(coupon, trx)
      // DB Relations insetion

      if (users && users.length > 0) {
        await service.syncUsers(users)
        canUseFor.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        canUseFor.product = true
      }

      if (canUseFor.product && canUseFor.client) coupon.can_use_for = 'product_client'
      else if (canUseFor.product && !canUseFor.client) coupon.can_use_for = 'product'
      else if (!canUseFor.product && canUseFor.client) coupon.can_use_for = 'client'
      else coupon.can_use_for = 'all'

      await coupon.save(trx)
      await trx.commit()
      return response.status(201).send(coupon)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Couldn\'t create selected coupon.' })
    }

  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {
    const coupon = await Coupon.findOrFail(id)
    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {

    var coupon = await Coupon.findOrFail(id)

    const trx = Database.beginTransaction()

    var canUseFor = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type'
      ])

      coupon.merge(couponData)

      const { users, products } = request.only(['users', 'products'])
      // Service Layer starts
      const service = new Services(coupon, trx)
      // DB Relations insetion

      if (users && users.length > 0) {
        await service.syncUsers(users)
        canUseFor.client = true
      }

      if (products && products.length > 0) {
        await service.syncProducts(products)
        canUseFor.product = true
      }

      if (canUseFor.product && canUseFor.client) coupon.can_use_for = 'product_client'
      else if (canUseFor.product && !canUseFor.client) coupon.can_use_for = 'product'
      else if (!canUseFor.product && canUseFor.client) coupon.can_use_for = 'client'
      else coupon.can_use_for = 'all'

      await coupon.save(trx)
      await trx.commit()
      return response.status(200).send(coupon)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Couldn\'t edit selected coupon.' })
    }


  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const coupon = await Coupon.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit()
      return response.status(204).send()

    } catch (error) {
      await trx.rollback()
      return response.status(404).send({ message: 'Couldn\'t delete selected coupon.' })
    }
  }
}

module.exports = CouponController
