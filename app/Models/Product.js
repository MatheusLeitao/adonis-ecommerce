'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

    // Relation between product and image
    image(){
        return this.belongsTo('App/Models/Image');
    }

    /**
     * Relation between product and image
     * Product images galery
     * */

    images(){
         return this.belongsToMany('App/Models/Image')
     }


     /**
      * Relation between product and category
      */

    categories(){
        return this.belongsToMany('App/Models/Category')
    }

    /**
     * Relation between products and coupons
     */

    coupons(){
        return this.belongsToMany('App/Models/Coupon')
    }

}

module.exports = Product
