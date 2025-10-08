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
          text: 'διάβασε αναλογικό από [PIN]',
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
        analogPins: {
          acceptReporters: true,
          items: ['A0', 'A1', 'A2', 'A3']
        }
      }
    };
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

  async readAnalog(args) {
    if (!this.writer || !this.reader) {
      alert('Δεν έχει γίνει σύνδεση με το S1');
      return;
    }
    const pin = args.PIN;
    const cmd = 'READ_' + pin.substring(1);
    await this.writer.write(new TextEncoder().encode(cmd));

    let result = '';
    try {
      const { value, done } = await this.reader.read();
      if (done) return 'error';
      result = this.textDecoder.decode(value).trim();
    } catch (e) {
      result = 'err';
      alert(e);
    }

    return result;
  }
}

Scratch.extensions.register(new ArduinoWebSerial());
