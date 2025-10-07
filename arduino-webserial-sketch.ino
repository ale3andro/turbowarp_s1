void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "LED ON") {
      digitalWrite(13, HIGH);
      Serial.println("LED ON");
    } else if (cmd == "LED OFF") {
      digitalWrite(13, LOW);
      Serial.println("LED OFF");
    }
  }
}
