#define ARDUINOJSON_USE_LONG_LONG 1

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <vector>
#include <ArduinoJson.h>
#define OUTPUT_PIN 5

const char *ssid = "Unova";
const char *password = "luzbetra_internet!";
const char *mqtt_server = "broker.hivemq.com";
std::vector<time_t> alarm_store;

void messageCallback(char *topic, byte *payload, unsigned int length);

WiFiClient client;
WiFiUDP ntpUDP;
WiFiEventHandler connectedEventListener;
WiFiEventHandler disconnectedEventListener;
PubSubClient mqttClient = PubSubClient("broker.hivemq.com", 1883, *messageCallback, client);
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600, 60000);
boolean mqttConnected = false;
boolean mqttSubscribed = false;

void connectToWifi()
{
    Serial.println();
    Serial.printf("Connecting to %s \n", ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.print(".");
    }
}

void disconnectionHandler(const WiFiEventStationModeDisconnected &event)
{
    Serial.printf("Disconnected from %s \n", event.ssid);
    connectToWifi();
}

void connectionHandler(const WiFiEventStationModeConnected &event)
{
    Serial.printf("Connected to WiFi! %s \n", event.ssid);
}

void messageCallback(char *topic, byte *payload, unsigned int length)
{

    String message;

    Serial.printf("Message arrived [%s] \n", topic);
    for (int i = 0; i < length; i++)
    {
        Serial.print((char)payload[i]);
        message += char(payload[i]);
    }

    DynamicJsonDocument request(JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(3));
    DeserializationError err = deserializeJson(request, message);

    int type = request["type"];
    StaticJsonDocument<JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(3)> response;

    if (!err)
    {
        switch (type)
        {
        case 1:

            Serial.println("Turning on the relay");
            digitalWrite(OUTPUT_PIN, HIGH);

            response["type"] = 1;
            response["status"] = 1;
            break;
        case 2:
            Serial.println("Turning off the relay");
            digitalWrite(OUTPUT_PIN, LOW);

            response["type"] = 2;
            response["status"] = 1;
            break;
        case 3:
        {
            Serial.println("Sending the alarm history");
            StaticJsonDocument<JSON_ARRAY_SIZE(5)> alarms;

            JsonArray alarms_array = alarms.to<JsonArray>();

            for (int i = 0; i < alarm_store.size(); i++)
            {
                alarms.add(alarm_store.at(i));
            }

            response["type"] = 3;
            response["alarms"] = alarms;

            // Let's pray to god that 200 is a big enough buffer size!
            char output[200];

            serializeJson(response, output);
            Serial.println(output);
            mqttClient.publish("response", output);
            break;
        }
        case 4:
        {
            Serial.println("Registering new alarm");
            time_t alarm_time = request["alarm_time"] | -1;

            if (alarm_time != -1)
            {
                alarm_store.push_back(alarm_time);
                Serial.println(alarm_time);
                response["type"] = 4;
                response["status"] = 1;
            }
            else
            {
                Serial.println("Invalid Alarm Time");
                response["type"] = 4;
                response["status"] = 0;
            }

            break;
        }
        case 5:
        {
            Serial.println("Deleting alarm");
            int alarm_index = request["alarm_index"] | -1;

            if (alarm_index != -1 && alarm_index < alarm_store.size())
            {
                alarm_store.erase(alarm_store.begin() + alarm_index);
                response["type"] = 5;
                response["status"] = 1;
            }
            else
            {
                Serial.println("Invalid Alarm Index");
                response["type"] = 5;
                response["status"] = 0;
            }

            break;
        }
        default:
            Serial.println("???");
            break;
        }
        // Let's pray to god that 200 is a big enough buffer size!
        char output[200];

        serializeJson(response, output);
        Serial.println(output);
        mqttClient.publish("response", output);
    }
}

void setup()
{
    Serial.println("Setting up your device...");
    Serial.begin(115200);

    pinMode(OUTPUT_PIN, OUTPUT);
    digitalWrite(OUTPUT_PIN, LOW);

    disconnectedEventListener = WiFi.onStationModeDisconnected(&disconnectionHandler);
    connectedEventListener = WiFi.onStationModeConnected(&connectionHandler);
    mqttClient.setCallback(messageCallback);

    connectToWifi();
    timeClient.begin();
}

void loop()
{
    timeClient.update();

    if (!mqttConnected)
    {
        Serial.println("Connecting to MQTT server...");

        mqttConnected = mqttClient.connect("B-0632");

        if (mqttConnected)
        {
            Serial.println("Connected!");
        }
    }

    if (!mqttSubscribed && mqttConnected)
    {
        Serial.println("Subscribing to topic...");
        mqttSubscribed = mqttClient.subscribe("plugitin");

        if (mqttSubscribed)
        {
            Serial.println("Connected!");
        }
    }

    mqttClient.loop();
}