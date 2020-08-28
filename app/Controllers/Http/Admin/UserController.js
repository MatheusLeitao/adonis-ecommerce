'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Users = use('App/Models/User')


class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */

  async index({ request, response, pagination }) {
    const name = request.input('name');
    const surname = request.input('surname');
    const email = request.input('email');
    const query = Users.query()

    console.log(name);
    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `${surname}`)
      query.orWhere('email', 'LIKE', `${email}`)
    }

    const { page, limit } = pagination
    const users = await query.paginate(page, limit);

    return response.send(users);
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const { name, surname, password, image_id, email } = request.all()
      if (!name) return response.status(400).send({ error: 'Name not specified' })
      if (!surname) return response.status(400).send({ error: 'Surname not specified' })
      if (!password) return response.status(400).send({ error: 'Password not specified' })
      if (!email) return response.status(400).send({ error: 'Email not specified' })

      const user = await Users.create({ name, surname, password, email, image_id })
      return response.status(201).send(user)
    } catch (error) {
      return response.status(400).send({
        error: 'Couldn\'t create user.'
      })

    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, response }) {
    const user = await Users.findOrFail(id)
    return response.send(user)
  }


  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const user = await Users.findOrFail(id)
    try {
      const { name, surname, password, image_id, email } = request.all();
      user.merge({ name, surname, password, image_id, email })
      await user.save()
      return response.send(user)
    } catch (error) {

    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params:{id}, request, response }) {
    const user = await Users.findOrFail(id)
    user.delete()
    return response.status(204).send()
  }
}

module.exports = UserController
