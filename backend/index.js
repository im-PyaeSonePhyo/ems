import dotenv from "dotenv";
dotenv.config();

import connectToDatabase from "./db/db.js";
import app from "./app.js";

connectToDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
