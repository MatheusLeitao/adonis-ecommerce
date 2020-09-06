'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Products = use('App/Models/Product')
const Transformer = use('App/Transformers/Admin/ProductTransformer')


/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const name = request.input('name');
    const query = Products.query()

    console.log(name);
    if (name) query.where('name', 'LIKE', `%${name}%`)

    const { page, limit } = pagination
    var products = await query.paginate(page, limit);
    products = await transform.paginate(products, Transformer)
    return response.send(products);
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store({ request, response, transform }) {
    try {
      const { name, description, image_id, price } = request.all()
      if (!name) return response.status(400).send({ error: 'Name not specified' })
      if (!description) return response.status(400).send({ error: 'Description not specified' })
      if (!price) return response.status(400).send({ error: 'Price not specified' })

      var product = await Products.create({ name, description, image_id, price })
      product = await transform.item(product, Transformer)
      return response.status(201).send(product)
    } catch (error) {
      return response.status(400).send({
        error: 'Couldn\'t create product.'
      })

    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {View} ctx.view
   */
  async show({ params: { id }, response, transform }) {
    var product = await Products.findOrFail(id)
    product = await transform.item(product, Transformer)
    return response.send(product)
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {TransformWith} ctx.transform
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response, transofrm }) {

    var product = await Products.findOrFail(id);
    try {
      const { name, description, image_id, price } = request.all();
      product.merge({ name, description, image_id, price })
      await product.save()
      product = await transform.item(product, Transformer)
      return response.send(product)

    } catch (error) {
      return response.status(400).send({ error: 'Couldn\'t update product' })
    }

  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const product = await Products.findOrFail(id)
    await product.delete()
    return response.status(204).send();

  }
}

module.exports = ProductController
