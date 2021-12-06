// Unix Epoch timestamps are stored in long long integers. This constant has to be defined for the JSON library to serialize them correctly.
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
// Vector that stores the current active alarms in Unix Epoch time.
std::vector<time_t> alarm_store;

void messageCallback(char *topic, byte *payload, unsigned int length);

WiFiClient client;
WiFiUDP ntpUDP;
// The event handlers need to be declared at the top level scope
WiFiEventHandler connectedEventListener;
WiFiEventHandler disconnectedEventListener;
PubSubClient mqttClient = PubSubClient("broker.hivemq.com", 1883, *messageCallback, client);
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600, 60000);
boolean mqttConnected = false;
boolean mqttSubscribed = false;

// Tries to connect to WiFi. Stays on a loop until connected.
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

// Handler for disconnection events. Tries to reconnect to the Internet.
void disconnectionHandler(const WiFiEventStationModeDisconnected &event)
{
    Serial.printf("Disconnected from %s \n", event.ssid);
    connectToWifi();
}

// Handler for connection events. Prints the name of the WiFi network.
void connectionHandler(const WiFiEventStationModeConnected &event)
{
    Serial.printf("Connected to WiFi! %s \n", event.ssid);
}

// Returns a JSON Array with all of the active alarms in the alarm_store.
ArduinoJson6185_D1::StaticJsonDocument<160U> generateAlarmsJSON()
{
    StaticJsonDocument<JSON_ARRAY_SIZE(5)> alarms;

    JsonArray alarms_array = alarms.to<JsonArray>();

    for (int i = 0; i < alarm_store.size(); i++)
    {
        alarms.add(alarm_store.at(i));
    }

    return alarms;
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

    // All requests are JSON objects. They have a type property and may have extra data. The allocated memory for the JSONs is allocated at
    // compile time.
    DynamicJsonDocument request(JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(3));
    DeserializationError err = deserializeJson(request, message);

    int type = request["type"];
    StaticJsonDocument<JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(3)> response;

    if (!err)
    {
        switch (type)
        {
            // Return current status of the relay.
        case 0:
            response["type"] = 0;
            response["status"] = digitalRead(OUTPUT_PIN);
            break;
            // Turn on the relay.
        case 1:

            Serial.println("Turning on the relay");
            digitalWrite(OUTPUT_PIN, HIGH);

            response["type"] = 1;
            response["status"] = 1;
            break;
            // Turn ff the relay.
        case 2:
            Serial.println("Turning off the relay");
            digitalWrite(OUTPUT_PIN, LOW);

            response["type"] = 2;
            response["status"] = 1;
            break;
            // Returns a JSON with all the active alarms.
        case 3:
        {
            Serial.println("Sending the alarm history");

            response["type"] = 3;
            response["alarms"] = generateAlarmsJSON();

            // Let's pray to god that 200 is a big enough buffer size!
            char output[200];

            serializeJson(response, output);
            Serial.println(output);
            mqttClient.publish("response", output);

            break;
        }
            // Registers a new alarm. alarm_time must be in Unix Epoch time and must be a time in the future.
        case 4:
        {
            Serial.println("Registering new alarm");
            time_t alarm_time = request["alarm_time"] | -1;

            if (alarm_time != -1 && alarm_time - timeClient.getEpochTime() > 0)
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
            // Deletes alarm at index.
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
            // Sends the system's current time in Unix Epoc format
        case 6:
        {
            Serial.println("Sending the current time");
            time_t now = timeClient.getEpochTime();
            response["type"] = 6;
            response["time"] = now;
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

    // The relay starts off.
    digitalWrite(OUTPUT_PIN, LOW);

    // Binding callbacks to Event Handlers.
    disconnectedEventListener = WiFi.onStationModeDisconnected(&disconnectionHandler);
    connectedEventListener = WiFi.onStationModeConnected(&connectionHandler);
    mqttClient.setCallback(messageCallback);

    connectToWifi();
    timeClient.begin();
}

void loop()
{
    // This function must be run periodically to keep the system's time accurate.
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
        // Requests are sent through the plugitin topic.
        mqttSubscribed = mqttClient.subscribe("plugitin");

        if (mqttSubscribed)
        {
            Serial.println("Connected!");
        }
    }

    // This function must be run periodically to keep the system's connected to the MQTT server.
    mqttClient.loop();

    // Every loop all alarms are checked. If an alarm expires in the next sixty seconds, the alarm is removed from the alarm_store
    // and the relay is turned on.
    for (int i = 0; i < alarm_store.size(); i++)
    {
        long alarm_time = alarm_store.at(i);
        if (timeClient.getEpochTime() - alarm_time > 0 && timeClient.getEpochTime() - alarm_time < 60)
        {
            Serial.printf("Alarm triggered! @ %s", String(alarm_time));
            digitalWrite(OUTPUT_PIN, HIGH);
            alarm_store.erase(alarm_store.begin() + i);

            StaticJsonDocument<JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(3)> response;

            // Special response that indicates that an alarm has been fired.
            response["type"] = 7;
            response["alarms"] = generateAlarmsJSON();

            // Let's pray to god that 200 is a big enough buffer size!
            char output[200];

            serializeJson(response, output);
            Serial.println(output);
            mqttClient.publish("response", output);
        }
    }
}