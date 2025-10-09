class ArduinoWebSerial {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.textDecoder = new TextDecoder();
  }

  getInfo() {
    return {
      id: 'arduinowebserial',
      name: 'Arduino WebSerial',
      color1: '#007bff',
      color2: '#0062cc',
      blocks: [
        {
          opcode: 'debugRead',
          blockType: Scratch.BlockType.REPORTER,
          text: 'debug serial read'
        },
        {
          opcode: 'connect',
          blockType: Scratch.BlockType.COMMAND,
          text: 'σύνδεση με Arduino'
        },
        {
          opcode: 'send',
          blockType: Scratch.BlockType.COMMAND,
          text: 'στείλε [MESSAGE]',
          arguments: { 
            MESSAGE: { 
              type: Scratch.ArgumentType.STRING, 
              defaultValue: 'Hello Arduino!' 
            } 
          }
        },
        {
          opcode: 'readLine',
          blockType: Scratch.BlockType.REPORTER,
          text: 'διάβασε γραμμή'
        },
        {
          opcode: 'readAnalog',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Διάβασε ποτενσιόμετρο από το pin [PIN]',
          arguments: {
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'analogPins'
            }
          },
        },
        {
          opcode: 'readAnalog',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Διάβασε επίπεδο φωτός από το pin [PIN]',
          arguments: {
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'analogPins'
            }
          },
        },
        {
          opcode: 'readAnalog',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Διάβασε επίπεδο ήχου από το μικρόφωνο στο pin [PIN]',
          arguments: {
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'analogPins'
            }
          },
        },
        {
          opcode: 'led',
          blockType: Scratch.BlockType.COMMAND,
          text: 'LED στο pin [PIN] [STATE]',
          arguments: { 
            STATE: { 
              type: Scratch.ArgumentType.STRING, 
              menu: 'onoff', 
              defaultValue: 'άναψε'
            },
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'pins',
              defaultValue: 'D6'
            }
          }
        },
        {
          opcode: 'led',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Laser στο pin [PIN] [STATE]',
          arguments: { 
            STATE: { 
              type: Scratch.ArgumentType.STRING, 
              menu: 'onoff', 
              defaultValue: 'άναψε'
            },
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'pins',
              defaultValue: 'D6'
            }
          }
        },
        {
          opcode: 'led_brightness',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Led στο pin [PIN] άναψε με φωτεινότητα [BRIGHTNESS]',
          arguments: { 
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'pins_led_brightness',
              defaultValue: 'D6'
            },
            BRIGHTNESS: { 
              type: Scratch.ArgumentType.STRING,
              menu: 'brightnessLevels',
              defaultValue: '128'
            },
            
          }
        }
      ],
      menus: {
        onoff: { 
          acceptReporters: false, 
          items: ['άναψε', 'σβήσε'] 
        },
        pins: {
          acceptReporters: false,
          items: ['D4', 'D5', 'D6', 'D7', 'D8', 'D9']
        },
        pins_led_brightness: {
          acceptReporters: false,
          items: ['D5', 'D6', 'D9']
        },
        analogPins: {
          acceptReporters: true,
          items: ['A0', 'A1', 'A2', 'A3']
        },
        brightnessLevels: {
          acceptReporters: false,
          items: ['0', '32', '64', '96', '128', '160', '192', '224', '255']
        }
      }
    };
  }

  async debugRead() {
    if (!this.reader) return 'no reader';
    const { value } = await this.reader.read();
    return new TextDecoder().decode(value || new Uint8Array()).trim();
  }

  async ensureConnection() {
    if (this.port) return true;
    const ports = await navigator.serial.getPorts();
    if (ports.length > 0) {
      this.port = ports[0];
      await this.port.open({ baudRate: 9600 });
      return this.setupStreams();
    }
    return false;
  }

  async setupStreams() {
    const textDecoder = new TextDecoderStream();
    const textEncoder = new TextEncoderStream();

    this.port.readable.pipeTo(textDecoder.writable);
    textEncoder.readable.pipeTo(this.port.writable);

    this.reader = textDecoder.readable.getReader();
    this.writer = textEncoder.writable.getWriter();
    alert('Συνδέθηκε στο S1 Arduino!');
  }

  async connect() {
    try {
      if (!(await this.ensureConnection())) {
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 9600 });
        await this.setupStreams();
      }
    } catch (err) {
      alert('Η σύνδεση απέτυχε: ' + err.message);
    }
  }

  async send(args) {
    if (!this.writer) {
      alert('Δεν υπάρχει σύνδεση με το S1');
      return;
    }
    await this.writer.write(args.MESSAGE + '\n');
  }

  async readLine() {
    if (!this.reader) return '';
    const { value, done } = await this.reader.read();
    if (done) {
      this.reader.releaseLock();
      return '';
    }
    return value.trim();
  }

  async led(args) {
    if (!this.writer) {
      alert('Not connected yet!');
      return;
    }
    const pin = args.PIN;
    const cmd = args.STATE === 'άναψε' ? 'LED_ON_' + pin.substring(1)  : 'LED_OFF_' + pin.substring(1);
    
    await this.writer.write(cmd + '\n');
  }

  async led_brightness(args) {
    if (!this.writer) {
      alert('Not connected yet!');
      return;
    }
    const pin = args.PIN;
    const brightness = args.BRIGHTNESS;
    const cmd = 'LEDBRIGHTNESS_' + pin.substring(1) + '_' + brightness;
    
    await this.writer.write(cmd + '\n');
  }

  async readAnalog(args) {
    if (!this.writer || !this.reader) {
      alert('Δεν έχει γίνει σύνδεση με το S1');
      return;
    }
    const pin = args.PIN;
    const cmd = 'READ_' + pin.substring(1);
    await this.writer.write(cmd + '\n');

    let result = '';
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) break;
      result += value;
      if (result.includes('\n')) break; // got full line
    }

    return result.trim();
  }
}

Scratch.extensions.register(new ArduinoWebSerial());
