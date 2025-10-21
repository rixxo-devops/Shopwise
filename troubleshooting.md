# Troubleshooting

This guide helps you diagnose and resolve common issues with your Shopwise integration. Use this section to troubleshoot problems and monitor your integration health.

## Log Manager

The Log Manager is your primary tool for monitoring and debugging the Shopwise integration.

### Accessing Log Manager

1. Open **ShopWise** in your Shopify admin
2. Navigate to **Log Manager**
3. Review recent log entries for errors or warnings

![Log Manager Interface](images/log-manager-interface.png)

### Understanding Log Entries

**Log Entry Types:**
- **INFO**: Normal operation messages
- **WARNING**: Non-critical issues that should be reviewed
- **ERROR**: Critical issues that prevent operation
- **DEBUG**: Detailed technical information

**Common Log Messages:**
- Connection status updates
- Order synchronization attempts
- Stock update notifications
- Configuration validation results

## Checking App Connection

### Verify Basic Connectivity

1. **Check Log Manager** for connection errors
2. **Verify OrderWise Base URL** is correct and accessible
3. **Test Credential Hash** is properly base64 encoded
4. **Confirm Session ID** exists and is active

### Connection Test Steps

1. Go to **Log Manager** in ShopWise
2. Look for recent connection attempts
3. Check for authentication errors
4. Verify OrderWise API accessibility

**Common Connection Issues:**
- Incorrect base URL format
- Invalid credential hash
- Expired or inactive session ID
- Network connectivity problems

## Sending Orders from Shopify to OrderWise

### Order Synchronization Process

1. **Order Created**: Customer places order in Shopify
2. **ShopWise Processing**: App processes order data
3. **OrderWise Transmission**: Order sent to OrderWise via API
4. **Confirmation**: Order appears in OrderWise system

### Troubleshooting Order Sync

**Orders Not Appearing in OrderWise:**
1. Check **Log Manager** for transmission errors
2. Verify **Session ID** is correct and active
3. Confirm **Customer ID** exists in OrderWise
4. Check **Payment/Shipping Mappings** are configured

**Orders Appearing with Wrong Data:**
1. Review **Payment Mapping** configuration
2. Check **Shipping Mapping** settings
3. Verify **Customer ID** assignment
4. Confirm **Stock Location** settings

### Testing Order Synchronization

1. **Create Test Order**: Place a test order in Shopify
2. **Monitor Logs**: Check Log Manager for processing messages
3. **Verify OrderWise**: Confirm order appears in OrderWise
4. **Check Data Accuracy**: Verify all order details are correct

## SMTP Settings

### Email Notification Configuration

SMTP settings control email notifications for integration issues.

**Common SMTP Issues:**
- Incorrect server settings
- Authentication problems
- Firewall blocking SMTP ports
- Invalid email addresses

### SMTP Troubleshooting

1. **Test SMTP Connection**: Use email client to verify settings
2. **Check Firewall**: Ensure SMTP ports are open
3. **Verify Credentials**: Confirm username/password are correct
4. **Review Logs**: Look for SMTP-related error messages

## Sending Payments

### Payment Processing Issues

**Payment Methods Not Mapping:**
1. Verify **Gateway ID** matches exactly
2. Check **OrderWise Payment ID** is correct
3. Confirm payment method exists in OrderWise
4. Review **Payment Mapping** configuration

**Payment Data Missing:**
1. Check order data in Shopify
2. Verify payment information is captured
3. Review payment processing logs
4. Confirm payment method is supported

## Common Issues and Solutions

### Integration Not Working

**Symptoms:**
- No orders appearing in OrderWise
- Log Manager shows connection errors
- Stock updates not occurring

**Solutions:**
1. **Verify Configuration**: Check all basic settings
2. **Test Connection**: Use Log Manager to diagnose issues
3. **Review Prerequisites**: Ensure all requirements are met
4. **Check OrderWise**: Verify session is active and configured

### Stock Updates Not Working

**Symptoms:**
- Shopify stock levels not updating
- Stock sync errors in logs
- Mismatched inventory levels

**Solutions:**
1. **Check Export Definition**: Verify SQL query returns data
2. **Verify SKU Matching**: Ensure variant codes match exactly
3. **Review Time Window**: Confirm export includes recent changes
4. **Test Export**: Run SQL query directly in OrderWise

### Status Updates Not Working

**Symptoms:**
- Order statuses not updating in Shopify
- Status mapping errors
- Orders stuck in wrong status

**Solutions:**
1. **Verify Export Definition**: Check status export is working
2. **Review Status Mapping**: Ensure text matches exactly
3. **Check Time Window**: Confirm export includes recent changes
4. **Test Status Changes**: Manually change status in OrderWise

### Product Updates Not Working

**Symptoms:**
- Product information not syncing
- Field mapping errors
- Metafield updates failing

**Solutions:**
1. **Check Export Definition**: Verify product export returns data
2. **Review Field Mappings**: Ensure metafields are configured correctly
3. **Verify SKU Matching**: Confirm variant codes match
4. **Test Metafields**: Check metafields exist in Shopify

## Performance Issues

### Slow Integration Performance

**Symptoms:**
- Long processing times
- Timeout errors
- System slowdowns

**Solutions:**
1. **Optimize Export Queries**: Reduce data volume in exports
2. **Adjust Time Windows**: Increase intervals for large datasets
3. **Filter Data**: Use WHERE clauses to limit exported data
4. **Monitor Resources**: Check OrderWise and Shopify performance

### Large Dataset Handling

**For Large Product Catalogs:**
- Filter exports by product categories
- Use incremental updates only
- Consider batch processing
- Monitor database performance

**For High Order Volume:**
- Optimize order processing queries
- Use appropriate time windows
- Monitor API rate limits
- Consider processing schedules

## Error Codes and Messages

### Common Error Messages

**"Connection Failed"**
- Check OrderWise base URL
- Verify network connectivity
- Confirm API accessibility

**"Authentication Failed"**
- Verify credential hash format
- Check username/password encoding
- Confirm user permissions

**"Session Not Found"**
- Verify session ID is correct
- Check session is active in OrderWise
- Confirm session configuration

**"Export Definition Not Found"**
- Verify export definition ID
- Check export exists in OrderWise
- Confirm export is active

### Debugging Steps

1. **Check Log Manager**: Review recent error messages
2. **Verify Configuration**: Confirm all settings are correct
3. **Test Components**: Verify each integration component
4. **Review Documentation**: Check setup guides for missed steps

## Getting Additional Help

### Before Contacting Support

1. **Review This Guide**: Check troubleshooting steps
2. **Check Log Manager**: Gather error details
3. **Document Issues**: Note specific error messages
4. **Test Configuration**: Verify all settings are correct

### Information to Provide

When seeking help, provide:
- Specific error messages from Log Manager
- Configuration details (without sensitive data)
- Steps to reproduce the issue
- Expected vs. actual behavior

### Support Resources

- **Log Manager**: Primary debugging tool
- **Configuration Guides**: Step-by-step setup instructions
- **This Troubleshooting Guide**: Common issues and solutions
- **Integration Testing**: Verification procedures

---

**Need more help?** Review the specific configuration guides or check the Log Manager for detailed error information.
