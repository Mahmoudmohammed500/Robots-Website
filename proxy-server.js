import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "/api";

app.all("/api/:endpoint", async (req, res) => {
  try {
    const { endpoint } = req.params;

    const response = await axios({
      method: req.method,
      url: `${BASE_URL}/${endpoint}.php`, 
      data: req.body,
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    res.status(500).json({ message: "Proxy failed", error: error.message });
  }
});

app.listen(5000, () => console.log(" Proxy running at http://localhost:5000"));