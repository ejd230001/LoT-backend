import express from "express";
import cors from "cors";
import { apiRouter } from "./apiRouter.js";

const app = express();

app.use(cors());
app.use('/api', apiRouter)

app.listen(8000, () => {
    console.log("Listening on port 8000");
});
