'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MindmapSchema extends Schema {
  up () {
    this.create('mindmaps', (table) => {
      table.increments()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mindmaps')
  }
}

module.exports = MindmapSchema
