#define MAX_PARTS  5   // Max number of parts you want to split into
#define MAX_LENGTH 20  // Max length of each part

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    /*
      char input[] = "LED_ON_HIGH";
      char* parts[MAX_PARTS];

      splitString(input, parts);

      for (int i = 0; i < MAX_PARTS && parts[i] != NULL; i++) {
        Serial.print("Part ");
        Serial.print(i);
        Serial.print(": ");
        Serial.println(parts[i]);
      }  
    */
    if (cmd == "LED ON") {
      digitalWrite(13, HIGH);
      Serial.println("LED ON");
    } else if (cmd == "LED OFF") {
      digitalWrite(13, LOW);
      Serial.println("LED OFF");
    }
  }
}

void splitString(char* input, char* parts[], char delimiter = '_') {
  int i = 0;
  char* token = strtok(input, &delimiter);

  while (token != NULL && i < MAX_PARTS) {
    parts[i] = token;
    i++;
    token = strtok(NULL, &delimiter);
  }

  // Optionally null-terminate the array
  if (i < MAX_PARTS) {
    parts[i] = NULL;
  }
}
