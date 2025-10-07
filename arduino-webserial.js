class ArduinoWebSerial {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
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
          arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello Arduino!' } }
        },
        {
          opcode: 'readLine',
          blockType: Scratch.BlockType.REPORTER,
          text: 'διάβασε γραμμή'
        },
        {
          opcode: 'led',
          blockType: Scratch.BlockType.COMMAND,
          text: 'LED στο pin 13 [STATE]',
          arguments: { STATE: { type: Scratch.ArgumentType.STRING, menu: 'onoff', defaultValue: 'άναψε' } }
        }
      ],
      menus: {
        onoff: { acceptReporters: false, items: ['άναψε', 'σβήσε'] }
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
    alert('✅ Connected to Arduino!');
  }

  async connect() {
    try {
      if (!(await this.ensureConnection())) {
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 9600 });
        await this.setupStreams();
      }
    } catch (err) {
      alert('❌ Connection failed: ' + err.message);
    }
  }

  async send(args) {
    if (!this.writer) {
      alert('⚠️ Not connected yet!');
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

  // New block: LED on pin 13
  async led(args) {
    if (!this.writer) {
      alert('⚠️ Not connected yet!');
      return;
    }
    const cmd = args.STATE === 'άναψε' ? 'LED ON' : 'LED OFF';
    await this.writer.write(cmd + '\n');
  }
}

Scratch.extensions.register(new ArduinoWebSerial());
