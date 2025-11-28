const axios = require('axios');

const API_KEY = "eydxdrs9p3bd317190y1nbjs0g7sdsl6"; // Paste your key here

async function getFields() {
    try {
        const response = await axios.get('https://api.getresponse.com/v3/custom-fields', {
            headers: { 'X-Auth-Token': `api-key ${API_KEY}` }
        });
        
        console.log("--- COPY THESE IDS ---");
        response.data.forEach(field => {
            // UPDATED LIST OF NAMES
            if(['budget', 'interest', 'user_city', 'user_gender', 'user_number'].includes(field.name)) {
                console.log(`${field.name}: "${field.customFieldId}"`);
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
}

getFields();