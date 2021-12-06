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
    isConnected: boolean;
    
    constructor(){
        this.#url = "ws://broker.mqttdashboard.com:8000/mqtt";
        this.#MQTTClient = mqtt.connect(this.#url);  
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
}
