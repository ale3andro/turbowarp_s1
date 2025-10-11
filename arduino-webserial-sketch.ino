#include <Servo.h>
#include <DHT11.h>

String args[] = { "arg0", "arg1", "arg2", "arg3", "arg4" };
int num_args = 0, state;
Servo tServo;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

int readTemperature(int pin) {
  int temperature = 0;
  DHT11 temp(pin);
  temperature = temp.readTemperature();
  if (temperature != DHT11::ERROR_CHECKSUM && temperature != DHT11::ERROR_TIMEOUT) {
    return temperature;
  }
  return -100; // Error value
}

int readHumidity(int pin) {
  int humidity = 0;
  DHT11 hum(pin);
  humidity = hum.readHumidity();
  if (humidity != DHT11::ERROR_CHECKSUM && humidity != DHT11::ERROR_TIMEOUT) {
    return humidity;
  }
  return -100; // Error value
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    num_args = 0;
    int index = -1;
    int last_pos = -1;
    while (true) {   
      index = cmd.indexOf("_", index + 1);
      if (index == -1) {
        if (num_args>0) {
          args[num_args] = cmd.substring(last_pos+1, -1);             
        } else {
          args[0] = cmd;
        }
        break;
      }
      args[num_args] = cmd.substring(last_pos+1, index);
      num_args = num_args + 1;
      last_pos = index;
    }
    
    if (args[0] == "LED") {
      if (args[1]=="ON") {
        digitalWrite(args[2].toInt(), HIGH);
      }
      else {
        digitalWrite(args[2].toInt(), LOW);
      }
    } else if (args[0] == "READ" ) {
        int value = analogRead(args[1].toInt());
        Serial.println(value);
    } else if (args[0] == "LEDBRIGHTNESS" ) {
        analogWrite(args[1].toInt(), args[2].toInt());
    } else if (args[0] == "SERVO" ) {
        tServo.attach(args[1].toInt());
        tServo.write(args[2].toInt());
    } else if (args[0] == "MOTOR" ) {
      if (args[2].toInt()==1) { // Fora rologiou
        digitalWrite(4, HIGH);
        delay(250);
        analogWrite(3, 255 - args[1].toInt());
      } else { // fora antistrofi rologiou
        digitalWrite(4, LOW);
        delay(250);
        analogWrite(3, args[1].toInt());
      }
    } else if (args[0] == "TEMP") {
        Serial.println(readTemperature(args[1].toInt()));
    } else if (args[0] == "HUM") {
        Serial.println(readHumidity(args[1].toInt()));
    } else if (args[0] == "BUTTON") { // κουμπί πίεσης
        state = digitalRead(args[1].toInt());
        // Button pressed → LOW, so invert it:
        Serial.println(state == LOW ? "1" : "0");
    } else if (args[0] == "BUTTON2") { // κουμπί αφής
        state = digitalRead(args[1].toInt());
        Serial.println(state == LOW ? "0" : "1");
    } else {
      Serial.println("Not implemented");
    }
    args[0] = "";
  }
}