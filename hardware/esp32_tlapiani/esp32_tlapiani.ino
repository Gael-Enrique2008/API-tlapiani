#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>

#define FLOW_PIN 32
#define TDS_PIN 35
#define TURB_PIN 34
#define TEMP_PIN 33
#define GPS_RX 16
#define GPS_TX 17

WebServer server(80);
DNSServer dnsServer;
const byte DNS_PORT = 53;

// WIFI
String ssid = "";
String password = "";
String deviceId = "";
bool wifiConfigured = false;

const char* serverName = "https://api-tlapiani-1.onrender.com/api/data";

// SENSORES
volatile int flowPulseCount = 0;
float flowRate = 0;
float tdsValue = 0;
float turbidityValue = 0;
float temperature = 0;

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
double latitude = 0;
double longitude = 0;

// HTML LOCAL
String htmlPage = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>Configurar Tlapiani</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h2>Configurar Tlapiani</h2>

  <form action="/save" method="POST">
    ID del dispositivo:<br>
    <input type="text" name="deviceId" placeholder="Ej. TL001" required><br><br>

    Nombre del WiFi:<br>
    <input type="text" name="ssid" required><br><br>

    Contraseña del WiFi:<br>
    <input type="password" name="password" required><br><br>

    <input type="submit" value="Guardar y conectar">
  </form>
</body>
</html>
)rawliteral";

void IRAM_ATTR countPulse() {
  flowPulseCount++;
}

void handleRoot() {
  server.send(200, "text/html", htmlPage);
}

void handleNotFound() {
  server.sendHeader("Location", "http://192.168.4.1", true);
  server.send(302, "text/plain", "");
}

void handleSave() {
  deviceId = server.arg("deviceId");
  ssid = server.arg("ssid");
  password = server.arg("password");

  Serial.println("DEVICE ID: " + deviceId);
  Serial.println("SSID: " + ssid);
  Serial.println("PASSWORD: " + password);

  wifiConfigured = true;

  server.send(
    200,
    "text/html",
    "<h3>Datos guardados. Conectando a WiFi...</h3>"
  );
}

void readSensors() {
  flowPulseCount = 0;
  unsigned long startTime = millis();

  while (millis() - startTime < 1000) {
    dnsServer.processNextRequest();
    server.handleClient();
  }

  flowRate = flowPulseCount / 7.5;

  int tdsRaw = analogRead(TDS_PIN);
  float tdsVoltage = tdsRaw * (3.3 / 4095.0);
  tdsValue = tdsVoltage * 500;

  int turbRaw = analogRead(TURB_PIN);
  float turbVoltage = turbRaw * (3.3 / 4095.0);
  turbidityValue = turbVoltage * 100;

  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);

  Serial.println("---- LECTURAS ----");
  Serial.print("Flujo: "); Serial.println(flowRate);
  Serial.print("TDS: "); Serial.println(tdsValue);
  Serial.print("Turbidez: "); Serial.println(turbidityValue);
  Serial.print("Temp: "); Serial.println(temperature);
}

void readGPS() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isUpdated()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();

    Serial.println("GPS OK");
    Serial.println(latitude, 6);
    Serial.println(longitude, 6);
  } else {
    Serial.println("GPS esperando señal...");
  }
}

void sendData() {
  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{";
  jsonData += "\"device_id\":\"" + deviceId + "\",";
  jsonData += "\"flow\":" + String(flowRate) + ",";
  jsonData += "\"tds\":" + String(tdsValue) + ",";
  jsonData += "\"turbidity\":" + String(turbidityValue) + ",";
  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"latitude\":" + String(latitude, 6) + ",";
  jsonData += "\"longitude\":" + String(longitude, 6);
  jsonData += "}";

  Serial.println(jsonData);

  int httpResponseCode = http.POST(jsonData);

  Serial.print("HTTP: ");
  Serial.println(httpResponseCode);

  http.end();
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  pinMode(FLOW_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), countPulse, RISING);

  sensors.begin();

  WiFi.softAP("TLAPIANI_SETUP");

  Serial.println("WiFi creado");
  Serial.println(WiFi.softAPIP());

  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  server.on("/", handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.onNotFound(handleNotFound);

  server.begin();
}

void loop() {
  dnsServer.processNextRequest();
  server.handleClient();

  if (wifiConfigured && WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid.c_str(), password.c_str());

    Serial.print("Conectando");

    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nConectado a WiFi");

      readSensors();
      readGPS();
      sendData();

      wifiConfigured = false;
    } else {
      Serial.println("\nError al conectar WiFi");
      wifiConfigured = false;
    }
  }
}
