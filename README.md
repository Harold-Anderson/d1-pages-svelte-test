# D1 example
Shows how to query a D1 database in Cloudflare Pages using SvelteKit.
Please note
https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/

Please note that you cannot do development against a remote D1 database using Cloudflare Pages. You must use a local database for development.

## Create a local D1 database
pnpm exec wrangler d1 execute sveltedb --local --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);"

pnpm exec wrangler d1 execute sveltedb --local --command="INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');"

Now your local D1 database is ready to use.

## Build your project
pnpm run build

This creates the compiled output in .sveltekit/cloudflare

## Run your project under wrangler
wrangler pages dev .svelte-kit/cloudflare

The output will be something like

⛅️ wrangler 3.81.0 (update available 3.83.0)
-------------------------------------------------------

✨ Compiled Worker successfully
Your worker has access to the following bindings:
- D1 Databases:
  - DB: sveltedb (DB), Preview: (DB)
[wrangler:inf] Ready on http://127.0.0.1:8788
⎔ Starting local server...                                                                                                                                   
✨ Parsed 2 valid header rules.
[wrangler-UserWorker:wrn] The latest compatibility date supported by the installed Cloudflare Workers Runtime is "2024-10-11",
but you've requested "2024-10-23". Falling back to "2024-10-11"...
Features enabled by your requested compatibility date may not be available.
Upgrade to `wrangler@3.83.0` to remove this warning.
│ [b] open a browser, [d] open Devtools, [c] clear console, [x] to exit  

At this point, you can open a browser and navigate to http://127.0.0.1:8788 or hit b to open a browser.
Surf to http://127.0.0.1:8788/server, and you should see the list of users from the D1 database.

## Deploy your project to Cloudflare Pages
Create remote database:
pnpm exec wrangler d1 execute sveltedb --remote --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);" # Create the table

pnpm exec wrangler d1 execute sveltedb --remote --command="INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');" # Insert a row

Add secrets to your project on Cloudflare if needed by using the dashboard.  No secrets are needed for this project.
wrangler pages deploy .svelte-kit/cloudflare

This will create the d1-test project on Cloudflare Pages.  Now you need to bing the D1 database to the project.  Go to the project settings and add the D1 database.  Do this by clicking on the newly created Pages project and then going to Settings > Variables & Secrets > Bindings.  Click on Add Binding and select the D1 database (sveltedb) you created earlier.  Give it the name DB.  Click Save.

Now you can navigate to https://d1-test.pages.dev/server and you should see the list of users from the D1 database.

{"success":true,"meta":{"served_by":"v3-prod","duration":0.2025,"changes":0,"last_row_id":0,"changed_db":false,"size_after":49152,"rows_read":1,"rows_written":0},"results":[{"id":1,"name":"John Doe","email":"john@example.com"}]}

