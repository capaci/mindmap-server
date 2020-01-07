'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Mindmap extends Model {

  user () {
    return this.belongsTo('App/Models/User')
  }

  nodes () {
    return this.hasMany('App/Models/Node')
  }
}

module.exports = Mindmap
