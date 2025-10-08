class ArduinoWebSerialButtons {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.lastLine = '';
    this.lastButtonStates = {}; // pin -> state
    this.buttonCallbacks = {};  // pin -> callback array
  }

  getInfo() {
    return {
      id: 'arduinowebserialbuttons',
      name: 'Arduino WebSerial Buttons',
      color1: '#007bff',
      color2: '#0056b3',
      blocks: [
        {
          opcode: 'connect',
          blockType: Scratch.BlockType.COMMAND,
          text: 'connect to Arduino'
        },
        {
          opcode: 'send',
          blockType: Scratch.BlockType.COMMAND,
          text: 'send [MESSAGE]',
          arguments: {
            MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello Arduino!' }
          }
        },
        {
          opcode: 'readLine',
          blockType: Scratch.BlockType.REPORTER,
          text: 'last line received'
        },
        {
          opcode: 'whenButtonPressed',
          blockType: Scratch.BlockType.HAT,
          text: 'when button pressed on pin [PIN]',
          arguments: {
            PIN: {
              type: Scratch.ArgumentType.STRING,
              menu: 'pins'
            }
          }
        }
      ],
      menus: {
        pins: {
          acceptReporters: false,
          items: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
        }
      }
    };
  }

  _dispatchDataEvent(line) {
    this.lastLine = line.trim();

    // Expect messages like: BTN2:PRESSED or BTN2:RELEASED
    const match = this.lastLine.match(/^BTN(\d+):(PRESSED|RELEASED)$/i);
    if (match) {
      const pin = match[1];
      const state = match[2].toUpperCase();

      const prevState = this.lastButtonStates[pin];
      this.lastButtonStates[pin] = state;

      if (state === 'PRESSED' && prevState !== 'PRESSED') {
        // Fire the registered callbacks
        if (this.buttonCallbacks[pin]) {
          for (const cb of this.buttonCallbacks[pin]) cb();
        }
      }
    }
  }

  async connect() {
    try {
      const ports = await navigator.serial.getPorts();
      if (ports.length > 0) {
        this.port = ports[0];
      } else {
        this.port = await navigator.serial.requestPort();
      }

      await this.port.open({ baudRate: 9600 });

      const textDecoder = new TextDecoderStream();
      const textEncoder = new TextEncoderStream();

      this.port.readable.pipeTo(textDecoder.writable);
      textEncoder.readable.pipeTo(this.port.writable);

      this.reader = textDecoder.readable.getReader();
      this.writer = textEncoder.writable.getWriter();

      this._readLoop();

      alert('✅ Connected to Arduino!');
    } catch (err) {
      alert('❌ Connection failed: ' + err.message);
    }
  }

  async _readLoop() {
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim() !== '') this._dispatchDataEvent(line);
        }
      }
    } catch (e) {
      console.warn('Read loop stopped:', e);
    }
  }

  async send(args) {
    if (!this.writer) {
      alert('⚠️ Not connected yet!');
      return;
    }
    await this.writer.write(args.MESSAGE + '\n');
  }

  readLine() {
    return this.lastLine;
  }

  whenButtonPressed(args, util) {
    const pin = args.PIN;
    if (!this.buttonCallbacks[pin]) {
      this.buttonCallbacks[pin] = [];
    }

    this.buttonCallbacks[pin].push(() => {
      util.startHats('arduinowebserialbuttons_whenButtonPressed', { PIN: pin });
    });

    return false; // Event-driven trigger
  }
}

Scratch.extensions.register(new ArduinoWebSerialButtons());
