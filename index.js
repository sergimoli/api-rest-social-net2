const { conexion } = require("./database/connection");
const express = require("express"); //importar express(framework)
const cors = require("cors");

console.log("hei there!s");
conexion(); //conectem a la bd

//crear servidor de node
const app = express();
const port = 3900;

//configurar cors
app.use(cors()); //això es un middelware(executar-se abans que altres coses). Implementing CORS in Node.js helps you access numerous functionalities on the browser.

//convertir body a objecte js
app.use(express.json()); //rebre dades amb content-type app/json
app.use(express.urlencoded({ extended: true })); // form-urlenconded

//crear rutes
const routes_article = require("./routes/article");
//carreguem les rutes
app.use("/api", routes_article); //totes les rutes començaran per /api

//rutes de probes hardcoded
// req = petició, res = resposta
app.get("/testing", (req, res) => {
  // Aquest missatge apareix quan a un navegador posem: http://localhost:3900/testing
  console.log("endpoint testing has been execued");
  //   return res.status(200).send(
  //     `
  //     <div>
  //     <h1> testing nodejs route    </h1>
  //     <p>creating api rest with node</p>
  //     </div>
  //     `
  //   );

  return res.status(200).json({
    course: "master in react",
    author: "sergi molina",
    url: "teto.com",
  });
});
//crear servidor i escolar peticions http
app.listen(port, () => {
  console.log("server running in port " + port);
});
