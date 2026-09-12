const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

async function Leads(leadId) {

    try {

        const url =
            `https://graph.facebook.com/v26.0/${leadId}` +
            `?fields=id,created_time,field_data` +
            `&access_token=${PAGE_ACCESS_TOKEN}`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Meta Lead API Error:");
            console.error(data);

            return null;
        }

        return data;

    } catch (error) {

        console.error("❌ Error fetching lead:");
        console.error(error);

        return null;
    }
}

module.exports = {
    Leads
};