const { Leads } = require("../metaService/service");
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;


exports.GetHome = (req, res, next) => {
    res.render('home');
}


exports.GetWebhook = (req, res, next) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === VERIFY_TOKEN
    ) {

        console.log("✅ Webhook verified");

        return res.status(200).send(challenge);
    }

    console.log("❌ Webhook verification failed");

    return res.sendStatus(403);
};


exports.PostWebhook = async (req, res) => {
    console.log("\n========== WEBHOOK RECEIVED ==========");

    console.log(
        JSON.stringify(req.body, null, 2)
    );


    // Meta expects 200 quickly
    res.sendStatus(200);


    if (req.body.object !== "page") {

        console.log("❌ Not a Page webhook");

        return;
    }


    for (const entry of req.body.entry || []) {

        for (const change of entry.changes || []) {

            console.log(
                "Webhook field:",
                change.field
            );


            if (change.field !== "leadgen") {
                continue;
            }


            const leadId =
                change.value?.leadgen_id;


            if (!leadId) {

                console.log(
                    "❌ leadgen_id missing"
                );

                continue;
            }


            console.log(
                "🔥 NEW LEAD:",
                leadId
            );


            // Get complete lead information
            const lead =
                await Leads(leadId);


            if (!lead) {

                console.log(
                    "❌ Could not fetch lead details"
                );

                continue;
            }


            console.log("\n👤 CUSTOMER DETAILS");
            console.log("==============================");

            console.log(
                "Lead ID:",
                lead.id
            );

            console.log(
                "Created:",
                lead.created_time
            );


            for (
                const field
                of lead.field_data || []
            ) {

                const value =
                    field.values?.join(", ");

                console.log(
                    `${field.name}: ${value}`
                );
            }


            console.log(
                "==============================\n"
            );


            // Send lead to connected browsers
            req.app.get("io").emit(
                "newLead",
                lead
            );

        }
    }
};


exports.GetLeads = (req, res) => {
    const leads = [];

    res.render(
        "leads",
        {
            leads
        }
    );

};