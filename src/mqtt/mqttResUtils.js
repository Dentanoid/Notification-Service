const mqtt = require("mqtt")
require('dotenv').config();
require('../email/emailController')

const mqttOptions = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    protocol: process.env.MQTT_PROTOCOL,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
}

const resClient = mqtt.connect(mqttOptions)

resClient.on("connect", () => {
    console.log("Res client Successfully connected to broker")
})

resClient.on("reconnect", () => {
    console.log("Res client Reconnecting to broker...")
})

resClient.on("error", (error) => {
    console.error(error)
})

resClient.on("close", () => {
    console.log("Res client Disconnected from broker")
})

async function publishResponse(topic, message, next) {

    try {
        resClient.publish(topic, JSON.stringify(message), (err) => {
            if (err) {
                next(err)
            }
        console.log('Res client published message:', message)    
        });
    } catch (err) {
        console.error(err)
    }
}
// Formats mqtt response to be sent with the nessecary data
async function formatResponse(message, statusCode, errorMessage, responseType) {
        let responseMessage
    try {
        if (responseType === 'sub found' || responseType === 'document saved') {
                responseMessage = {
                    "requestID": message.requestID,
                    "status": statusCode,
                    "subscriber": message.subscriber
                } 
        }   else if(responseType === 'sub not found') {
                responseMessage = {
                    "requestID": message.requestID,
                    "status": statusCode,
                    "message": errorMessage,
                    "subscriber": {
                        "patient_ID": message.patient_ID,
                }
            }
        }   else if(responseType === 'invalid document') {
                responseMessage = {
                    "requestID": message.requestID,
                    "status": statusCode,
                    "message": errorMessage,
                    "subscriber": {
                        "patient_ID": message.patient_ID,
                        "email": message.email,
                        "clinic": message.clinic
                }
            }
        }   else {
                responseMessage = {
                    "requestID": message.requestID,
                    "status": statusCode,
                    "message": errorMessage,
            }
        }
        
    } catch (err) {
        console.error(err)
    }
    console.log('Response message', responseMessage)
    return responseMessage
}

module.exports = {resClient, publishResponse, formatResponse}