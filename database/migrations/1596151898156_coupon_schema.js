'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CouponSchema extends Schema {
  up() {
    this.create('coupons', (table) => {
      table.increments()
      table.string('code', 100).notNullable()
      table.datetime('valid_from')
      table.timestamps()
    })
  }

  down() {
    this.drop('coupons')
  }
}

module.exports = CouponSchema
