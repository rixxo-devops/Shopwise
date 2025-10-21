# Session Setup

This guide will help you create a fresh e-commerce session in OrderWise for your Shopify integration. Creating a new session avoids legacy quirks and ensures optimal order synchronization.

## Before You Start

Ensure you have:
- Admin access to OrderWise
- Email address of the person responsible for the integration
- A dedicated Shopify "admin user" in OrderWise for imported orders

## Step 1: Create a New Session

1. Go to **E-Commerce → E-Commerce Sessions** in OrderWise
2. Click **Add** to create a new session
3. **Name**: Use something clear (e.g., your Shopify shop name)
4. **Export**: Set to **Off** (unticked)
5. **Schedule**: Set to **Every 5 minutes**
6. **Notification email**: Enter the responsible person's email

![Session Creation](images/session-creation.png)

**Why these settings?**
- Export off prevents unintended pushes
- Short schedule keeps imports flowing
- Notifications ensure someone sees errors promptly

![Session Settings](images/session-settings.png)

## Step 2: Import Setup Tab

1. **Transfer Type**: Set to **Web Service**
2. Review other options carefully—changes here can impact the integration

![Import Setup](images/import-setup.png)

**Note**: Only change options you understand or that are documented by your integration plan.

## Step 3: Settings Tab (General Session Settings)

Review all settings and confirm they fit your site's behavior:

- **Import orders as**: Set a **dedicated Shopify user** (recommended)
  - Create a user in OrderWise for Shopify orders (e.g., *Shopify_Orders*)
  - This keeps audit trails tidy and avoids orders showing against real staff members

![General Settings](images/general-settings.png)

## Step 4: Import Setup → Advanced Settings

### Tax Configuration
- **Use Delivery Method system tax code**: **Ticked**
- **Use CVariant system tax code**: **Ticked**

### Customer Configuration
- **Add Customer Contact to existing customer if not found**: **Ticked**

### Variant Configuration
- **Use CVariant stock location if default is not available**: **Ticked**
- **Override Variant Disallow setting**: **Ticked**

### Customer Validation
- **Tick all options** (ensures stricter checks to maintain data quality)

![Advanced Settings](images/advanced-settings.png)

## Step 5: Save Configuration

Click **Save** to commit all settings.

## Finding Your Session ID

After creating and saving your session, you'll need the Session ID for the Shopwise configuration:

1. Go to **E-Commerce → E-Commerce Sessions**
2. Identify your new import session
3. Right-click on the grid and select **Edit Grid Layout**
4. Add the **ID** column to the grid
5. Note the Session ID for use in Shopwise

![Session ID](images/session-id.png)

## Next Steps

With your OrderWise session configured, you're ready to:

1. **[Configure Orderwise Integration](orderwise-integration.md)** - Set up the main integration settings
2. **[Set up Stock Updates](stock-updates.md)** - Configure inventory synchronization
3. **[Configure Mappings](payment-mapping.md)** - Set up payment, shipping, and status mappings

---

**Session created successfully?** Proceed to [Orderwise Integration](orderwise-integration.md) to configure the main settings.
