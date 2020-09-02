'use strict'

class Login {
  get rules() {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  /**
   * This method messages() is only necessary if you wanna translate its content,
   * by default, adonisjs has english messsages displayed whenever a validation
   * is called.
   */

  // get messages() {
  //   return {
  //     'email.required': 'Email can not be empty',
  //     'name.required': 'Name can not be empty',
  //     'surname.required': 'Surname can not be empty',
  //     'email.email': 'Invalid email input',
  //     'email.unique':'Email already exists',
  //     'password.required':'Password can not be empty',
  //     'password.confirmed':'Password doesn\'t match'
  //   }
  // }

}

module.exports = Login
