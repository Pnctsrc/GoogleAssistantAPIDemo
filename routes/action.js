var express = require('express');
var router = express.Router();

var Session = require('../models/session');

router.post('/test', processFulfillment);

router.get('/test', processFulfillment);

function processFulfillment(req, res) {
    console.log(req.body);

    const intent = req.body.queryResult.intent.displayName;
    const response = {};
    const session_id = req.body.session;

    switch (intent) {
        case "getKeyword":
            const keyword = req.body.queryResult.parameters.keyword;
            response.fulfillmentText = `You said ${keyword}. I can tell you the length of it, or I can tell you the last character of it. Which one would you like to know?`;
            
            Session.findOne({ session: session_id }, function (err, session_obj) {
                if (err) {
                    response.fulfillmentText = "Something went wrong";
                    res.json(response);
                } else {
                    if (session_obj) {
                        session_obj.keyword = keyword;
                        session_obj.save(function (err) {
                            if (err) {
                                response.fulfillmentText = "Something went wrong";
                            }

                            res.json(response);
                        })
                    } else {
                        //store the information
                        const session = new Session({
                            session: session_id,
                            keyword: keyword,
                        })

                        session.save(function (err) {
                            if (err) {
                                response.fulfillmentText = "Something went wrong";
                            }

                            res.json(response);
                        })
                    }          
                }
            })

            break;
        case "Length":
            Session.findOne({ session: session_id }, function (err, session_obj) {
                if (err || !session_obj) {
                    response.fulfillmentText = "Something went wrong";
                    res.json(response);
                } else {
                    response.fulfillmentText = `The length of the keyword ${session_obj.keyword} is ${session_obj.keyword.length}. Thanks for using! Goodbye!`;
                    res.json(response);
                }
            })

            break;
        case "Last character":
            Session.findOne({ session: session_id }, function (err, session_obj) {
                if (err || !session_obj) {
                    response.fulfillmentText = "Something went wrong";
                    res.json(response);
                } else {
                    response.fulfillmentText = `The last character of the keyword ${session_obj.keyword} is ${session_obj.keyword.charAt(session_obj.keyword.length - 1)}. Thanks for using! Goodbye!`;
                    res.json(response);
                }
            })

            break;
        default: 
            response.fulfillmentText = "Something went wrong";
            res.json(response);
    }
}

module.exports = router;
