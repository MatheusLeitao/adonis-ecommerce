'use strict'

const CouponTransformer = require("./CouponTransformer")

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */

  static get defaultIncludes(){
    return ['coupon']
   }

  transform (model) {
    return {
     id: model.id,
     amount: model.discount
    }
  }

  includeCoupon(model){
    return this.item(model.getRelated('coupon'), CouponTransformer)
  }
}

module.exports = DiscountTransformer
