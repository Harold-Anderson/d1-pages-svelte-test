# D1 example
Shows how to query a D1 database in Cloudflare Pages using SvelteKit. I put this together to help me understand how to use D1 in Cloudflare Pages.  I found the documentation about Workers, Pages, D1, and SvelteKit to be a bit scattered.  I hope this example will help others.  If you find anything that is unclear, please let me know.  I will try to improve it. I don't want you to spend time trying to untangle the Cloudflare and SvelteKit documentation.  That's why I put this together.

Please note https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/

Please note that you [cannot do development](https://developers.cloudflare.com/d1/build-with-d1/local-development/) against a remote D1 database using Cloudflare Pages. You must use a local database for development.  

## Setup

I use pnpm because it is faster and more flexible than npm.  ``pnpm exec wrangler`` will run the locally installed version of wrangler, rather than the globally installed wrangler.

Clone my repository: 
```
git clone https://github.com/Harold-Anderson/d1-pages-svelte-test.git
cd d1-pages-svelte-test
```

Install the dependencies
```
pnpm i
```
Log in to wrangler

```
pnpm exec wrangler login
```

## Create a local D1 database

Now let's populate the local database.  You do not have to create the database using  ``wrangler d1 create`` for a local database, as you will shortly do for the remote database.  You only need to make sure that the name of the database is specified in your ``wrangler.toml`` file.  The database will be created when you run the ``wrangler d1 execute`` command for the first time.


``` 
   pnpm exec wrangler d1 execute sveltedb --local 
     --command="CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT);" 
```
```
   pnpm exec wrangler d1 execute sveltedb --local 
     --command="INSERT INTO users (name, email) 
     VALUES ('John Doe', 'john@example.com');"
```

Now your local D1 database is ready to use.  
## Build your project
``pnpm run build``

This directs Svelte and Vite to create the compiled Javascript output in  ``.svelte-kit/cloudflare``.  The reason the output is put into ``.svelte-kit/cloudflare`` is because the project uses the ``adapter-cloudflare`` adapter.  This is specified in ``svelte.config.js``.

## Run your project under wrangler
```
pnpm exec wrangler pages dev .svelte-kit/cloudflare
```

It is important to understand that the project is being run in a simulated Cloudflare execution environment, and that the Javascript files that are being executed are the ones that ``pnpm run build`` created.  This is not the same as running ``pnpm run dev``, which would run the project under Vite and Node.js.

wrangler simulates the deployment environment as much as possible.  For instance, the backend is [workerd](https://blog.cloudflare.com/workerd-open-source-workers-runtime/), not Node.js, which is what ``vite`` and ``pnpm run dev`` would use.  The output will be:

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
Now we need to create the remote database.  You can either do this via the dashboard or via the command line. 
In the Cloudflare Dashboard, click on ``Workers & Pages`` and then ``D1 SQL Database``.  Click on ``Create``.  Give it the name ``sveltedb``.  Click ``Create``. 
Alternatively,

```
pnpm exec wrangler d1 create sveltedb
```

In both cases, you will get a database id.  Copy that into ``wrangler.toml``, overwriting mine. Now you can create the tables and insert data into the remote database.
```
pnpm exec wrangler d1 execute sveltedb --remote 
   --command="CREATE TABLE IF NOT EXISTS 
   users (name TEXT, email TEXT);" 
```
```
pnpm exec wrangler d1 execute sveltedb --remote 
   --command="INSERT INTO users (name, email) 
   VALUES ('John Doe', 'john@example.com');" 
```

Add secrets to your project on Cloudflare if needed by using the dashboard.  No secrets are needed for this project. Secrets are runtime environment variables that are not included in the source code.  They are used to store sensitive information such as API keys, database passwords, etc.  They are encrypted and stored in the Cloudflare dashboard. While doing local development, you can set secrets in a .dev.vars file.  Add the ``.dev.vars`` file to your .gitignore file to prevent it from being checked into source control.  The .dev.vars file is not used when deploying to Cloudflare Pages.  The secrets are set in the Cloudflare dashboard. 

https://developers.cloudflare.com/workers/wrangler/commands/#deploy-1

```
pnpm exec wrangler pages deploy .svelte-kit/cloudflare --branch production
```

This will create the `d1-test` project on Cloudflare Pages.  Now you need to bind the D1 database to the project.  Go to the project settings and add the D1 database.  On the newly created Pages project in the [Cloudflare Dashboard](https://d1-test-2f2.pages.dev/server), click on your project and go to ``Settings > Variables & Secrets > Bindings.``  Click on ``Add Binding`` and select the D1 database ``sveltedb`` you created earlier.  Give it the name ``DB``.  Click Save.

Now you can navigate to [https://xxxxx.d1-test-xxx.pages.dev/server](https://d1-test-2f2.pages.dev/server) and you should see the list of users from the D1 database.  The deployment url will be different for you.  Here is the output:

```
{
  "success": true,
  "meta": {
    "served_by": "v3-prod",
    "duration": 0.1875,
    "changes": 0,
    "last_row_id": 0,
    "changed_db": false,
    "size_after": 49152,
    "rows_read": 1,
    "rows_written": 0
  },
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

There is a real-time log you can enable. This is useful for debugging.  Unfortunately, is is difficult to find and not documented for Pages.  Here is the URL.  Substitute your own user id. https://dash.cloudflare.com/your-user-id/pages/view/d1-test

I have been told by Cloudflare employees on Discord that Pages is merging into Workers.  What this will mean for the `adapter-cloudflare` adapter that is used in `svelte.config.js` (and which is [recommended by Svelte](https://svelte.dev/docs/kit/adapter-cloudflare)) is not clear. 