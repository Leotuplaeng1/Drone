const drone_id = 65011153;  
const config_url = `http://127.0.0.1:8000/configs/${drone_id}`;  
const log_url = `https://app-tracking.pockethost.io/api/collections/drone_logs/records`;

const divConfig = document.getElementById("config");
const divStatus = document.getElementById("status");
const myForm = document.getElementById("my-form");
const tableBody = document.getElementById("logs-body");

var my_config;

const displayLogs = (logs) => {
    logs.forEach(log => {
        const row = document.createElement("tr");

        const createdCell = document.createElement("td");
        createdCell.textContent = log.created;

        const countryCell = document.createElement("td");
        countryCell.textContent = log.country;

        const droneIdCell = document.createElement("td");
        droneIdCell.textContent = log.drone_id;

        const droneNameCell = document.createElement("td");
        droneNameCell.textContent = log.drone_name;

        const celsiusCell = document.createElement("td");
        celsiusCell.textContent = log.celsius;

        row.appendChild(createdCell);
        row.appendChild(countryCell);
        row.appendChild(droneIdCell);
        row.appendChild(droneNameCell);
        row.appendChild(celsiusCell);

        tableBody.appendChild(row);
    });
}

// ดึง logs จาก API และเรียกใช้ฟังก์ชันแสดงผล
const fetchLogs = async () => {
    try {
        const rawData = await fetch(log_url);
        const jsonData = await rawData.json();
        const logs = jsonData.items;

        // เรียง logs ตามเวลา ล่าสุด
        logs.sort((a, b) => new Date(b.created) - new Date(a.created));

        displayLogs(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
};

const getConfig = async (droneId) => {    
    try {
        const rawData = await fetch(config_url);
        const jsonData = await rawData.json();

        console.log({ jsonData });
        return jsonData;
    } catch (error) {
        console.error("Error fetching config:", error);
        displayStatus("Failed to fetch config.");
    }
}

const displayWaiting = () => {
    const html = `<p>Drone ID: ${drone_id}, Waiting for config...</p>`;
    divConfig.innerHTML = html;
}

const displayConfig = (config) => {
    const html = `
        <ul>
            <li>Drone ID: ${config.drone_id}</li>
            <li>Drone Name: ${config.drone_name}</li>
            <li>Drone Condition: ${config.condition}</li>
            <li>Drone Light: ${config.light}</li>
            <li>Drone Max Speed: ${config.max_speed}</li>
        </ul>`;
    divConfig.innerHTML = html;
}

const displayStatus = (msg) => {
    const html = `<p>${msg}</p>`;
    divStatus.innerHTML = html;
}

const postLog = async (log) => {
    try {
        await fetch(log_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(log),
        });
    } catch (error) {
        console.error("Error posting log:", error);
        displayStatus("Failed to post log.");
    }
}

const main = async () => {
    console.log(`Drone ID: ${drone_id}`);
    displayWaiting();
    const myConfig = await getConfig(drone_id);
    if (myConfig) {
        my_config = myConfig;
        displayConfig(myConfig);

        myForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = new FormData(event.target);
            const temperature = data.get("temperature");

            const log = {
                drone_id: drone_id,
                drone_name: my_config.drone_name,
                celsius: temperature,
                country: my_config.country
            };

            displayStatus("Posting log...");
            await postLog(log);
            displayStatus("Posting Done");

            console.log("Log submitted", { log });
        });
    }

    await fetchLogs();
};

main();
