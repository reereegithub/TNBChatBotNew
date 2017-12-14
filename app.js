/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var request = require('request');
var prompt = require('prompt-sync')();
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var dbstore = require("./modules/dbStore");



/*var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

var q = require('q');
*/
var localContext = {};
var context_var = {};
var token = "<Replace Facebook Token>";

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  'username': '44d8a0fe-c265-49a4-af2c-14e81adea78a',
  'password': 'urizvMnABINP',
  'version_date': '2017-12-06'
});

var formData = {
	'requesttype' : 'job.submit',
	'apikey' : '4LRwch4Eq9t5GZns7RbTRgWoZ1vbttR',
	'authaccountno' : '3648',
	'authusername' : 'PersistentRESTAPI',
	'authpassword' : 'HnE6.zmF',
	'jobtype' : 'phrase',
	'inputtype' : 'Text',
	'jobmode' : 'batch',
	'domaincode' : '1303998',
	'inputtext' : 'Apa khabar'
};

var jsonParseStr = '';

var languageOption = 'en';

var workspace = process.env.WORKSPACE_ID || '09c13306-27f8-455f-9b30-3748eab7cb30';
//var payload = {};
appPost ();
// Endpoint to be call from the client side
function appPost ()
{
app.post('/api/message', function(req, res) {

    if(req.body.context == null || req.body.context == '' || req.body.context =='undefined') {
        console.log("Calling Greeting context");
        setGreetingContext();
    }
  if (!workspace || workspace !== '09c13306-27f8-455f-9b30-3748eab7cb30') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
 

 
  var inputText = req.body.input;
  console.log(inputText);	
  
  if(inputText!==undefined){
	if (req.body.input.text !== 'bm' && req.body.input.text  !== 'en' && languageOption !== 'en') {
		formData = {
			'requesttype' : 'job.submit',
			'apikey' : '4LRwch4Eq9t5GZns7RbTRgWoZ1vbttR',
			'authaccountno' : '3648',
			'authusername' : 'PersistentRESTAPI',
			'authpassword' : 'HnE6.zmF',
			'jobtype' : 'phrase',
			'inputtype' : 'Text',
			'jobmode' : 'batch',
			'domaincode' : '1303998',
			'inputtext' : inputText.text
		};		
		jobSubmit(req,res);
		
	} else {
		if(req.body.input.text  == 'bm' || req.body.input.text  == 'en')
		{
			languageOption = req.body.input.text ;
		}
		

		sendToWC(req,res,inputText );
	}  	  
  }
  else
  {
	 sendToWC(req,res,inputText ); 
  }


});	
}



function sendToWC(req,res,inputText)
{
	console.log("in sendToWC");
	
	var payload = {
		workspace_id: workspace,
		context: req.body.context || localContext,
		input : inputText || {}
	  };	
	
	//console.log(payload);
	  // Send the input to the conversation service
	conversation.message(payload, function(err, finalResponse) {
	  console.log("inside conversation message.....");
/*if ( err ) {
			return res.status(err.code >= 100 && err.code < 600 ? err.code : 500);//res.status( err.code || 500 ).json( err );
		 }
	*/	 
   if (err) {
  	  console.log("I am in error .......... ",err);
		return res.status(500).json(err);
    }	
	else {
		var flag = 0;
            var rsText ='';
             rsText = String(finalResponse.output.text[1]);

             if(rsText == 'undefined' || rsText == '') {
              rsText = String(finalResponse.output.text[0]);
              flag = 1;
             }
             
             
              if (rsText.indexOf('ReplaceBalance') !== -1) {
                console.log("Inside replace balace");

                 dbstore.getBalance(finalResponse.context.number, function(error,data){
                     if(error) {
                       throw err;
                     }
                     console.log("Balance is ",data[0].balance);
                     if (flag == 1)
                      finalResponse.output.text[0]="Your current outstanding balance is RM "+ data[0].balance;
                     else
                          finalResponse.output.text[1]="Your current outstanding balance is RM "+ data[0].balance;
 
                    
									 }); //db store bracket 
										
									 	var timeout= setInterval(function() {
										console.log("Data submitted successfully.");
										clearInterval(timeout);  
											return res.status( 200 ).json( finalResponse );
									   },4000);
	
               }    else {
								 return res.status( 200 ).json( finalResponse );
							 }       
		
	}	
	
	
	
	  
 /*   if (err) {
      return res.status(err.code || 500).json(err);
    }
    return res.json(updateMessage(payload, data)); */
  });
  
}

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
	//console.log(input);
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
	  
          var flag = 0;
            var rsText ='';
             rsText = String(response.output.text[1]);

             if(rsText == 'undefined' || rsText == '') {
              rsText = String(response.output.text[0]);
              flag = 1;
             }
             
             
              if (rsText.indexOf('ReplaceBalance') !== -1) {
                console.log("Inside replace balace");
                 dbstore.getBalance(response.context.number, function(error,data){
                     if(error) {
                       throw err;
                     }
                     console.log("LALA Balance is ",data[0].balance);
					 console.log("flag="+flag);
                     if (flag == 1){
						response.output.text[0]="Your current outstanding balance is RM "+ data[0].balance;
					 }else{
                        response.output.text[1]="Your current outstanding balance is RM "+ data[0].balance;
					}
                    console.log(response);
				   return response;
                   }); //db store bracket 
				   
               }  

console.log("2:response="+response);
 return response;				   
	
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  console.log("LAST:response="+responseText);
  response.output.text = responseText;
  return response;
}


/*
 * Submit Job
 */
function jobSubmit(req, response) {
	//console.log("START!!!!!!!!!");
	request.post({

		url : 'https://lsapi.languagestudio.com/lsrestapi/LSRESTAPI.V4.jsp',
		formData : formData
	}, function (err, httpResponse, body) {
		if (err) {
			return console.error('Failed:', err);
		}
		//console.log('Successful!  Server responded with:', body);

		var objectFromParse = JSON.parse(body);
		//console.log(objectFromParse);
		var stringObj = JSON.stringify(objectFromParse.result.jobs[0]);
		jsonParseStr = JSON.parse(stringObj);
		//console.log(jsonParseStr.jobid);

		if (err) {
			console.log(err);
			jobSubmit(req, response);
			return;
		}
		var jobid = jsonParseStr.jobid;
		//console.log("jobid=" + jobid);
		return jobStatus(req, response);
	});

}
/*
 * Checking Job Status
 */
function jobStatus(req, response) {

	request('https://lsapi.languagestudio.com/lsrestapi/LSRESTAPI.V4.jsp?apikey=4LRwch4Eq9t5GZns7RbTRgWoZ1vbttR&authaccountno=3648&authusername=PersistentRESTAPI&authpassword=HnE6.zmF&requesttype=job.status&jobidlist=' + jsonParseStr.jobid + '&detaillevel=1', function (error, response2, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response2 && response2.statusCode); // Print the response status code if a response was received
		//console.log('body:', body); // Print the HTML for the Google homepage.

		var objectFromParse = JSON.parse(body);
		console.log(objectFromParse);
		var stringObj = JSON.stringify(objectFromParse.result.jobs[0]);
		jsonParseStr = JSON.parse(stringObj);
		console.log("jobstatusname=" + jsonParseStr.jobstatusname);
		if (jsonParseStr.jobstatusname !== 'Complete') {
			//console.log("Status not completed!!!!!");
			jobStatus(req, response);
			return;
		}
		return jobDownload(req, response);

	});

}

/*
 * Checking Job Download
 */
function jobDownload(req, response) {

	request('https://lsapi.languagestudio.com/lsrestapi/LSRESTAPI.V4.jsp?apikey=4LRwch4Eq9t5GZns7RbTRgWoZ1vbttR&authaccountno=3648&authusername=PersistentRESTAPI&authpassword=HnE6.zmF&requesttype=job.download&jobidlist=' + jsonParseStr.jobid, function (error, response3, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response3 && response3.statusCode); // Print the response status code if a response was received
		//console.log('body:', body); // Print the HTML for the Google homepage.


		if (error) {
			console.log(error);
			jobDownload(req, response);
			return;
		}
		var objectFromParse = JSON.parse(body);
		//console.log(objectFromParse);
		var stringObj = JSON.stringify(objectFromParse.result.jobs[0]);
		jsonParseStr = JSON.parse(stringObj);
		//console.log("description=" + jsonParseStr.description);
		return readFile(req, response);

	});

}

/*
 * Read download file
 */
function readFile(req, response) {

	request(jsonParseStr.description, function (error, response4, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response4 && response4.statusCode); // Print the response status code if a response was received
		//console.log('body:', body); // Print the HTML for the Google homepage.

		if (error) {
			console.log(error);
			readFile(req, response);
			return;
		}
		//var objectFromParse = JSON.parse(body);
		console.log(body);
		var toEN = { text: body };
		//console.log("toEN="+toEN);

		//return toEN;
		var res = sendToWC(req, response, toEN);
		return res;

	});

}


function setGreetingContext() {
    var myDate = new Date();
    var hrs = myDate.getHours();

    var greet;

    if (hrs < 12)
        greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good Evening';
	console.log("greet="+greet);
    localContext.time_of_day=greet;
}


module.exports = app;
