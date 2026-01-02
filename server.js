require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const pool = require("./db");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT;
const DEVTO_API_KEY = process.env.DEVTO_API_KEY;

app.use(cors());

async function getIPDetails(ip) {
  try {
    const res = await axios.get(`https://ipapi.co/${ip}/json/`);
    return res.data;
  } catch (err) {
    return { error: "Failed to fetch IP details" };
  }
}

app.get("/", (req, res) => {
  res.send("api.portfolio.roshakjulkar.in API is running!");
});

app.get("/api/log", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const details = await getIPDetails(ip);

  const {
    city = "Unknown",
    region = "Unknown",
    region_code = "Unknown",
    country = "Unknown",
    country_name = "Unknown",
    country_code = "Unknown",
  } = details;

  const query = `
      INSERT INTO logs (
        city,
        region,
        region_code,
        country,
        country_name,
        country_code
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

  const values = [
    city,
    region,
    region_code,
    country,
    country_name,
    country_code,
  ];

  try {
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      log_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Log insert failed:", error.message);

    res.status(200).json({
      success: false,
      message: "Log skipped",
    });
  }
});

app.get("/api/log/stats", async (req, res) => {
  try {
    // Total page views
    const totalResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM logs
    `);

    // Page views in last 24 hours
    const last24Result = await pool.query(`
      SELECT COUNT(*)::int AS last24
      FROM logs
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    res.json({
      totalPageViews: totalResult.rows[0].total,
      last24HoursPageViews: last24Result.rows[0].last24,
    });
  } catch (err) {
    console.error("Error fetching stats:", err.message);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

app.get("/api/devto/stats", async (req, res) => {
  try {
    const response = await axios.get(
      "https://dev.to/api/articles/me/published",
      {
        headers: {
          "api-key": DEVTO_API_KEY,
        },
      }
    );

    res.json({ data: response.data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Dev.to data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
