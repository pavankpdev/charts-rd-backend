import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import data from "./data.json"
import {AggregatedDataset, MarketBasedEmissionByYear, Dataset} from "./type"
import {paginate} from "./utils/paginate";

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

app.get("/ov", (req, res) => {
    const logisticsDataset: Dataset[] = data
    const aggregatedData: Record<string, AggregatedDataset> = logisticsDataset.reduce((acc: Record<string, AggregatedDataset>, item) => {
        const year = new Date(item.reportedDate).getFullYear();
        const key = `${item.market}-${year}`;

        if (!acc[key]) {
            acc[key] = {
                market: item.market,
                year: year,
                totalEmission: 0
            };
        }
        acc[key].totalEmission += item.emission;

        return acc;
    }, {});

// Step 2: Calculate emission percentages by year
    const yearlyTotalEmissions: Record<string, number> = {};
    Object.values(aggregatedData).forEach(item => {
        if (!yearlyTotalEmissions[item.year]) {
            yearlyTotalEmissions[item.year] = 0;
        }
        yearlyTotalEmissions[item.year] += item.totalEmission;
    });

    const combinedData = Object.values(aggregatedData).reduce((acc: any[], item) => {
        const yearEntry = acc.find(entry => entry.year === item.year);

        if (yearEntry) {
            yearEntry[item.market] = (item.totalEmission / yearlyTotalEmissions[item.year]) * 100;
        } else {
            acc.push({
                year: item.year,
                [item.market]: (item.totalEmission / yearlyTotalEmissions[item.year]) * 100
            });
        }

        return acc;
    }, []);


    const percentageData: MarketBasedEmissionByYear[] = Object.values(aggregatedData).map(item => ({
        market: item.market,
        year: item.year,
        emissionPercentage: (item.totalEmission / yearlyTotalEmissions[item.year]) * 100
    }));

// Step 3: Calculate total emissions across all markets by year
    const totalEmissionsByYear: Pick<AggregatedDataset, "year" | "totalEmission">[] = Object.keys(yearlyTotalEmissions).map(year => ({
        year: parseInt(year, 10),
        totalEmission: yearlyTotalEmissions[year]
    }));

// percentageData now contains emission percentages per market per year
// totalEmissionsByYear contains total emissions per year across all markets

    return res.json({
        totalEmissionsByYear,
        marketBasedEmissionByYear: combinedData
    })
})

app.get("/custom", (req, res) => {
    const {
        category,
        market,
        year,
    } = req?.query;

    const logisticsDataset: Dataset[] = data
    const filteredData = logisticsDataset.filter(item => {
        return (
            (!category ||
                (Array.isArray(category)
                    ? category.includes(item.category)
                    : item.category === category)) &&
            (!market ||
                (Array.isArray(market)
                    ? market.includes(item.market)
                    : item.market === market)) &&
            (!year ||
                (Array.isArray(year)
                    ? year.includes(new Date(item.reportedDate).getFullYear().toString())
                    : new Date(item.reportedDate).getFullYear() === parseInt(year, 10)))
        );
    });

    const page = req?.query?.page ? parseInt(req?.query?.page): undefined;
    const limit = req?.query?.limit ? parseInt(req?.query?.limit): undefined;
    const paginatedFilteredData = paginate(filteredData, page, limit);

    res.json(paginatedFilteredData)
})

app.get("/categories", (_, res) => {
    res.json({
        results: [
            "Supply Chain",
            "Reduction",
            "Reduced",
            "Compensation",
            "Compensated"
        ]
    })
})

app.listen(3001, () => {
    console.log(`Example app listening on port 3001`)
})