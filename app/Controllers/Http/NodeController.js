'use strict'

const Logger = use('Logger')

const Mindmap = use('App/Models/Mindmap')
const Node = use('App/Models/Node')



/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with nodes
 */
class NodeController {
  /**
   * Show a list of all nodes.
   * GET nodes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index({ auth, request, response, params }) {
    try {
      const mindmap_id = params.mindmap_id
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id, user_id: auth.user.id })

      return await mindmap.nodes().fetch()
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }

  /**
   * Create/save a new node.
   * POST nodes
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ auth, params, request, response }) {
    try {
      const data = request.only([
        "title",
        "description",
        "background_color",
        "parent_id",
        "background_image",
      ])

      if (!data.parent_id) {
        throw new Error('parent_id is required')
      }

      const mindmap_id = params.mindmap_id
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id, user_id: auth.user.id })

      await this.getMindmapNodeOrThrowError({ mindmap, node_id: data.parent_id })

      const node = await mindmap.nodes().create(data)

      return { node }
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }

  /**
   * Display a single node.
   * GET nodes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ auth, params, request, response, view }) {
    try {
      const { mindmap_id, id } = params
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id, user_id: auth.user.id })
      const node = await this.getMindmapNodeOrThrowError({ mindmap, node_id: id })

      return { node }
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }


  }

  /**
   * Update node details.
   * PUT or PATCH nodes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ auth, params, request, response }) {
    try {
      const data = request.only([
        "title",
        "description",
        "background_color",
        "parent_id",
        "background_image",
      ])

      const { id, mindmap_id } = params

      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id, user_id: auth.user.id })
      const node = await this.getMindmapNodeOrThrowError({ mindmap, node_id: id })

      node.merge(data)
      await node.save()

      return { node }
    } catch (error) {
      Logger.error(error)
      return response.status(401).send({ error: 'Not authorized' })
    }
  }

  /**
   * Delete a node with id.
   * DELETE nodes/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ auth, params, request, response }) {
    try {
      const { mindmap_id, id } = params
      const mindmap = await this.getUserMindmapOrThrowError({ mindmap_id, user_id: auth.user.id })
      const node = await this.getMindmapNodeOrThrowError({ mindmap, node_id: id })

      if (!node.parent_id) {
        throw new Error('Cannot delete a root node')
      }

      await node.delete()

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

  /**
   * Get a single node of a mindmap. If the node not exists, or if it does not belongs to the mindmap,
   * throw an error.
   *
   * @param {object} ctx
   * @param {Mindmap} ctx.mindmap_id
   * @param {Number} ctx.node_id
   */
  async getMindmapNodeOrThrowError({ mindmap, node_id }) {
    const node = await mindmap.nodes().where({ id: node_id }).first()
    if (!node) {
      throw new Error(`Node of id ${node_id} does not exists or does not belongs to mindmap ${mindmap.id}`)
    }

    return node
  }
}

module.exports = NodeController
