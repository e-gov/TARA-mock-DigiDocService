const express = require('express');
const app = express();
const port = 80;
const fs = require('fs');
const xmlParser = require('express-xml-bodyparser');

//set view engine
app.set('view engine', 'ejs');

//run server
app.listen(port, () => {
    console.log("Server running on port " + port);
})

//endpoint for setting delay
app.get('/delay', (req, res) => {
    console.log("Delay UI rendering triggered")
    res.render('ui');
})

//endpoint for submitting delay
app.get('/submit_delay', (req, res) => {
    console.log("Delay post triggered");
    const delayMS = req.query.delayms;
    if (!delayMS || delayMS == "undefined" || isNaN(delayMS)) {
        console.log("Invalid delay input");
        res.status(404).send("Forbidden input");
        return;
    }
    const obj = {
        delay: delayMS
    }
    fs.writeFile("./config/delay.json", JSON.stringify(obj), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved with delay of " + delayMS + "mS");
        res.status(200).send("Delay time succesfully overwritten to: " + delayMS / 1000);
    });
});

//endpoint for getting current delay value
app.get('/get_delay', (req, res) => {
    console.log("Get delay triggered");
    var timeJob = getDelayFromFile().then(function (delayTimeMs) {
        const delayInS = delayTimeMs / 1000;
        console.log("Get delay response: " + delayInS + "s");
        res.send(delayInS.toString());
    })
});

//xml responses from NORTAL
const mobAuthResponse = '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:dig="http://www.sk.ee/DigiDocService/DigiDocService_2_3.wsdl" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><SOAP-ENV:Header/><SOAP-ENV:Body SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><dig:MobileAuthenticateResponse><Sesscode xsi:type="xsd:int">69394114</Sesscode><Status xsi:type="xsd:string">OK</Status><UserIDCode xsi:type="xsd:string">01234567890</UserIDCode><UserGivenname xsi:type="xsd:string">SEITSMES</UserGivenname><UserSurname xsi:type="xsd:string">TESTNUMBER</UserSurname><UserCountry xsi:type="xsd:string">EE</UserCountry><UserCN xsi:type="xsd:string">TESTNUMBER,SEITSMES,01234567890</UserCN><ChallengeID xsi:type="xsd:string">1419</ChallengeID></dig:MobileAuthenticateResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>\n'
const getMobAuthStatusRes = '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:dig="http://www.sk.ee/DigiDocService/DigiDocService_2_3.wsdl" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><SOAP-ENV:Header/><SOAP-ENV:Body SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><dig:GetMobileAuthenticateStatusResponse><Status xsi:type="xsd:string">USER_AUTHENTICATED</Status><Signature xsi:type="xsd:string"/></dig:GetMobileAuthenticateStatusResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>'

//endpoint for mocked XML querries
app.post('/', xmlParser({trim: true, explixitArray: false}), async (req, res) => {
    console.log("XML POST RECEIVED: " + Object.keys(req.body["soapenv:envelope"]["soapenv:body"][0])[0]);
    res.set('Content-Type', 'text/xml');
    if (Object.keys(req.body["soapenv:envelope"]["soapenv:body"][0])[0].includes(":mobileauthenticate")) {
        getDelayFromFile().then(function (delayTime) {
            getStubResponse(delayTime).then(function (response) {
                console.log("MobileAuthenticate response sent");
                res.send(response);
            })
        });
    } else if (Object.keys(req.body["soapenv:envelope"]["soapenv:body"][0])[0].includes(":getmobileauthenticatestatus")) {
        console.log("GetMobileAuthenticateStatus triggered");
        res.send(getMobAuthStatusRes);
    }
});

//function (with optional delay) for getting mobileAuthenticate response
async function getStubResponse(delayTime) {
    const response = await getResponseBodyAfterTime(delayTime);
    return response;
}

function getResponseBodyAfterTime(delayTime) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mobAuthResponse)
        }, delayTime)
    });
}

//read delay from its original file
function getDelayFromFile() {
    return new Promise(function (resolve, reject) {
        fs.readFile('config/delay.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            }
            dataJson = JSON.parse(data);
            console.log("Response Delay: " + dataJson.delay + "ms");
            resolve(dataJson.delay);
        });
    })
}




