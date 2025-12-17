export const MVP_OFFERS = [
    {
        key: "ghormeh-sabzi",
        enabled: true,
        price: 15,
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Ghormeh Sabzi (Herb Stew)",
    },
    {
        key: "fesenjan",
        enabled: true,
        price: 18,
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Fesenjan (Pomegranate Walnut Stew)",
    },
    {
        key: "kebab-koobideh",
        enabled: true,
        price: 20,
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Kebab Koobideh",
    },
    {
        key: "tahchin",
        enabled: true,
        price: 16, // Saffron Rice Cake
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Tahchin (Saffron Rice Cake)",
    },
    {
        key: "zereshk-polo",
        enabled: true,
        price: 14,
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Zereshk Polo (Barberry Rice)",
    },
    {
        key: "white-pizza",
        enabled: true,
        price: 18,
        currency: "USD",
        channel: "whatsapp",
        destination: "+19498611144",
        message: "Hi, I found your {{SKU}} on Zaffaron. Is it available for pickup? (Zaffaron Order Ref: {{DATE}})",
        skuLabel: "Garlic & Onion White Pizza",
    }
];

export function getOffer(slug) {
    if (!slug) return null;
    // Simple normalization: lowercase and match
    return MVP_OFFERS.find(o => o.enabled && o.key.toLowerCase() === slug.toLowerCase());
}
