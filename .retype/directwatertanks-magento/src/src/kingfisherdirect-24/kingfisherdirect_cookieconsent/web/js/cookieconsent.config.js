export const config = {
    categories: {
        necessary: {
            enabled: true,
            readOnly: true,
            services: {
                platform: { label: "<b>E-commerce platform.</b/> Provides support for basic e-commerce functions to work properly." },
                security: { label: "<b>Security platforms.</b/> Used by web services providers to protect website from malicious traffic." },
                bot: { label: "<b>Bot protection.</b/> Used by captcha service to remember non-bot traffic." },
            }
        },
        analytics: {
            services: {
                ga: {
                    label: '<b>Google Analytics</b> - identify traffic, analyse website usage, understand audiences',
                    onAccept: () => {
                        window.gtag && window.gtag('consent', 'update', {
                            'analytics_storage': 'granted'
                        })
                    },
                    onReject: () => {
                        window.gtag && window.gtag('consent', 'update', {
                            'analytics_storage': 'denied'
                        })
                    },
                    cookies: [{ name: /^(_ga|_gid)/ }]
                },
                mouseflow: {
                    label: '<b>Mouseflow</b> - to analyse traffic beahaviour across pages and remember sessions',
                    cookies: [{ name: /^(mf_)/ }]
                },
            }
        },
        marketing: {
            services: {
                google_ads: {
                    label: '<b>Google Ads</b> - measure advertising performance, use profiles to select personalised advertising, measure content performance, understand audiences',
                    onAccept: () => {
                        gtag && gtag('consent', 'update', {
                            'ad_user_data': 'granted',
                            'ad_personalization': 'granted',
                            'ad_storage': 'granted'
                        })
                    },
                    onReject: () => {
                        gtag && gtag('consent', 'update', {
                            'ad_user_data': 'denied',
                            'ad_personalization': 'denied',
                            'ad_storage': 'denied'
                        })
                    },
                    cookies: [{ name: /^(NID|ANID|IDE|id|DSID)$/ }]
                },
                bing_ads: {
                    label: '<b>Bing Ads</b> - measure advertising performance, use profiles to select personalised advertising, measure content performance, understand audiences',
                    onAccept: () => {
                        window.uetq = window.uetq || [];
                        window.uetq.push('consent', 'update', {
                            'ad_storage': 'granted'
                        });
                    },
                    onReject: () => {
                        window.uetq = window.uetq || [];
                        window.uetq.push('consent', 'update', {
                            'ad_storage': 'denied'
                        });
                    },
                    cookies: [
                        { name: "MUID" },
                        { name: /^_?_uet/ },
                    ]
                },
                hubspot: {
                    label: '<b>HubSpot</b> - for live chat and various data colletion for website range optimisation, marketing and communication purposes',
                    onAccept: () => {
                        var _hsq = window._hsq = window._hsq || [];
                        _hsq.push(['doNotTrack', { track: true }]);
                    },
                    onReject: () => {
                        var _hsq = window._hsq = window._hsq || [];
                        _hsp.push(['revokeCookieConsent']);
                        _hsq.push(['doNotTrack']);
                    }
                },
                klaviyo: {
                    label: '<b>Klaviyo</b> - measure newsletter performance, understand audiences',
                    onAccept: () => {
                        document.cookie = "__kla_off=; SameSite=None; Secure; Max-Age=-1; Path=/"
                    },
                    onReject: () => {
                        document.cookie = "__kla_off=true; SameSite=None; Secure; Max-Age=2592000; Path=/"
                    }
                },
            }
        },
    },

    language: {
        default: 'en',
        translations: {
            en: {
                consentModal: {
                    title: "Help us to make your shopping experience better",
                    description: "Clicking \"Accept All\" allows us to offer you the best possible shopping experience. It means we'll use cookies and similar technologies to make it easier for you to use our website, personalise content for you, continuously improve security and understand the way you use our website.<br/><br/>Should you choose \"Reject all\" only the cookies that are essential for the website's basic function will used.<br/><br/>If you'd like to tailor your cookie preferences, you can click \"Manage individual preferences\". To read more about our cookie policy or our terms and conditions, click the relevant link below.",
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    showPreferencesBtn: 'Manage Individual preferences',
                    footer: '<a href="/terms-conditions">Terms and Conditions</a> <a href="/privacy-policy">Privacy Policy</a>'
                },
                preferencesModal: {
                    title: 'Manage cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Accept current selection',
                    closeIconLabel: 'Close modal',
                    sections: [
                        {
                            title: 'Storage purpose management',
                            description: 'You can manage here storage choices for various purposes. You can change your preferences at any time'
                        },
                        {
                            title: 'Strictly Necessary cookies',
                            description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: 'necessary',
                            cookieTable: {
                                headers: {
                                    name: "Name",
                                    domain: "Service",
                                    description: "Description",
                                    expiration: "Expiration"
                                },
                                body: [
                                    // php and magento
                                    {
                                        name: "PHPSESSID",
                                        domain: "www.kingfisherdirect.co.uk",
                                        description: "Native PHP application cookie. Used to manage user session, helps to remember basket and checkout data. The cookie is a session cookie and will be deleted when all the browser windows are closed.",
                                        expiration: "6 months"
                                    },
                                    { domain: "www.kingfisherdirect.co.uk", name: "guest-view", description: "Stores the Order ID that guest shoppers use to retrieve their order status. Guest orders view. Used in Orders and Returns widgets.", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "login_redirect", description: "Preserves the destination page that was loading before the customer was directed to log in.", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "mage-messages", description: "Tracks error messages and other notifications that are shown to the user, such as the cookie consent message, and various error messages. The message is deleted from the cookie after it is shown to the shopper. Cleared on frontend when the message is displayed to the user.", expiration: "1 year" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "product_data_storage", description: "Stores configuration for product data related to Recently Viewed / Compared Products.", expiration: "Per local storage rules" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "recently_compared_product", description: "Stores product IDs of recently compared products.", expiration: "Per local storage rules" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "recently_compared_product_previous", description: "Stores product IDs of previously compared products for easy navigation.", expiration: "Per local storage rules" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "recently_viewed_product", description: "Stores product IDs of recently viewed products for easy navigation.", expiration: "Per local storage rules" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "recently_viewed_product_previous", description: "Stores product IDs of recently previously viewed products for easy navigation.", expiration: "Per local storage rules" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "X-Magento-Vary", description: "Configuration setting that improves performance when using static content caching.", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "form_key", description: "A security measure that appends a random string to all form submissions to protect the data from Cross-Site Request Forgery (CSRF).", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "mage-cache-sessid", description: "The value of this cookie triggers the cleanup of local cache storage. When the cookie is removed by the backend application, the Admin cleans up local storage, and sets the cookie value to true.", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "mage-cache-storage", description: "Local storage of visitor-specific content that enables ecommerce functions.", expiration: "Session" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "mage-cache-storage-section-invalidation", description: "Forces local storage of specific content sections that should be invalidated.", expiration: "Per local storage" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "persistent_shopping_cart", description: "Stores the key (ID) of persistent cart to make it possible to restore the cart for an anonymous shopper.", expiration: "10 years" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "private_content_version", description: "Appends a random, unique number and time to pages with customer content to prevent them from being cached on the server.", expiration: "10 years" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "section_data_ids", description: "Stores customer-specific information related to shopper-initiated actions, such as wish list display and checkout information.", expiration: "Session" },

                                    // reviews
                                    { domain: "reviews.co.uk", name: "__cf_bm", description: "Necessary for bot protection", expiration: "30 minutes" },
                                    { domain: "reviews.io", name: "__cf_bm", description: "Necessary for bot protection", expiration: "30 minutes" },

                                    // hubspot
                                    { domain: "hubspot.com", name: "__cf_bm", description: "Necessary for bot protection.", expiration: "30 minutes" },
                                    { domain: "hubspot.com", name: "__cfruid", description: "This cookie is set by HubSpot’s CDN provider because of their rate limiting policies.", expiration: "Session" },
                                    { domain: "hubspot.com", name: "__cfuvid", description: "This cookie is set by HubSpot’s CDN provider because of their rate limiting policies.", expiration: "Session" },

                                    // aws
                                    { domain: "www.kingfisherdirect.co.uk", name: "AWSALBAPP-0", description: "This cookie is used in context with load balancing – This optimises the response rate between the visitor and the site, by distributing the traffic load on multiple network links or servers", expiration: "7 days" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "AWSALBAPP-1", description: "This cookie is used in context with load balancing – This optimises the response rate between the visitor and the site, by distributing the traffic load on multiple network links or servers", expiration: "7 days" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "AWSALBAPP-2", description: "This cookie is used in context with load balancing – This optimises the response rate between the visitor and the site, by distributing the traffic load on multiple network links or servers", expiration: "7 days" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "AWSALBAPP-3", description: "This cookie is used in context with load balancing – This optimises the response rate between the visitor and the site, by distributing the traffic load on multiple network links or servers", expiration: "7 days" },
                                    { domain: "www.kingfisherdirect.co.uk", name: "aws-waf-token", description: "Amazon Web Services Web Application Firewall uses this cookie to help protect this service from malicious traffic. The information gathered is non-unique and can’t be mapped to an individual human being.", expiration: "3 days" },

                                    // recapcha
                                    { domain: "www.kingfisherdirect.co.uk", name: "_grecaptcha", description: "Used for risk analysis in spam protection and may store browsing device information.", expiration: "Per local storage rules" },
                                ]
                            },
                        },
                        {
                            title: 'Performance and Analytics',
                            description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: "Name",
                                    domain: "Service",
                                    description: "Description",
                                    expiration: "Expiration"
                                },
                                body: [
                                    { domain: "kingfisherdirect.co.uk", name: "_ga", description: "Google Analytics sets this cookie to store and count page views.", expiration: "Expires after 1 year" },
                                    { domain: "kingfisherdirect.co.uk", name: "_ga_*", description: "Google Analytics sets this cookie to store and count page views.", expiration: "Expires after 1 year" },
                                    { domain: "kingfisherdirect.co.uk", name: "_gid", description: "Google Analytics sets this cookie to store and count page views.", expiration: "Session" },

                                    // mouseflow
                                    { domain: "kingfisherdirect.co.uk", name: "mf_[website-id]", description: "The cookie contains information about the current session but does not contain any information that can identify the visitor. This cookie is deleted when the session ends, meaning when the user leaves the website.", expiration: "Session" },
                                    { domain: "kingfisherdirect.co.uk", name: "mf_user", description: "This cookie establishes whether the user is a returning or first-time visitor. This is done simply by a yes/no toggle and no further information about the user is stored. ", expiration: "90 days" },
                                ]
                            }
                        },
                        {
                            title: 'Marketing and Advertisement',
                            description: 'Those cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.',
                            linkedCategory: 'marketing',
                            cookieTable: {
                                headers: {
                                    name: "Name",
                                    domain: "Service",
                                    description: "Description",
                                    expiration: "Expiration"
                                },
                                body: [
                                    // google
                                    { domain: "kingfisherdirect.co.uk", name: "_gac_", description: "Google Ads - used to measure user activity and the performance of ads", expiration: "90 days" },

                                    // bing ads
                                    { domain: "kingfisherdirect.co.uk", name: "MUID", description: "This is a Microsoft cookie that contains a GUID assigned to your browser. It gets set when you interact with a Microsoft property, including a UET beacon call or a visit to a Microsoft property through the browser. ", expiration: "1 year" },
                                    { domain: "kingfisherdirect.co.uk", name: "_uetmsclkid", description: "This is the Microsoft Click ID, which is used to improve the accuracy of conversion tracking.", expiration: "Session" },
                                    { domain: "kingfisherdirect.co.uk", name: "_uetsid", description: "This contains the session ID for a unique session on the site. Note: As of as of July 2023, _uetsid has been updated with additional parameters as follows: insights_sessionId, timestamp, pagenumber, upgrade, upload.", expiration: "1 day" },
                                    { domain: "kingfisherdirect.co.uk", name: "_uetvid", description: "UET assigns this unique, anonymized visitor ID, representing a unique visitor. UET stores this data in a first-party cookie. Note: As of as of July 2023, _uetvid has been updated with additional parameters as follows: insights_userId, cookieVersion, expiryTime, consent, cookie_creation_time.", expiration: "1 year" },

                                    // hubspot
                                    { domain: "kingfisherdirect.co.uk", name: "hubspotutk", description: "This cookie keeps track of a visitor's identity. It is passed to HubSpot on form submission and used when deduplicating contacts.", expiration: "6 months" },
                                    { domain: "kingfisherdirect.co.uk", name: "__hstc", description: "The main cookie for tracking visitors.", expiration: "6 months" },
                                    { domain: "kingfisherdirect.co.uk", name: "__hssc", description: "This cookie keeps track of sessions. This is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie. It contains the domain, viewCount (increments each pageView in a session), and session start timestamp.", expiration: "30 minutes" },
                                    { domain: "kingfisherdirect.co.uk", name: "__hssrc", description: "Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser. If this cookie does not exist when HubSpot manages cookies, it is considered a new session.", expiration: "Session" },
                                    { domain: "kingfisherdirect.co.uk", name: "messagesUtk", description: "Used to recognize visitors who chat via livechat tool.", expiration: "6 months" },
                                    { domain: "kingfisherdirect.co.uk", name: "__hs_gpc_banner_dismiss", description: "This cookie is used when the Global Privacy Control banner is dismissed.", expiration: "180 days" },
                                    { domain: "hubspot.com", name: "HUBLYTICS_EVENTS_53", description: "Collects data on visitor behaviour from multiple websites, in order to present more relevant advertisements — this also allows the website to limit the number of times that the visitor is shown the same advertisement.", expiration: "Per local storage rules" },
                                    { domain: "hubspot.com", name: "__hmpl", description: "Collects information on user preferences and/or interaction with web-campaign content — this is used on the CRM-campaign-platform used by website owners for promoting events or products.", expiration: "Per local storage rules" },

                                    // klaviyo
                                    { domain: "kingfisherdirect.co.uk", name: "__kla_id", description: "Track and identify site visitors through an auto-generated ID. This cookie can temporarily hold personally identifiable information", expiration: "2 years" },
                                ],
                            }
                        },
                        {
                            title: 'More information',
                            description: 'For any queries in relation to my policy on cookies and your choices, please <a href="/contact">contact us</a>. More details can be also found on our <a href="/terms-conditions">Terms and Conditions</a> and <a href="/privacy-policy">Privacy Policy</a> pages'
                        }
                    ]
                }
            }
        }
    }
}
