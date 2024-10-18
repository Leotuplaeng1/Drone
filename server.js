const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path"); 
const app = express();
const port = process.env.PORT || 8000; 

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public"))); 

const config_url = process.env.CONFIG_URL || "https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec";
const logs_url = process.env.LOGS_URL || "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

app.get("/configs/:my_id", async (req, res) => {
    const id = req.params.my_id;
    try {
        const rawData = await fetch(config_url, { method: "GET" });
        const jsonData = await rawData.json();
        const drones = jsonData.data;

        const myDrone = drones.find(item => item.drone_id == id);
        if (!myDrone) {
            return res.status(404).send({ message: "Drone not found" });
        }

        myDrone.max_speed = !myDrone.max_speed ? 100 : myDrone.max_speed;
        myDrone.max_speed = myDrone.max_speed > 110 ? 110 : myDrone.max_speed;

        res.status(200).send(myDrone);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching drone config" });
    }
});

app.post("/logs", async (req, res) => {
    try {
        const rawData = await fetch(logs_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });
        const result = await rawData.json();
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error posting log data" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
