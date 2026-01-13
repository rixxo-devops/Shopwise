# Testing Your WordPress Cron Job

Quick guide to verify your cron job is working properly.

## Method 1: Verify Cron Job is Listed (Quick Check)

1. **Access SSH Terminal in RunCloud**:
   - Use RunCloud's built-in terminal
   - Or connect via SSH

2. **Check if cron job exists**:
   ```bash
   crontab -l
   ```
   You should see your WordPress cron job listed (something like `*/15 * * * * /usr/bin/php /home/runcloud/webapps/...`)

## Method 2: Test the Command Manually (Immediate Test)

Run the cron command manually to see if it works:

1. **In SSH Terminal**:
   ```bash
   /usr/bin/php /home/runcloud/webapps/[YOUR-APP-NAME]/public/wp-cron.php
   ```
   Replace `[YOUR-APP-NAME]` with your actual app name.

2. **What to expect**:
   - If it works: Command completes with no errors (or minimal output)
   - If there's an error: You'll see error messages

## Method 3: Check Cron Execution Logs

### Option A: Check System Cron Logs

```bash
# View recent cron activity
grep CRON /var/log/syslog | tail -20

# Or on some systems:
grep CRON /var/log/cron | tail -20
```

Look for entries showing your WordPress cron job running.

### Option B: Create a Log File (Recommended)

Modify your cron job to log output. Edit the cron job:

```bash
crontab -e
```

Change from:
```bash
*/15 * * * * /usr/bin/php /home/runcloud/webapps/[APP]/public/wp-cron.php >/dev/null 2>&1
```

To:
```bash
*/15 * * * * /usr/bin/php /home/runcloud/webapps/[APP]/public/wp-cron.php >> /home/runcloud/webapps/[APP]/logs/wp-cron.log 2>&1
```

Then check the log:
```bash
tail -f /home/runcloud/webapps/[APP]/logs/wp-cron.log
```

## Method 4: Use WordPress Plugin (Easiest Visual Check)

1. **Install WP Crontrol Plugin**:
   - In WordPress admin, go to **Plugins** → **Add New**
   - Search for "WP Crontrol"
   - Install and activate

2. **Check Cron Events**:
   - Go to **Tools** → **Cron Events**
   - You'll see all scheduled WordPress events
   - Check the "Next Run" times - they should update when cron runs
   - You can also manually run events to test

3. **What to look for**:
   - Events should have "Next Run" times in the future
   - After cron runs, "Next Run" times update
   - You can see when events last executed

## Method 5: Check WordPress Debug Log

If you have WordPress debugging enabled:

1. **Check debug log**:
   ```bash
   tail -f /home/runcloud/webapps/[APP]/public/wp-content/debug.log
   ```
   (If debug logging is enabled in wp-config.php)

## Method 6: Monitor in Real-Time

Watch cron execute in real-time:

1. **Set up logging** (if not already done):
   Edit cron job to include logging:
   ```bash
   */15 * * * * /usr/bin/php /home/runcloud/webapps/[APP]/public/wp-cron.php >> /tmp/wp-cron-test.log 2>&1
   ```

2. **Watch the log**:
   ```bash
   tail -f /tmp/wp-cron-test.log
   ```

3. **Wait for next cron run** (up to 15 minutes if using `*/15` schedule)

## Method 7: Force Immediate Test

Test immediately without waiting:

1. **Manually trigger cron**:
   ```bash
   /usr/bin/php /home/runcloud/webapps/[APP]/public/wp-cron.php
   ```

2. **Or use WP-CLI** (if available):
   ```bash
   cd /home/runcloud/webapps/[APP]/public
   wp cron event run --due-now
   ```

3. **Check WordPress**:
   - If you have scheduled posts, check if they published
   - Check plugin updates
   - Check any scheduled tasks

## Quick Verification Checklist

Run these commands to verify everything:

```bash
# 1. Check cron job exists
crontab -l | grep wp-cron

# 2. Check DISABLE_WP_CRON is set
grep DISABLE_WP_CRON /home/runcloud/webapps/[APP]/public/wp-config.php

# 3. Test the command works
/usr/bin/php /home/runcloud/webapps/[APP]/public/wp-cron.php

# 4. Check file exists and is readable
ls -la /home/runcloud/webapps/[APP]/public/wp-cron.php

# 5. Check PHP path is correct
which php
```

## What Success Looks Like

✅ **Cron job is working if**:
- `crontab -l` shows your cron job
- Manual execution of the command completes without errors
- WP Crontrol plugin shows events with future "Next Run" times
- Scheduled WordPress tasks (posts, updates, etc.) execute on time
- No errors in logs

❌ **Cron job NOT working if**:
- Command produces errors when run manually
- WP Crontrol shows events never running
- Scheduled tasks don't execute
- Errors in system logs

## Troubleshooting

### If cron job doesn't appear in `crontab -l`:
- Make sure you saved it in RunCloud's cron manager
- Or make sure you saved after `crontab -e`

### If command fails when run manually:
- Check PHP path: `which php`
- Check WordPress path is correct
- Check file permissions
- Check DISABLE_WP_CRON is set in wp-config.php

### If cron runs but WordPress events don't execute:
- Verify `DISABLE_WP_CRON` is set to `true` in wp-config.php
- Check WordPress debug log for errors
- Verify cron is running as the correct user

## Recommended: Install WP Crontrol

The easiest way to monitor cron is with the **WP Crontrol** plugin:
1. Install it from WordPress admin
2. Go to **Tools** → **Cron Events**
3. You'll see all scheduled events and can verify they're running


