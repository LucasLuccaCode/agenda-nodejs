require("dotenv").config()

const express = require("express")
const app = express()
const path = require("path")
const routes = require("./routes")
const mongoose = require("mongoose")
const flash = require("connect-flash")
const helmet = require("helmet")
const csrf = require("csurf")

//Mongodb
mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log("Connected to Mongodb")
  app.emit("logged")
})
  .catch(err => console.log("Erro ao se conectar ao Mongodb"))

// app.use(helmet())

app.use(express.urlencoded({ extended: true }))

//Static files
app.use(express.static(path.resolve(__dirname, "public")))

//Views
app.set("views", path.resolve(__dirname, "src", "views"))
app.set("view engine", "ejs")

//Session / Flash
const sessionMiddleware = require("./src/middlewares/sessionMiddleware")
app.use(sessionMiddleware)
app.use(flash())

//Global Middlewares
const setLocalsVarMiddleware = require("./src/middlewares/setLocalsVarMiddleware")
const { csrfErrorMiddleware } = require("./src/middlewares/csrfMiddleware")

//Add security
app.use(csrf())
app.use(csrfErrorMiddleware)
app.use(setLocalsVarMiddleware)


//Routes
app.use(routes)

app.on("logged", () => {
  app.listen(3000, () => {
    console.log("Listening on port 3000")
  })
})