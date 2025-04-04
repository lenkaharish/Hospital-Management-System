const mongoose = require('mongoose');
const express = require('express');
const apiRoutes = require('./routes/apiRoutes');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");
const path = require('path');
const app = express();
app.use(express.json());


mongoose.connect("mongodb+srv://nagasurendra2001:ULoQYXfHM7Aqxn3s@cluster0.p7339sj.mongodb.net/Hospital?retryWrites=true&w=majority", {
}).then(() => console.log('successfully connected to database'))
  .catch((err) => console.log(err));


app.use('/api',apiRoutes);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/Prescriptions', express.static(path.join(__dirname, 'public/Prescriptions')));


const PORT = 3000;
app.listen(PORT, () =>{
   console.log(`Server running on http://localhost:${PORT}`);
   console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
