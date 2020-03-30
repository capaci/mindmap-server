'use strict'

const Mindmap = use('App/Models/Mindmap')
const Node = use('App/Models/Node')
const Logger = use('Logger')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with mindmaps
 */
class MindmapController {
  /**
   * Show a list of all mindmaps.
   * GET mindmaps
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ auth, request, response, view }) {
    const mindmaps = Mindmap
      .query()
      .where('user_id', auth.user.id)
      .with('nodes', (builder) => {
        builder.where('parent_id', null)
      })
      .fetch()

    return mindmaps
  }

  /**
   * Create/save a new mindmap.
   * POST mindmaps
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ auth, request, response }) {
    const data = request.only(["title"])

    const mindmap = await Mindmap.create({ ...data, user_id: auth.user.id })

    await Node.create({ mindmap_id: mindmap.id })

    return { mindmap }
  }

  /**
   * Display a single mindmap.
   * GET mindmaps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ auth, params, request, response }) {
    try {
      const { id } = params
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id: id, user_id: auth.user.id })

      await mindmap.load('nodes')

      return mindmap
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }

  /**
   * Update mindmap details.
   * PUT or PATCH mindmaps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ auth, params, request, response }) {
    try {
      const { id } = params
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id: id, user_id: auth.user.id })

      const data = request.only([
        'title'
      ])

      mindmap.merge(data)

      await mindmap.save()

      return mindmap
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }


  /**
   * Delete a mindmap with id.
   * DELETE mindmaps/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ auth, params, response }) {
    try {
      const { id } = params
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id: id, user_id: auth.user.id })

      if (mindmap.user_id !== auth.user.id) {
        return response.status(401).send({ error: 'Not authorized' })
      }

      await mindmap.delete()

      return { deleted: true }
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }

  /**
   * Get a single mindmap for a user. If the mindmap not exists, or if the user is not the owner of it,
   * throw an error.
   *
   * @param {object} ctx
   * @param {Number} ctx.mindmap_id
   * @param {Number} ctx.user_id
   */
  async getUserMindmapOrThrowError({ mindmap_id, user_id }) {
    const mindmap = await Mindmap.query().where({ id: mindmap_id, user_id }).first()
    if (!mindmap) {
      throw new Error(`Mindmap of id ${mindmap_id} does not exists or does not belongs to user ${user_id}`)
    }

    return mindmap
  }
}

module.exports = MindmapController
