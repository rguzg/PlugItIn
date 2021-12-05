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

void disconnectionHandler(const WiFiEventSoftAPModeStationDisconnected &)
{
    Serial.printf("Disconnected from %s \n", ssid);
    connectToWifi();
}

void connectionHandler(const WiFiEventSoftAPModeStationConnected &)
{
    Serial.printf("Connected to WiFi! %s \n", ssid);
}

void setup()
{
    Serial.println("Setting up your device...");
    Serial.begin(115200);
    pinMode(OUTPUT_PIN, OUTPUT);
    disconnectedEventListener = WiFi.onSoftAPModeStationDisconnected(&disconnectionHandler);
    connectedEventListener = WiFi.onSoftAPModeStationConnected(&connectionHandler);

    connectToWifi();
}

void loop()
{
    Serial.println("Looks like we're looping...");
}