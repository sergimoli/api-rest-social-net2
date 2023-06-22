//importar dependències
const connect = require("./database/connection");
const express = require("express");
const cors = require("cors");
//missatge de benvinguda
console.log("API NODE for social net started!");
//conexió a bbdd
connect();
//crear servidor node
const app = express();
const port = 3900;

//configurar cors (per que totes les peticions les faci correctament)
//middleware: s'executa abans que les propies rutes. PREVI al controlador...
app.use(cors());
// convertir les dades del body a objectes json
app.use(express.json()); //tindrem un middleware que va decodifcar els datos del body com a objecte javascript usable.
app.use(express.urlencoded({ extended: true })); //qualsevol dada que ve com a forM url encoded mel converteix a objecte usable javascript
// carregar conf rutes (aquí em de fer els imports dels fitxers de rutes per que s'executin abans)
const userRoutes = require("./routes/user");
const publicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

//carreguem configuració de les rutes dins d'express
app.use("/api/user", userRoutes);
app.use("/api/publication", publicationRoutes);
app.use("/api/follow", FollowRoutes);

//Rutes de proba
app.get("/ruta-proba", (req, res) => {
  return res.status(200).json({
    id: 1,
    name: "sergi",
    web: "web.web",
  });
});
// posar servidor a escoltar peticions http
app.listen(port, () => {
  console.log("server node running on port: ", port);
});
