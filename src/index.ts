import express from "express";
import {config} from "./config";

const app = express();

app.use(express.json());

app.get("/api/shrt/v0/public/test", (_req, res) => {
    res.send("<h1>Hello from Express + TS!</h1>>");
});

const start = async () => {
    try {
        console.log("Postgres connection established.");
        app.listen(config.app.port, () => console.log(`Server at http://localhost:${config.app.port}`));
    } catch (err) {
        console.error("Unable to connect:", err);
    }
};

start();
