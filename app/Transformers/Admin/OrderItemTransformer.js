'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')
/**
 * OrderItemTransformer class
 *
 * @class OrderItemTransformer
 * @constructor
 */
class OrderItemTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  static get defaultIncludes() {
    return ['product']
  }

  transform(model) {
    return {
      id: model.id,
      subtotal: model.subtotal,
      quatity: model.quantity
    }
  }

  includeProduct(model) {
    return this.item(model.getRelated('product'), ProductTransformer)
  }
}

module.exports = OrderItemTransformer
