'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
    /**
     * Relation between Category and Image
     */
    static get deleteTimestamp () {
        return 'deleted_at'
    }

    image(){
        return this.belongsTo('App/Models/Image')
    }

    // Relation between Category and Products

    products(){
        return this.belongsToMany('App/Models/Product')
    }
}

module.exports = Category
