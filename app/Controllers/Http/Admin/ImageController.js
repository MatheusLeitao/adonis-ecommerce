'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image')
const { manageSingleUploads, manageMultiplesUploads } = use('App/Helpers')
const fs = use('fs')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { page, limit } = pagination
    const images = await Image.query().orderBy('id', 'DESC').paginate(page, limit)
    return response.send(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      let images = [];
      // Single file handler
      if (!fileJar.files) {
        const file = await manageSingleUploads(fileJar)

        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
          return response.status(201).send({ successes: images, errors: {} })

        }

        return response.status(400).send({
          message: 'Não foi possível enviar imagem'
        })
      }

      let files = await manageMultiplesUploads(fileJar)
      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
        })
      )

      return response.status(201).send({ successes: images, errors: files.errors })
    } catch (error) {
      return response.status(400).send({ message: 'Couldn\'t process your solicitation' })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, request, response, view }) {
    const image = await Image.findOrFail(id)
    return response.send(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const image = Image.findOrFail(id)

    try {
      image.merge(request.only(['original_name']))
      await image.save()
      return response.status(200).send(image)
    } catch (error) {
      return response.status(400).send({
        message: 'Couldn\'t update selected image'
      })
    }

  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const image = Image.findOrFail(id)
    try {
      let filepath = Helpers.publicPath(`uploads/${image.path}`)
      fs.unlinkSync(filepath)
      await image.delete()
    } catch (error) {
      return response.status(400).send({ message: 'Couldn\'t delete selected image' })
    }
  }
}

module.exports = ImageController
