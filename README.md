# mockWebServer
1. Clone repo
2. From command line: 
`npm install`
3. When installation of packages has finished run:
`node app.js`

App will run by default on `port 80`.

To change port go to `app.js` and change the port parameter at the top of the file to whatever port number required.

XML queries can be made to: `http://<server-url>:port/`

Delay value is kept in milliseconds in `config/delay.json`
To change the delay value either edit the file or while the server is running go to: `http://<server-url>:port/delay` in your browser and change its value there.

In order to tell the TARA-SERVER to make querries to this URL change mobileID.serviceUrl in application.properties in the TARA-SERVER to point to the IP of the server.

Mock takes as a input random mobile number and personal code combination, giving always as an output user with personal code "EE01234567890" and name "SEITSMES TESTNUMBER".
