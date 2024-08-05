import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import data from "./data.json"

dotenv.config()
const app = express()

app.use(cors())

app.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = data.slice(startIndex, endIndex);

    res.json({
        page,
        limit,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / limit),
        data: paginatedData
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})