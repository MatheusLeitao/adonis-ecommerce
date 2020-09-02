'use strict'

class StoreUser {
  get rules () {
    let userId = this.ctx.params.id
    let rule = ''
    /**
     * When there is an id, it means the user is updating its info.
     * 如果有用户的任何ID， 这个意味那个用户是在更新信息
     * 任何 = renhe
     */
    if (rule) rule=`unique:users,email,id,${userId}`
    else rule='unique:users,email|required'

    return {
      email: rule,
      image_id: 'exists:images,id'
    }
  }
}

module.exports = StoreUser
