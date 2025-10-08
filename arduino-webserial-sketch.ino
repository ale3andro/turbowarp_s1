String args[] = { "arg0", "arg1", "arg2", "arg3", "arg4" };
int num_args = 0;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
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
    Serial.print("Total args: ");
    Serial.println(num_args+1);
    for (int k=0; k<=num_args; k++)
      Serial.println(args[k]);
    
    if (args[0] == "LED") {
      if (args[1]=="ON") {
        digitalWrite(args[2].toInt(), HIGH);
        Serial.print("led on "); Serial.println(args[2]);
      }
      else {
        digitalWrite(args[2].toInt(), LOW);
        Serial.print("led off "); Serial.println(args[2]);
      }
    } else if (args[0] == "READ" ) {
        int value = analogRead(args[1].toInt());
        Serial.println(value);
    } else {
      Serial.println("Not implemented");
    }
  }
}