'use strict'

class AuthController {

    async register({ request, response }) {
        return { greetings: 'tomar no cu' }
    }

    async login({ request, response, auth }) {

    }

    async refresh({ request, response, auth }) {

    }

    async logout({ request, response, auth }) {

    }

    async forgot({ request, response }) {

    }

    async remember({ request, response }) {

    }

    async reset({ request, response }) {

    }
}

module.exports = AuthController
