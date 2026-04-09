# Emulador GBA para Navegador

Um emulador de Game Boy Advance (GBA) simples desenvolvido em HTML5, CSS3 e JavaScript puro para ser executado diretamente no navegador.

## 🎮 Funcionalidades

- **Interface Moderna**: Design responsivo com controles visuais inspirados no GBA original
- **Carregamento de ROMs**: Suporte para arquivos `.gba` e `.bin`
- **Controles Dual**:
  - Teclado (setas, Z, X, Enter, Shift)
  - Botões na tela (mouse/touch)
- **Visualização em Tempo Real**: Display do estado dos botões e informações da ROM
- **Sem Dependências**: Código 100% vanilla JavaScript

## 🚀 Como Usar

### Método 1: Abrir Diretamente no Navegador

1. Navegue até a pasta do projeto
2. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari)
3. Clique em "📁 Carregar ROM (.gba)" e selecione um arquivo de jogo GBA
4. Use o teclado ou os botões na tela para jogar

### Método 2: Servidor Local (Recomendado)

```bash
# Python 3
python -m http.server 8000

# Ou com Node.js (npx)
npx serve .
```

Depois acesse `http://localhost:8000` no seu navegador.

## ⌨️ Controles do Teclado

| Tecla | Função |
|-------|--------|
| ↑ ↓ ← → | Direcional (D-Pad) |
| Z | Botão A |
| X | Botão B |
| Enter | Start |
| Shift | Select |

## 📁 Estrutura do Projeto

```
gba-emulator/
├── index.html          # Arquivo principal com HTML, CSS e JavaScript
└── README.md           # Este arquivo
```

## 🔧 Arquitetura

O emulador consiste em:

1. **HTML5 Canvas**: Renderização da tela do GBA (240x160 pixels)
2. **CSS3 Moderno**: Interface responsiva com gradientes e animações
3. **JavaScript Puro**:
   - Classe `GBAEmulator` com toda a lógica de emulação
   - Sistema de input para teclado e touch
   - Loop de renderização a 60 FPS
   - Leitura e validação de ROMs

## ⚠️ Limitações Importantes

Este é um **emulador demonstrativo** com as seguintes limitações:

- **CPU**: Implementação simplificada (não executa instruções ARM reais)
- **PPU (Vídeo)**: Renderização básica sem suporte a sprites/backgrounds do GBA
- **APU (Áudio)**: Sem suporte a áudio
- **Memória**: Mapeamento básico de memória

Para emulação completa de jogos GBA, considere projetos como:
- [mGBA](https://mgba.io/) (Desktop)
- [iDeaS](http://desmume.org/) (DS/GBA)
- [VBA-M](https://vba-m.com/) (Multi-plataforma)

## 🎯 Casos de Uso

- **Educacional**: Aprender sobre arquitetura de emuladores
- **Prototipagem**: Testar interfaces e controles
- **Base para Expansão**: Ponto de partida para um emulador completo

## 🛠️ Tecnologias Utilizadas

- HTML5 Canvas API
- CSS3 Grid e Flexbox
- JavaScript ES6+
- FileReader API
- RequestAnimationFrame

## 📝 Próximos Passos (Para Desenvolvedores)

Se quiser expandir este projeto, considere implementar:

1. **CPU ARM7TDMI**: Decodificador de instruções ARM/Thumb
2. **PPU Completa**: Backgrounds, sprites, blending, alpha
3. **APU**: Canais de som PSG e DMA
4. **Save States**: Serialização do estado da memória
5. **Shaders**: Filtros de vídeo (scanlines, HQ2x, etc.)
6. **Netplay**: Multiplayer via WebSocket

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e pessoais.

## 🙏 Créditos

Desenvolvido como demonstração de emulação de GBA em JavaScript puro.

---

**Divirta-se!** 🎮✨
