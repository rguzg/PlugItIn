#include <ESP8266WiFi.h>
#define OUTPUT_PIN D0

const char *ssid = "Unova";
const char *password = "luzbetra_internet!";

WiFiClient client;
WiFiEventHandler connectedEventListener;
WiFiEventHandler disconnectedEventListener;

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

void setup()
{
    Serial.println("Setting up your device...");
    Serial.begin(115200);
    pinMode(OUTPUT_PIN, OUTPUT);
    disconnectedEventListener = WiFi.onStationModeDisconnected(&disconnectionHandler);
    connectedEventListener = WiFi.onStationModeConnected(&connectionHandler);

    connectToWifi();
}

void loop()
{
    Serial.println("Looks like we're looping...");
}