# Setting Up Proper WordPress Cron Job in RunCloud

WordPress's default WP-Cron runs on page visits, which is unreliable. Setting up a proper system cron job ensures your scheduled tasks run on time.

## Why Replace WordPress Cron?

- **WP-Cron is unreliable**: Only runs when someone visits your site
- **Can cause performance issues**: Runs during page loads
- **System cron is better**: Runs on schedule regardless of traffic
- **More predictable**: Runs exactly when scheduled

## Step 1: Disable WordPress WP-Cron

First, we need to disable WordPress's built-in cron system.

### Method A: Via wp-config.php (Recommended)

1. **In RunCloud Dashboard**:
   - Go to your WordPress application
   - Click on **File Manager** or use SSH terminal
   - Navigate to your WordPress root directory (usually `/home/runcloud/webapps/[app-name]/public`)

2. **Edit wp-config.php**:
   - Find `wp-config.php` in the root directory
   - Open it for editing
   - Add this line **BEFORE** the line that says `/* That's all, stop editing! Happy publishing. */`:
   
   ```php
   define('DISABLE_WP_CRON', true);
   ```

3. **Example wp-config.php**:
   ```php
   // ... other defines ...
   
   define('DISABLE_WP_CRON', true);
   
   /* That's all, stop editing! Happy publishing. */
   ```

### Method B: Via SSH/File Manager

If you prefer using the file manager or SSH:
- The file is at: `/home/runcloud/webapps/[your-app-name]/public/wp-config.php`
- Add the same line as above

## Step 2: Set Up System Cron Job in RunCloud

### Option 1: Using RunCloud's Cron Job Manager (Easiest)

1. **Access Cron Jobs in RunCloud**:
   - Log into RunCloud dashboard
   - Go to your server
   - Look for **Cron Jobs** or **Scheduled Tasks** section
   - Click **Add Cron Job** or **New Cron Job**

2. **Configure the Cron Job**:
   - **Command**: 
     ```bash
     /usr/bin/php /home/runcloud/webapps/[your-app-name]/public/wp-cron.php
     ```
     Replace `[your-app-name]` with your actual app name
   
   - **Schedule**: `*/15 * * * *` (runs every 15 minutes)
     - Or `*/5 * * * *` for every 5 minutes (more frequent)
     - Or `0 * * * *` for every hour
   
   - **User**: Usually `runcloud` or `rc` (check RunCloud settings)

3. **Common Cron Schedules**:
   ```
   */5 * * * *   - Every 5 minutes
   */15 * * * *  - Every 15 minutes (recommended)
   */30 * * * *  - Every 30 minutes
   0 * * * *     - Every hour
   0 */2 * * *   - Every 2 hours
   ```

### Option 2: Using SSH to Edit Crontab Directly

1. **Access SSH Terminal in RunCloud**:
   - Use RunCloud's built-in terminal
   - Or connect via SSH: `ssh runcloud@157.245.42.86`

2. **Edit Crontab**:
   ```bash
   crontab -e
   ```

3. **Add WordPress Cron Job**:
   Add this line to the crontab:
   ```bash
   */15 * * * * /usr/bin/php /home/runcloud/webapps/[your-app-name]/public/wp-cron.php >/dev/null 2>&1
   ```
   
   Replace `[your-app-name]` with your actual WordPress app name.

4. **Save and Exit**:
   - If using `nano`: Press `Ctrl+X`, then `Y`, then `Enter`
   - If using `vi`: Press `Esc`, type `:wq`, press `Enter`

### Option 3: Using WP-CLI (If Available)

If WP-CLI is installed in RunCloud:

1. **Create Cron Job**:
   ```bash
   */15 * * * * cd /home/runcloud/webapps/[your-app-name]/public && /usr/local/bin/wp cron event run --due-now --path=/home/runcloud/webapps/[your-app-name]/public >/dev/null 2>&1
   ```

## Step 3: Find Your WordPress App Name

If you're not sure of your app name:

1. **In RunCloud Dashboard**:
   - Go to **Web Applications**
   - Your WordPress app will be listed with its name
   - Note the exact name

2. **Via SSH**:
   ```bash
   ls -la /home/runcloud/webapps/
   # or
   ls -la /home/rc/webapps/
   ```
   This will show all your web applications.

3. **Check wp-config.php location**:
   ```bash
   find /home -name "wp-config.php" 2>/dev/null
   ```

## Step 4: Verify the Cron Job is Working

### Check if Cron is Running

1. **View Current Cron Jobs**:
   ```bash
   crontab -l
   ```
   You should see your WordPress cron job listed.

2. **Test the Command Manually**:
   ```bash
   /usr/bin/php /home/runcloud/webapps/[your-app-name]/public/wp-cron.php
   ```
   If it runs without errors, it's working.

3. **Check Cron Logs** (if logging is enabled):
   ```bash
   tail -f /var/log/cron
   # or
   grep CRON /var/log/syslog
   ```

### Monitor WordPress Cron Events

You can also check if WordPress cron events are running:

1. **Install a Plugin** (optional):
   - **WP Crontrol** - View and manage WordPress cron events
   - Shows all scheduled events and when they last ran

2. **Check via WP-CLI** (if available):
   ```bash
   wp cron event list
   ```

## Step 5: Common Issues and Solutions

### Issue: Cron Job Not Running

**Check PHP Path**:
```bash
which php
# Should show something like: /usr/bin/php or /usr/local/bin/php
```

**Check File Permissions**:
```bash
ls -la /home/runcloud/webapps/[your-app-name]/public/wp-cron.php
# Should be readable
```

**Check WordPress Path**:
```bash
test -f /home/runcloud/webapps/[your-app-name]/public/wp-cron.php && echo "File exists" || echo "File not found"
```

### Issue: Permission Denied

**Run as Correct User**:
- Make sure the cron job runs as the same user that owns WordPress files
- Usually `runcloud` or `rc` user
- Check with: `ls -la /home/runcloud/webapps/[your-app-name]/public/`

### Issue: WordPress Still Using WP-Cron

**Verify DISABLE_WP_CRON is Set**:
```bash
grep DISABLE_WP_CRON /home/runcloud/webapps/[your-app-name]/public/wp-config.php
```
Should show: `define('DISABLE_WP_CRON', true);`

## Recommended Setup

For most WordPress sites, this is the recommended setup:

1. **Cron Schedule**: Every 15 minutes (`*/15 * * * *`)
2. **Command**: 
   ```bash
   /usr/bin/php /home/runcloud/webapps/[your-app-name]/public/wp-cron.php >/dev/null 2>&1
   ```
3. **wp-config.php**: Has `define('DISABLE_WP_CRON', true);`

## Alternative: More Advanced Cron with Logging

If you want to log cron runs for debugging:

```bash
*/15 * * * * /usr/bin/php /home/runcloud/webapps/[your-app-name]/public/wp-cron.php >> /home/runcloud/webapps/[your-app-name]/logs/wp-cron.log 2>&1
```

This will create a log file you can check later.

## Quick Setup Checklist

- [ ] Disable WP-Cron in `wp-config.php` (`define('DISABLE_WP_CRON', true);`)
- [ ] Find your WordPress app name in RunCloud
- [ ] Create cron job in RunCloud (every 15 minutes recommended)
- [ ] Verify cron job is listed (`crontab -l`)
- [ ] Test the command manually
- [ ] Monitor to ensure it's working

## Need Help?

If you need assistance:
1. Share your WordPress app name from RunCloud
2. Share the output of `which php` and `crontab -l`
3. Check RunCloud's documentation for their specific cron interface


