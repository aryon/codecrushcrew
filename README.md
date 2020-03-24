# Configure

0. After cloning the repo, execute `npm i` to install node modules
1. [Create a test project](https://dashboard.swoop.email) on swoop for your local env and set the value of Redirct URL to https://**[subdomain]**.ngrok.io/auth/swoop/callback
2. Rename .env.sample to .env
3. Replace the value of `CLIENT_ID` value with the Client ID of your new swoop property
4. Replace the value of `CLIENT_SECRET` value with the Client Secret of your new swoop property
5. Replace the value of `CALLBACK_URL` with your ngrok address https://**[subdomain]**.ngrok.io
6. Ask ME for the value of `MONGO_DB_URL`

# Run

1. Make sure ngrok is running on port 5000 `ngrok http -subdomain=[subdomain] 5000`
2. Run `heroku local`
3. Open the browser and head to https://**[subdomain]**.ngrok.io

# Updating

1. To update the pages, just open **pagename**.ejs in the views folder
2. The main `layout.ejs` contains the wrapper code (js/css/font includes, etc...)
3. All assets live in the public folder
