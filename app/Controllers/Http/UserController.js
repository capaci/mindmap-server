'use strict'

const User = use("App/Models/User")

class UserController {
  async create({ request }) {
    const data = request.only(["username", "email", "password"])

    const { username } = await User.create(data)

    return { user: { username } }
  }
}

module.exports = UserController
