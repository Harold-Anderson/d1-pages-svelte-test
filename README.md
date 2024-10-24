# D1 example
Shows how to query a D1 database in Cloudflare Pages using SvelteKit. I put this together to help me understand how to use D1 in Cloudflare Pages.  I found the documentation about Workers, Pages, D1, and SvelteKit to be a bit scattered.  I hope this example will help others.  If you find anything that is unclear, please let me know.  I will try to improve it. I don't want you to spend time trying to untangle the Cloudflare and SvelteKit documentation.  That's why I put this together.

Please note https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/

Please note that you [cannot do development](https://developers.cloudflare.com/d1/build-with-d1/local-development/) against a remote D1 database using Cloudflare Pages. You must use a local database for development.  

## Create a local D1 database

I use pnpm because it is faster and more flexible.  ``pnpm exec wrangler`` will run the locally installed version of wrangler, rather than the globally installed wrangler.

`` pnpm exec wrangler d1 execute sveltedb --local --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);" ``

``
pnpm exec wrangler d1 execute sveltedb --local --command="INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');"
``

Now your local D1 database is ready to use.

## Build your project
``pnpm run build``

This directs Svelte and Vite to create the compiled Javascript output in  ``.sveltekit/cloudflare``

## Run your project under wrangler
``pnpm exec wrangler pages dev .svelte-kit/cloudflare``

The output will be something like
```
⛅️ wrangler 3.81.0 (update available 3.83.0)
-------------------------------------------------------

✨ Compiled Worker successfully
Your worker has access to the following bindings:
- D1 Databases:
  - DB: sveltedb (DB), Preview: (DB)
[wrangler:inf] Ready on http://127.0.0.1:8788
⎔ Starting local server...                                                                                                                                   
✨ Parsed 2 valid header rules.

│ [b] open a browser, [d] open Devtools, [c] clear console, [x] to exit  
```

At this point, you can open a browser and navigate to http://127.0.0.1:8788 or hit b to open a browser.
Surf to http://127.0.0.1:8788/server, and you should see the list of users from the D1 database.

## Deploy your project to Cloudflare Pages
Create the remote database on the Cloudflare Pages dashboard.  Click on ``Workers & Pages`` and then ``D1 Databases``.  Click on ``Create Database``.  Give it the name ``sveltedb``.  Click ``Create Database``.  Copy the Database ID and put it in your wrangler.toml file, overwriting mine.

Now you can create the tables and insert data into the remote database.
```
pnpm exec wrangler d1 execute sveltedb --remote --command="CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);" # Create the table

pnpm exec wrangler d1 execute sveltedb --remote --command="INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');" # Insert a row
```

Add secrets to your project on Cloudflare if needed by using the dashboard.  No secrets are needed for this project.

`` pnpm exec wrangler pages deploy .svelte-kit/cloudflare ``

This will create the `d1-test` project on Cloudflare Pages.  Now you need to bind the D1 database to the project.  Go to the project settings and add the D1 database.  On the newly created Pages project in the [Cloudflare Dashboard](https://dash.cloudflare.com), click on your project and go to ``Settings > Variables & Secrets > Bindings.``  Click on ``Add Binding`` and select the D1 database ``sveltedb`` you created earlier.  Give it the name ``DB``.  Click Save.

Now you can navigate to [https://xxxxx.d1-test-xxx.pages.dev/server](https://e2f02460.d1-test-2f2.pages.dev/server) and you should see the list of users from the D1 database.  The deployment url will be different for you, and you can see it

```
{"success":true,"meta":{"served_by":"v3-prod","duration":0.2025,"changes":0,"last_row_id":0,"changed_db":false,"size_after":49152,"rows_read":1,"rows_written":0},"results":[{"id":1,"name":"John Doe","email":"john@example.com"}]}
```

There is a real-time log you can enable. This is useful for debugging.  Unfortunately, is is difficult to find and not documented for Pages.  Here is the URL.  Substitute your own user id. https://dash.cloudflare.com/your-user-id/pages/view/d1-test

I have been told by Cloudflare employees on Discord that Pages is merging into Workers.  What this will mean for the `adapter-cloudflare` adapter that is used in `svelte.config.js` (and which is [recommended by Svelte](https://svelte.dev/docs/kit/adapter-cloudflare)) is not clear. 