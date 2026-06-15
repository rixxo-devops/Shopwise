# Orderwise Integration

This section covers the main configuration settings for connecting your Shopify store with OrderWise. The integration includes four key areas: Basic Settings, Payment Mappings, Shipping Mappings, and Status Mappings.

![Integration Sections](images/integration-sections.png)

## Basic Settings

Basic settings control the core functionality required for the OrderWise app to operate correctly.

### Orderwise Base URL

The OrderWise base URL is the API endpoint for your OrderWise instance. This is where all data will be sent.

**Format**: `https://your-orderwise-instance.com/api/`

### Orderwise Credential Hash

This is a base64-encoded version of user credentials for OrderWise authentication.

**How to create credentials:**
1. Take your username and password
2. Format as: `username:password`
3. Encode using base64 encryption
4. Use online tools like [base64encode.org](https://www.base64encode.org/) or AI services like ChatGPT

**Example:**
- Username: `rabbit`
- Password: `carrot`
- Format: `rabbit:carrot`
- Base64 encoded: `cmFiYml0OmNhcnJvdA==`

![Credential Hash](images/credential-hash.png)

### Session ID

The Session ID is the OrderWise e-commerce session ID that orders will be sent through.

**To find your Session ID:**
1. Go to your OrderWise instance
2. Click **E-Commerce** in the bottom left menu
3. Click **E-Commerce Sessions** in the top left menu
4. Identify your import session
5. Right-click and select **Edit Grid Layout**
6. Add the **ID** column to see the Session ID

![Session ID Location](images/session-id-location.png)

### Stock Location Identifier

This setting allows you to specify a default stock location for all orders from this store.

- Must match your stock location ID in OrderWise
- Optional setting - leave blank if not needed
- Ensures consistent stock location assignment

### OrderWise Customer ID

This is the customer ID that all orders will be placed against in OrderWise.

**To find a Customer ID:**
1. Go to your customers in OrderWise
2. Right-click on the screen and select **Edit Grid Layout**
3. Add the **Customer ID** column
4. Note the ID of the customer you want to use

![Customer ID](images/customer-id.png)

### Email Notification Address

This field is for notifications of failed orders. Any email addresses entered here will receive notifications when order synchronization fails.

**Recommended**: Use a monitored email address for your integration team.

## Configuration Summary

Once you've configured all basic settings, your integration should include:

- ✅ OrderWise Base URL
- ✅ Credential Hash (base64 encoded)
- ✅ Session ID from your e-commerce session
- ✅ Stock Location ID (if applicable)
- ✅ Customer ID for orders
- ✅ Notification email address

## Next Steps

With basic settings configured, you can now set up:

1. **[Stock Updates](stock-updates.md)** - Configure inventory synchronization
2. **[Payment Mapping](payment-mapping.md)** - Map Shopify payment methods to OrderWise
3. **[Shipping Mapping](shipping-mapping.md)** - Map shipping methods between systems
4. **[Status Mapping](status-mapping.md)** - Configure order status synchronization

## Testing Your Configuration

After setting up basic settings:

1. Check the [Log Manager](troubleshooting.md#log-manager) for any connection errors
2. Try sending a test order from Shopify
3. Verify the order appears in OrderWise
4. Check that notifications are working

---

**Basic settings configured?** Proceed to [Stock Updates](stock-updates.md) to set up inventory synchronization.
