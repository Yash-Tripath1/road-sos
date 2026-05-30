const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {

const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    const overpassQuery = `[out:json];node["amenity"="hospital"](around:5000,${lat},${lng});out 1;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    
    let nearestHospital = "Unknown Trauma Center";
    let nearbyFacilities = [];
    
    // 1. FREE HOSPITAL SEARCH (With Anti-Bot Headers)
    try {
      const osmResponse = await fetch(overpassUrl, {
        headers: {
          'User-Agent': 'RoadSOS-Emergency-NodeJS-Client/1.0',
          'Accept': 'application/json'
        }
      });
      
      // If the API still blocks us, throw an error instead of trying to parse HTML
      if (!osmResponse.ok) {
        throw new Error(`OSM Firewall blocked request. Status: ${osmResponse.status}`);
      }
      
      const osmData = await osmResponse.json();
      
      if (osmData.elements && osmData.elements.length > 0) {
        nearestHospital = osmData.elements[0].tags.name || "Unnamed Local Hospital";
        nearbyFacilities = osmData.elements.map(el => ({ name: el.tags.name || "Local Medical Facility" }));
      }
    } catch (osmError) {
      console.error("⚠️ OpenStreetMap Fallback Triggered:", osmError.message);
      nearestHospital = "Nearest Available Emergency Hub"; 
    }

    // 2. AUTOMATED TWILIO SMS DISPATCH
    console.log("📡 Attempting to dispatch Twilio SMS...");
    const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const message = await twilioClient.messages.create({
  body: `SOS! Loc: ${mapLink} Hub: ${nearestHospital}`, // Zero emojis, maximum brevity
  from: process.env.TWILIO_PHONE_NUMBER,
  to: process.env.EMERGENCY_CONTACT 
    });

    console.log(`✅ SMS successfully fired! Twilio SID: ${message.sid}`);

    // 3. RESPOND TO FRONTEND
    res.json({
      status: "success",
      smsId: message.sid,
      nearestTraumaCenter: nearestHospital,
      mapLink: mapLink,
      nearbyFacilities: nearbyFacilities.slice(0, 3)
    });

  } catch (error) {
    console.error("💥 Critical Twilio Dispatch Error:", error);
    res.status(500).json({ error: "Failed to process SOS dispatch", details: error.message });
  }
});
module.exports = router;