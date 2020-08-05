'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** !type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory')

const Role = use('Role')

class RoleSeeder {
  async run() {

    // await Role.create({
    //   name: 'Admin',
    //   slug: 'admin',
    //   description: 'System administrator'
    // })

    // await Role.create({
    //   name: 'Manager',
    //   slug: 'manager',
    //   description: 'Store manager'
    // })

    // await Role.create({
    //   name: 'Client',
    //   slug: 'client',
    //   description: 'Stores client'
    // })

  }
}

module.exports = RoleSeeder
