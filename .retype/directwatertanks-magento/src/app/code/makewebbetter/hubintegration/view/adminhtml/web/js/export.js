/**
 * Makewebbetter
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the End User License Agreement (EULA)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://makewebbetter.com/license-agreement.txt
 *
 * @category    Makewebbetter
 * @package     Makewebbetter_HubIntegration
 * @author      Makewebbetter Core Team <connect@makewebbetter.com>
 * @copyright   Copyright Makewebbetter (http://makewebbetter.com/)
 * @license     https://makewebbetter.com/license-agreement.txt
 */

define(
    [
        'jquery',
        'Magento_Ui/js/modal/confirm'
    ], function ($, confirmation) {
    return function (config) {
        /**
         * Export click
         */
        $('#hubspot-export').on('click', function () {
            // Get selected options
            var exportProducts = $('#export-products').is(':checked') ? 1 : 0;
            var exportContacts = $('#export-contacts').is(':checked') ? 1 : 0;
            var exportOrders = $('#export-orders').is(':checked') ? 1 : 0;
            var exportQuotes = $('#export-quotes').is(':checked') ? 1 : 0;
            
            // Check if at least one option is selected
            if (!exportProducts && !exportContacts && !exportOrders) {
                alert($.mage.__('Please select at least one export option.'));
                return;
            }
            
            // Build URL with parameters
            var baseUrl = exportQuotes ? config.exportUrlWithAbandonedCart : config.exportUrlWithoutAbandonedCart;
            var urlWithParams = baseUrl + '&export_products=' + exportProducts + 
                               '&export_contacts=' + exportContacts + 
                               '&export_orders=' + exportOrders;
            
            // Navigate to the URL
            window.location.href = urlWithParams;
        });
    }
});


