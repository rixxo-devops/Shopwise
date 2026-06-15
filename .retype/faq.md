# FAQ

Compiled from Shopwise support calls. Use this page for quick answers to common setup, sync, and configuration questions.

## Setup & Configuration

### How do I find the OrderWise API base URL?

It typically contains **AWAPI** in the URL path. If your OrderWise is hosted on a server, you can try appending `/awapi/docs` to test if the API is accessible. Once entered correctly in the app, the connection indicator will turn green to confirm it's working.

### Do I need a new OrderWise user for the integration?

Yes. Create a dedicated admin user in OrderWise (**System → Security → Users**) and assign it to your API user group. Name it after the website for easy identification (e.g. `uheat.com`). This keeps things clean and auditable.

### What is a session in OrderWise and why does the app need one?

An OrderWise session is effectively a dedicated "till" or shop channel. You must create a new session for each Shopify store integration — do not share sessions with other websites or channels, as this causes order numbering conflicts. Set the **Transfer Type** to **Web Service** under the Import Setup tab of the session.

### What session settings should I enable in OrderWise?

The key ones to turn on are:

- **Use delivery method system tax code if not provided**
- **Use variant system tax code if not provided**
- **Add delivery address to existing customer if not found**
- **Add customer contact to existing customer if not found**
- **Use variant stock location if default not available**
- **Override variant disallow settings**

The four customer validation options should also all be ticked.

### What interval should I set on the OrderWise session?

Set it to **5 minutes**. The app polls every 15 minutes for stock and status updates from its side, but the session interval controls how frequently OrderWise checks for incoming orders.

### I can't see "API Export Definitions" in my OrderWise — only "E-Commerce Export Definitions". Why?

This is a user permissions issue. Ask your OrderWise admin to check the API user group permissions and ensure the **API Export Definitions** module is ticked. Without this, stock and order status syncing cannot be set up.

### Can I launch with just order sync enabled and add stock/status/product sync later?

Yes. The modules are completely independent. You only need to configure payment mapping, shipping mapping, and customer matching to start syncing orders. Stock, order status updates, and product imports can be turned on later once configured.

## Order Sync

### How does the app match Shopify customers to OrderWise customers?

It works in cascade:

1. First by **OrderWise ID** (stored in a Shopify customer metafield)
2. Then by **email**
3. Then by **name and address**

If no match is found, it creates a new customer in OrderWise. You can pre-import your existing customer list to populate the metafield and avoid duplicates.

### What's the difference between single-customer mode and one-to-one customer matching?

**Single-customer mode** sends all orders through one named OrderWise customer account — typical for B2C businesses that don't need per-customer records.

**One-to-one mode** creates or matches an individual OrderWise customer per order, storing the OrderWise ID in a Shopify metafield. Most B2B clients use one-to-one.

### How do I map payment methods?

The app auto-detects standard Shopify gateways (Shopify Payments, PayPal, Klarna). For each, you enter the corresponding OrderWise payment method ID (found under **System → Sales Order → Payment Methods** — enable the ID column in the grid).

If you have multiple Klarna variants, you may need to create a consolidated payment method in OrderWise or map each handle separately.

### How do I map shipping/delivery methods?

The app pulls all Shopify shipping methods. You map each to an OrderWise delivery method ID (**System → Sales Order → Delivery Methods**).

If using a third-party shipping rate app (e.g. ShipX), you'll need to check what rate IDs it outputs to Shopify — you can inspect these on a test order. If all your methods map to the same delivery method in OrderWise, you can set them all to the same ID to get started.

### Can I hold or delay certain orders from going into OrderWise?

Yes. Add an **exclusion tag** to orders you don't want synced. Any order tagged with that value won't be sent to OrderWise.

!!! note
The app's order lookback window is limited to **168 hours (7 days)**. If you remove the tag after that window, the order won't retroactively sync.
!!!

### Can the app handle orders that already come in from another channel (e.g. B&Q via Miracle)?

Not natively out of the box, but it's achievable. The recommended approach is to use Shopify automation to detect an identifier (e.g. email domain or tag) on marketplace orders and apply a tag, which the app can then exclude from syncing — or pass an analysis field value down to OrderWise to differentiate the source.

This is typically a custom build but is being considered as a generic feature.

### Does the app pass VAT/tax flags from Shopify orders through to OrderWise?

Yes — it passes exactly the values Shopify sends. If a line item has the taxable flag set to false, that goes down to OrderWise as-is. OrderWise must be configured to accept zero-tax lines; this is an OrderWise-side setting, not something the app controls.

### Can I pass order notes or custom fields through to OrderWise?

Yes, with customisation. Shopify doesn't have a standard location for custom order data, so the mapping needs to be defined based on your specific setup. Order notes can be mapped to customer notes in OrderWise; other fields depend on what analysis fields you have in OrderWise.

## Stock Sync

### How does stock sync work and how frequently does it update?

Stock is pulled from an OrderWise API export definition — a small SQL query — every **15 minutes**. The query is written to only return products where stock has changed in the last 15 minutes, to keep API usage low.

Rixxo provides a default export definition that you can customise to filter by product type, stock location, or other criteria.

### What if my Shopify SKUs don't match my OrderWise variant codes exactly?

The sync is SKU-to-SKU. If you use OrderWise's **alternate codes** feature (additional codes that resolve back to a master variant), those aren't included by default, but the export definition can be modified to include them. Raise this early in setup so it can be scoped.

### Can I filter which products get included in the stock sync?

Yes. The export definition is editable SQL. You can filter by stock location, product category, analysis fields, or any other OrderWise data. Rixxo can assist if you need help writing the SQL.

## Product Sync

### Does product sync only update existing products, or does it create new ones too?

Both — by default. If a matching SKU exists in Shopify, it updates it. If no SKU is found, it creates a new product in a **disabled** state. If you don't want new products created automatically, this behaviour can be suppressed.

### Can I use product sync just to update prices, without syncing everything else?

Yes. The only required field in the export definition is **SKU**. If you only include SKU and price, the sync will just update prices on existing products. No other fields are mandatory.

### We manage products in Shopify and don't want OrderWise pushing changes. Can we turn this off?

Yes. Product sync won't run unless you've added an export definition ID to the configuration. If you leave that field blank, it simply doesn't run.

### We have duplicate SKUs in Shopify (e.g. VAT and non-VAT variants of the same product). How does the stock sync handle this?

This is an edge case the app hasn't been specifically designed for. One viable workaround is to use OrderWise's alternate code feature — assign a different SKU to the zero-VAT variant, and include alternate codes in the export definition query so both variants get updated. This needs to be tested and scoped.

## Order Status & Dispatch

### How does the app update order status in Shopify when an order is dispatched in OrderWise?

It uses a second API export definition — a SQL query that returns orders where the status has changed in the last hour. You map OrderWise status names (e.g. "Invoice Waiting to be Printed", "Dispatched") to Shopify statuses (Fulfilled, Cancelled, etc.). The app polls this every **15 minutes**.

### Will tracking numbers be passed back to Shopify?

This is in development. The field is included in the order status export definition already, but the feature to surface it in Shopify wasn't live as of the calls reviewed.

## Credit & B2B

### Can the app sync OrderWise credit account balances to Shopify so customers can't over-order on credit?

Yes. The app syncs available credit and credit used from OrderWise to Shopify customer metafields. A compatible Shopify B2B app (e.g. Sparkler) then reads those fields at checkout — if available credit is zero or negative, the credit payment method is hidden. The credit data stays in sync automatically.

### Can customers view and pay invoices online rather than receiving them by email?

This is a frequently requested feature. The recommended approach is to find a suitable Shopify portal solution, then integrate it with OrderWise through the app to surface invoice data. Treat it as a separate scoping project once your core integration is stable.

## Multiple Stores & Marketplace Channels

### Can one OrderWise instance connect to multiple Shopify stores?

Yes. Each store is configured independently with its own session and credentials.

### Can Shopwise connect to eBay or Amazon directly, or only Shopify?

The app connects OrderWise to Shopify. If you're currently using Shopify as middleware to push to eBay (e.g. via Trunk), that setup continues to work alongside the app. Direct OrderWise-to-eBay/Amazon connections are possible but would be a separate integration discussion.

---

**Still stuck?** Check the [Troubleshooting Guide](troubleshooting.md) or [get in touch with the Shopwise team](https://shopwise-orderwise-integration.myshopify.com/pages/contact).
