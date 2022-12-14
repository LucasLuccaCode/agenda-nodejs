const UserModel = require("./UserModel")
const validator = require("validator")
const bcrypt = require("bcryptjs")

class Validator {
  constructor(body) {
    this.body = body
    this.errors = []
    this.user = null
  }
  cleanData(type) {
    if (type === "register") {
      this.body = {
        username: this.body.username,
        email: this.body.email,
        password: this.body.password,
      }
      return
    }
    this.body = {
      username: this.body.username,
      password: this.body.password,
    }
  }
  checkIfValidEmail() {
    const isValidEmail = validator.isEmail(this.body.email)
    if (!isValidEmail) this.errors.push("Email inválido!")
  }
}

class Register extends Validator {
  constructor(body) {
    super(body)
  }
  async register() {
    await this.validate()
    if (this.errors.length) return

    const password = this.body.password
    const salt = bcrypt.genSaltSync()
    this.body.password = bcrypt.hashSync(this.body.password, salt)

    try {
      this.user = await UserModel.create(this.body)
      this.user.password = password
    } catch (e) {
      this.errors.push("Falha ao tentar criar usuário!")
    }
  }
  async validate() {
    this.cleanData("register")
    this.checkIfValidEmail()
    await this.checkUsernameExist()
  }
  async checkUsernameExist() {
    try {
      const user = await UserModel.findOne({
        username: this.body.username
      })
      if (user) this.errors.push("Nome de usuário já existe!")
    }
    catch (err) {
      this.errors.push("Erro ao verificar existência de usuário.")
    }
  }
}

class Login extends Validator {
  constructor(body) {
    super(body)
  }
  async login() {
    this.validate()
    const password = this.body.password
    try {
      this.user = await UserModel.findOne({
        username: this.body.username
      })
      if (!this.user)
        return this.errors.push("Usuário e/ou senha inválidos!")

      if (!bcrypt.compareSync(this.body.password, this.user.password)) {
        this.errors.push("Usuário e/ou senha inválidos!")
        this.user == null
        return
      }
      this.user.password = password
    } catch (e) {
      console.log("Erro ao verificar existência de usuário")
    }
  }
  validate() {
    this.cleanData("login")
    //this.checkIfValidEmail()
  }
}

module.exports = {
  Register,
  Login
}