/**
 * Emulador de Game Boy Advance (GBA) em TypeScript
 * Este é um emulador simplificado para demonstração
 */

export class GBAEmulator {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private screenBuffer: Uint32Array | null = null;
  private romData: ArrayBuffer | null = null;
  private isRunning: boolean = false;
  private animationId: number | null = null;

  // GBA Screen resolution
  private readonly WIDTH = 240;
  private readonly HEIGHT = 160;
  private readonly SCALE = 3;

  // Botões do GBA
  private buttons = {
    A: false,
    B: false,
    L: false,
    R: false,
    UP: false,
    DOWN: false,
    LEFT: false,
    RIGHT: false,
    START: false,
    SELECT: false
  };

  init(): void {
    this.setupCanvas();
    this.setupControls();
    this.setupROMLoader();
    this.renderSplashScreen();
  }

  private setupCanvas(): void {
    // Criar canvas se não existir
    this.canvas = document.getElementById('gba-screen') as HTMLCanvasElement;
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'gba-screen';
      this.canvas.width = this.WIDTH;
      this.canvas.height = this.HEIGHT;
      this.canvas.style.width = `${this.WIDTH * this.SCALE}px`;
      this.canvas.style.height = `${this.HEIGHT * this.SCALE}px`;
      this.canvas.style.imageRendering = 'pixelated';
      
      const container = document.getElementById('emulator-container');
      if (container) {
        container.appendChild(this.canvas);
      } else {
        document.body.appendChild(this.canvas);
      }
    }

    this.ctx = this.canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    // Criar buffer de tela
    this.screenBuffer = new Uint32Array(this.WIDTH * this.HEIGHT);
  }

  private setupControls(): void {
    // Mapeamento de teclas do teclado para botões do GBA
    const keyMap: Record<string, keyof typeof this.buttons> = {
      'z': 'A',
      'x': 'B',
      'a': 'L',
      's': 'R',
      'ArrowUp': 'UP',
      'ArrowDown': 'DOWN',
      'ArrowLeft': 'LEFT',
      'ArrowRight': 'RIGHT',
      'Enter': 'START',
      'Shift': 'SELECT'
    };

    // Controles de teclado
    window.addEventListener('keydown', (e) => {
      const button = keyMap[e.key];
      if (button) {
        this.buttons[button] = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const button = keyMap[e.key];
      if (button) {
        this.buttons[button] = false;
        e.preventDefault();
      }
    });

    // Controles na tela (botões virtuais)
    this.createVirtualButtons();
  }

  private createVirtualButtons(): void {
    const buttonLayout = [
      { id: 'btn-up', label: '▲', position: 'up' },
      { id: 'btn-down', label: '▼', position: 'down' },
      { id: 'btn-left', label: '◀', position: 'left' },
      { id: 'btn-right', label: '▶', position: 'right' },
      { id: 'btn-a', label: 'A', position: 'action-a' },
      { id: 'btn-b', label: 'B', position: 'action-b' },
      { id: 'btn-start', label: 'START', position: 'start' },
      { id: 'btn-select', label: 'SELECT', position: 'select' }
    ];

    // Criar container de controles se não existir
    let controlsContainer = document.getElementById('controls-container');
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'controls-container';
      controlsContainer.className = 'gba-controls';
      document.body.appendChild(controlsContainer);
    }

    // Criar D-Pad
    const dpad = document.createElement('div');
    dpad.className = 'dpad';
    
    ['up', 'left', 'right', 'down'].forEach(pos => {
      const btn = document.createElement('button');
      btn.className = `dpad-btn dpad-${pos}`;
      btn.dataset.button = pos.toUpperCase();
      btn.textContent = pos === 'up' ? '▲' : pos === 'down' ? '▼' : pos === 'left' ? '◀' : '▶';
      dpad.appendChild(btn);
    });

    controlsContainer.appendChild(dpad);

    // Criar botões de ação
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    ['B', 'A'].forEach(btn => {
      const button = document.createElement('button');
      button.className = `action-btn btn-${btn.toLowerCase()}`;
      button.dataset.button = btn;
      button.textContent = btn;
      actionButtons.appendChild(button);
    });

    controlsContainer.appendChild(actionButtons);

    // Criar botões Start/Select
    const menuButtons = document.createElement('div');
    menuButtons.className = 'menu-buttons';

    ['SELECT', 'START'].forEach(btn => {
      const button = document.createElement('button');
      button.className = `menu-btn btn-${btn.toLowerCase()}`;
      button.dataset.button = btn;
      button.textContent = btn;
      menuButtons.appendChild(button);
    });

    controlsContainer.appendChild(menuButtons);

    // Adicionar listeners para controles virtuais
    const allButtons = controlsContainer.querySelectorAll('button');
    allButtons.forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const buttonName = btn.dataset.button as keyof typeof this.buttons;
        if (buttonName) {
          this.buttons[buttonName] = true;
        }
      });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const buttonName = btn.dataset.button as keyof typeof this.buttons;
        if (buttonName) {
          this.buttons[buttonName] = false;
        }
      });

      btn.addEventListener('mousedown', (e) => {
        const buttonName = btn.dataset.button as keyof typeof this.buttons;
        if (buttonName) {
          this.buttons[buttonName] = true;
        }
      });

      btn.addEventListener('mouseup', (e) => {
        const buttonName = btn.dataset.button as keyof typeof this.buttons;
        if (buttonName) {
          this.buttons[buttonName] = false;
        }
      });

      btn.addEventListener('mouseleave', (e) => {
        const buttonName = btn.dataset.button as keyof typeof this.buttons;
        if (buttonName) {
          this.buttons[buttonName] = false;
        }
      });
    });
  }

  private setupROMLoader(): void {
    // Criar botão de carregamento de ROM bem acessível
    let loadButton = document.getElementById('load-rom-btn') as HTMLButtonElement;
    
    if (!loadButton) {
      loadButton = document.createElement('button');
      loadButton.id = 'load-rom-btn';
      loadButton.innerHTML = '📂 Carregar ROM';
      loadButton.className = 'load-rom-button';
      
      // Inserir no início do body para ser bem visível
      document.body.insertBefore(loadButton, document.body.firstChild);
    }

    // Criar input file escondido
    let romInput = document.getElementById('rom-input') as HTMLInputElement;
    
    if (!romInput) {
      romInput = document.createElement('input');
      romInput.id = 'rom-input';
      romInput.type = 'file';
      romInput.accept = '.gba,.bin';
      romInput.style.display = 'none';
      document.body.appendChild(romInput);
    }

    // Clique no botão abre o seletor de arquivos
    loadButton.addEventListener('click', () => {
      romInput.click();
    });

    // Processar arquivo quando selecionado
    romInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        this.loadROM(file);
      }
      // Resetar input para permitir carregar o mesmo arquivo novamente
      target.value = '';
    });

    // Suporte a drag and drop
    this.setupDragAndDrop();
  }

  private setupDragAndDrop(): void {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0.7';
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      document.body.style.opacity = '1';
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      document.body.style.opacity = '1';
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.gba') || file.name.endsWith('.bin')) {
          this.loadROM(file);
        } else {
          alert('Por favor, selecione um arquivo .gba ou .bin');
        }
      }
    });
  }

  private async loadROM(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.romData = arrayBuffer;
      
      // Verificar cabeçalho básico da ROM
      if (!this.validateROMHeader(arrayBuffer)) {
        console.warn('Cabeçalho da ROM pode ser inválido, mas tentando carregar...');
      }

      // Extrair nome do jogo do cabeçalho
      const gameTitle = this.extractGameTitle(arrayBuffer);
      console.log(`ROM carregada: ${gameTitle || file.name}`);
      console.log(`Tamanho: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

      // Atualizar UI
      const loadButton = document.getElementById('load-rom-btn');
      if (loadButton) {
        loadButton.textContent = `🎮 ${gameTitle || file.name.substring(0, 20)}`;
        loadButton.classList.add('rom-loaded');
      }

      // Iniciar emulação
      this.startEmulation();
      
    } catch (error) {
      console.error('Erro ao carregar ROM:', error);
      alert('Erro ao carregar ROM. Por favor, tente outro arquivo.');
    }
  }

  private validateROMHeader(data: ArrayBuffer): boolean {
    // Verificar se há dados suficientes para o cabeçalho
    if (data.byteLength < 0xC0) {
      return false;
    }

    const view = new DataView(data);
    // O cabeçalho do GBA tem o código de entrada na posição 0x24
    // e o logo do Nintendo na posição 0xA0
    return data.byteLength >= 0xC0;
  }

  private extractGameTitle(data: ArrayBuffer): string {
    if (data.byteLength < 0xAC) {
      return '';
    }

    const bytes = new Uint8Array(data, 0xA0, 12);
    let title = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] !== 0) {
        title += String.fromCharCode(bytes[i]);
      }
    }
    return title.trim();
  }

  private startEmulation(): void {
    if (this.isRunning) {
      this.stopEmulation();
    }

    this.isRunning = true;
    this.emulationLoop();
  }

  private stopEmulation(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private emulationLoop(): void {
    if (!this.isRunning) return;

    // Simular ciclo de CPU (em um emulador real, isso executaria instruções)
    this.update();
    this.render();

    // Manter ~60 FPS
    this.animationId = requestAnimationFrame(() => this.emulationLoop());
  }

  private update(): void {
    // Em um emulador real, aqui seria processada a CPU, GPU, etc.
    // Por enquanto, apenas verificamos os inputs
    if (this.buttons.START && this.buttons.SELECT) {
      // Reset soft
      this.stopEmulation();
      setTimeout(() => this.startEmulation(), 100);
    }
  }

  private render(): void {
    if (!this.ctx || !this.screenBuffer) return;

    // Em um emulador real, aqui seria renderizado o framebuffer da GPU do GBA
    // Por enquanto, mostramos uma tela colorida baseada nos botões pressionados
    
    // Preencher com cor baseada no estado dos botões
    let color = 0xff555555; // Cinza padrão
    
    if (this.buttons.UP) color = 0xffaaaaaa;
    if (this.buttons.DOWN) color = 0xff666666;
    if (this.buttons.LEFT) color = 0xff777777;
    if (this.buttons.RIGHT) color = 0xff888888;
    if (this.buttons.A) color = 0xff5599ff;
    if (this.buttons.B) color = 0xffff5555;

    // Preencher buffer com a cor
    for (let i = 0; i < this.screenBuffer.length; i++) {
      this.screenBuffer[i] = color;
    }

    // Desenhar buffer na tela - converter de Uint32Array para Uint8ClampedArray
    const imageData = this.ctx.createImageData(this.WIDTH, this.HEIGHT);
    const data = new Uint32Array(imageData.data.buffer);
    for (let i = 0; i < this.screenBuffer.length; i++) {
      data[i] = this.screenBuffer[i];
    }
    this.ctx.putImageData(imageData, 0, 0);

    // Mostrar informações de debug
    this.renderDebugInfo();
  }

  private renderDebugInfo(): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.WIDTH, 20);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px monospace';
    
    let status = this.romData ? 'ROM: OK' : 'Sem ROM';
    const pressedButtons = Object.entries(this.buttons)
      .filter(([_, pressed]) => pressed)
      .map(([name, _]) => name)
      .join(' ');
    
    this.ctx.fillText(`${status} | ${pressedButtons}`, 5, 14);
  }

  private renderSplashScreen(): void {
    if (!this.ctx) return;

    // Tela inicial
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Texto centralizado
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GBA Emulator', this.WIDTH / 2, this.HEIGHT / 2 - 20);
    
    this.ctx.font = '12px Arial';
    this.ctx.fillText('Carregue uma ROM para começar', this.WIDTH / 2, this.HEIGHT / 2 + 10);
    
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#888888';
    this.ctx.fillText('Use teclado ou botões na tela', this.WIDTH / 2, this.HEIGHT - 20);
  }

  // Método público para obter estado dos botões
  getButtonState(button: keyof typeof this.buttons): boolean {
    return this.buttons[button];
  }
}
