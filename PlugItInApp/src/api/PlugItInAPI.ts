import * as mqtt from "mqtt/dist/mqtt.min"
import { EventEmitter } from "events";
import { alarms, is_on } from "../stores/_stores";

enum ResponseTypes{
    STATE = "STATE",
    TURN_ON = "TURN_ON",
    TURN_OFF = "TURN_OFF",
    GET_ALARM = "GET_ALARM",
    SET_ALARM = "SET_ALARM",
    DELETE_ALARM = "DELETE_ALARM",
    GET_TIME = "GET_TIME" 
}

enum SubscriptionsTypes{
    POWER_STATE = "POWER_STATE",
    ALARM_STATE = "ALARM_STATE",
}

interface AlarmResponse {
    type: ResponseTypes.GET_ALARM,
    data: Alarms
}

interface StateResponse {
    type: ResponseTypes.STATE | ResponseTypes.TURN_ON | ResponseTypes.TURN_OFF | ResponseTypes.SET_ALARM | ResponseTypes.DELETE_ALARM,
    data: State
}
interface TimeResponse {
    type: ResponseTypes.GET_TIME,
    data: Time
}

type Response = AlarmResponse | StateResponse | TimeResponse;

interface AlarmSubscription {
    type: SubscriptionsTypes.ALARM_STATE,
    data: Alarms
}
interface StateSubscription {
    type: SubscriptionsTypes.POWER_STATE,
    data: State
}

type Subscription = AlarmSubscription | StateSubscription;

interface Alarms {
    alarms: Array<Number>
}

interface Time {
    time: Number
}

interface State {
    status: boolean
}

export default class PlugItInAPI extends EventEmitter {
    #url: string;
    #MQTTClient: mqtt.MqttClient;
    isConnected: boolean;
    #EventEmitter: EventEmitter;

    constructor(){
        super();

        this.#url = "ws://broker.mqttdashboard.com:8000/mqtt";
        this.#MQTTClient = mqtt.connect(this.#url); 
        this.isConnected = false;
        this.#EventEmitter = new EventEmitter();

        this.#MQTTClient.on("connect", () => {
            this.#MQTTClient.subscribe('plugitin_response', (err) => {
                if(err){
                    throw err;
                }
            });

            this.#MQTTClient.subscribe('plugitin_subscription', (err) => {
                if(err){
                    throw err;
                }
        
            });
            this.isConnected = true;

            this.#EventEmitter.emit("connect");
        });

        this.#MQTTClient.on("message", (topic: String, message:Uint8Array) => {
            if(topic == "plugitin_subscription"){
                let subscription: Subscription = JSON.parse(message.toString());
        
                this.#EventEmitter.emit(subscription.type, subscription.data);
            }
        });
    }

    GetStatus(): Promise<boolean>{

        this.#MQTTClient.publish('plugitin', '{type: 0}');

        
        let returnValue = new Promise<boolean>((resolve, reject) => {
            let messageEventListener = (topic: String, message:Uint8Array) => {
                if(topic == "response"){
                    let parsed_message: StateResponse = JSON.parse(message.toString());
                    resolve(parsed_message.data.status);
                }
                
            }
            
            this.#MQTTClient.once("message", messageEventListener);
            
            setTimeout(() => {
                this.#MQTTClient.removeListener("message", messageEventListener);
                reject("MQTT Server connection timed out");
            }, 5000);
        });

        return returnValue;

    }

    TurnOnDevice(): Promise<Boolean>{

        this.#MQTTClient.publish('plugitin', '{type: 1}');

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            let messageEventListener = (topic: String, message:Uint8Array) => {
                if(topic == "response"){
                    let parsed_message: StateResponse = JSON.parse(message.toString());
                    resolve(parsed_message.data.status);
                }
            }

            this.#MQTTClient.once("message", messageEventListener);

            setTimeout(() => {
                this.#MQTTClient.removeListener("message", messageEventListener);
                reject("MQTT Server connection timed out");
            }, 5000);
        });

        return returnValue;

    }

    TurnOffDevice(): Promise<Boolean>{

        this.#MQTTClient.publish('plugitin', '{type: 2}');

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            let messageEventListener = (topic: String, message:Uint8Array) => {
                if(topic == "response"){
                    let parsed_message: StateResponse = JSON.parse(message.toString());
                    resolve(parsed_message.data.status);
                }
            }

            this.#MQTTClient.once("message", messageEventListener);

            setTimeout(() => {
                this.#MQTTClient.removeListener("message", messageEventListener);
                reject("MQTT Server connection timed out");
            }, 5000);
        });

        return returnValue;

    }

    GetAlarms(): Promise<Array<Number>>{

        this.#MQTTClient.publish('plugitin', '{type: 3}');

        let returnValue = new Promise<Array<Number>>((resolve, reject) => {
            this.#MQTTClient.once("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseGET_ALARM = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == ResponseTypes.GET_ALARM ){ 
                        resolve(parsed_message.alarms);
                    }
                }

                resolve([]);
            });
        });

        return returnValue;

    }

    NewAlarm(date: Date): Promise<Boolean>{

        let epoch_time = String(date.getTime() + 3600000).slice(0, -3);

        this.#MQTTClient.publish('plugitin', `{type: 4, alarm_time: ${epoch_time}}`);

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            this.#MQTTClient.once("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseSTATE_MODYFING = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == ResponseTypes.SET_ALARM && parsed_message.status){ 
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });

        return returnValue;

    }

    DeleteAlarm(id: number): Promise<Boolean>{

        this.#MQTTClient.publish('plugitin', `{"type": 5, "alarm_index": ${id}}`);

        let returnValue = new Promise<Boolean>((resolve, reject) => {
            this.#MQTTClient.once("message", (topic: String, message:Uint8Array) => {
                let parsed_message: PlugItInAPIResponseSTATE_MODYFING = JSON.parse(message.toString());
                if(topic == "response"){
                    if(parsed_message.type == ResponseTypes.DELETE_ALARM && parsed_message.status){ 
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });

        return returnValue;

    }

    GetTime(): Promise<Number>{
            
            this.#MQTTClient.publish('plugitin', '{type: 6}');
    
            let returnValue = new Promise<Number>((resolve, reject) => {
                this.#MQTTClient.once("message", (topic: String, message:Uint8Array) => {
                    let parsed_message: PlugItInAPIResponseGET_TIME = JSON.parse(message.toString());
                    if(topic == "response"){
                        if(parsed_message.type == ResponseTypes.GET_TIME ){ 
                            resolve(parsed_message.time);
                        }
                    }
    
                    resolve(0);
                });
            });
    
            return returnValue;
    
    }
}
