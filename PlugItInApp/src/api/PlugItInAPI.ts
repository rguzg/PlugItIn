import * as mqtt from "mqtt/dist/mqtt.min"

enum PlugItInAPIResponseType{
    TURN_ON = 1,
    TURN_OFF,
    GET_ALARM,
    SET_ALARM,
    DELETE_ALARM,
    GET_TIME
}

interface PlugItInAPIResponse {
    type: PlugItInAPIResponseType,
}

interface PlugItInAPIResponseGET_ALARM extends PlugItInAPIResponse {
    alarms: Array<Number>
}

interface PlugItInAPIResponseGET_TIME extends PlugItInAPIResponse {
    time: Number
}

interface PlugItInAPIResponseSTATE_MODYFING extends PlugItInAPIResponse {
    status: Boolean
}

export default class PlugItInAPI {
    #url: string;
    #MQTTClient: any;
    #response: Promise<PlugItInAPIResponse>;
    isConnected: boolean;
    
    constructor(){
        this.#url = "ws://broker.mqttdashboard.com:8000/mqtt";
        this.#MQTTClient = mqtt.connect(this.#url);  
        this.#response;
        this.isConnected = false;

        this.#MQTTClient.on("connect", () => {
            this.#MQTTClient.subscribe('response', (err) => {
                if(err){
                    throw err;
                }

                this.isConnected = true;
            });
        });
    }

    TurnOnDevice(): Promise<Boolean>{

        this.#MQTTClient.publish('plugitin', '{type: 1}');

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            this.#MQTTClient.on("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseSTATE_MODYFING = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == PlugItInAPIResponseType.TURN_ON && parsed_message.status){ 
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });

        return returnValue;

    }
}
