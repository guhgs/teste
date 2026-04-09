import { GBAEmulator } from './gba';
import './styles.css';

// Inicializa o emulador quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  const emulator = new GBAEmulator();
  emulator.init();
});
