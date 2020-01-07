'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NodeSchema extends Schema {
  up () {
    this.create('nodes', (table) => {
      table.increments()

      table
        .integer('mindmap_id')
        .unsigned()
        .references('id')
        .inTable('mindmaps')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .integer('parent_id')
        .unsigned()
        .references('id')
        .inTable('nodes')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.string('title', 100)
      table.text('description', 1024)
      table.string('background_color', 7)
      table.string('background_image', 512)

      table.timestamps()
    })
  }

  down () {
    this.drop('nodes')
  }
}

module.exports = NodeSchema
