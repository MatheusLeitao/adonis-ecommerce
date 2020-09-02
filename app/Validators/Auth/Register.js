'use strict'

class AuthRegister {
  get rules() {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
    }
  }

  get messages() {
    return {
      'name.required': 'Name can not be empty',
      'surname.required': 'Surname can not be empty',
      'email.required': 'Email can not be empty',
      'email.email': 'Invalid email input',
      'email.unique':'Email already exists',
      'password.required':'Password can not be empty',
      'password.confirmed':'Password doesn\'t match'
    }
  }
}

module.exports = AuthRegister
