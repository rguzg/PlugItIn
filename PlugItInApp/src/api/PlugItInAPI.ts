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

    TurnOffDevice(): Promise<Boolean>{

        this.#MQTTClient.publish('plugitin', '{type: 2}');

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            this.#MQTTClient.on("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseSTATE_MODYFING = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == PlugItInAPIResponseType.TURN_OFF && parsed_message.status){ 
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });

        return returnValue;

    }

    GetAlarms(): Promise<Array<Number>>{

        this.#MQTTClient.publish('plugitin', '{type: 3}');

        let returnValue = new Promise<Array<Number>>((resolve, reject) => {
            this.#MQTTClient.on("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseGET_ALARM = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == PlugItInAPIResponseType.GET_ALARM ){ 
                        resolve(parsed_message.alarms);
                    }
                }

                resolve([]);
            });
        });

        return returnValue;

    }

    NewAlarm(date: Date): Promise<Boolean>{

        let epoch_time = String(date.getTime()).slice(0, -3);

        this.#MQTTClient.publish('plugitin', `{type: 4, alarm_time: ${epoch_time}}`);

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            this.#MQTTClient.on("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseSTATE_MODYFING = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == PlugItInAPIResponseType.SET_ALARM && parsed_message.status){ 
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });

        return returnValue;

    }
}
