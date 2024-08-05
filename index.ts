import express from "express";
import cors from "cors"
import data from "./data.json"

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

app.listen(3001, () => {
    console.log(`Example app listening on port 3001`)
})