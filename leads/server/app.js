require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PAGE_ID = process.env.META_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;


// ==========================================
// 1. WEBHOOK VERIFICATION
// ==========================================

app.get("/webhook", (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {

        console.log("✅ Webhook verified");

        return res.status(200).send(challenge);
    }

    console.log("❌ Webhook verification failed");

    return res.sendStatus(403);
});


// ==========================================
// 2. RECEIVE META WEBHOOK
// ==========================================

app.post("/webhook", async (req, res) => {

    console.log("\n========== WEBHOOK RECEIVED ==========");
    console.log(JSON.stringify(req.body, null, 2));

    // Meta ko immediately 200 response
    res.sendStatus(200);

    if (req.body.object !== "page") {
        console.log("❌ Not a Page webhook");
        return;
    }

    for (const entry of req.body.entry || []) {

        for (const change of entry.changes || []) {

            console.log("Webhook field:", change.field);

            if (change.field !== "leadgen") {
                continue;
            }

            const leadId = change.value?.leadgen_id;

            console.log("🔥 NEW LEAD ID:", leadId);

            if (!leadId) {
                console.log("❌ leadgen_id missing");
                continue;
            }

            await getLeadDetails(leadId);
        }
    }
});


// ==========================================
// 3. GET ACTUAL LEAD DETAILS FROM META
// ==========================================

async function getLeadDetails(leadId) {

    try {

        const url =
            `https://graph.facebook.com/v26.0/${leadId}` +
            `?fields=id,created_time,field_data` +
            `&access_token=${PAGE_ACCESS_TOKEN}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("\n❌ Meta Lead API Error:");
            console.error(JSON.stringify(data, null, 2));
            return;
        }

        console.log("\n👤 CUSTOMER DETAILS");
        console.log("==============================");

        console.log("Lead ID:", data.id);
        console.log("Created:", data.created_time);

        for (const field of data.field_data || []) {
            const fieldName = field.name;
            const value = field.values?.join(", ");

            console.log(`${fieldName}: ${value}`);
        }

        console.log("==============================\n");

    } catch (error) {
        console.error("❌ Failed to fetch lead:");
        console.error(error);
    }
}


// ==========================================
// 4. START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(`
========================================

🚀 Meta Lead Listener Started

Local:
http://localhost:${PORT}

Webhook:
http://localhost:${PORT}/webhook

========================================
`);
});