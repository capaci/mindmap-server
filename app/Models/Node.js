'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Node extends Model {

  children() {
    return this.hasMany('App/Models/Nodes')
  }

  parent() {
    return this.belongsTo('App/Models/Node')
  }
}

module.exports = Node
