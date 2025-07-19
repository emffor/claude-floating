# Claude Floating

Uma janela flutuante para Claude.ai no Ubuntu, com atalho global e sessão persistente.

## 🚀 Instalação Rápida (.deb)

**Opção 1: Instalar pacote .deb (Recomendado)**

```bash
# Baixar o .deb da pasta dist/ ou releases
sudo dpkg -i claude-floating_1.0.0_amd64.deb

# Se houver erro de dependências:
sudo apt-get install -f
```

**Executar:**
```bash
claude-floating
# Ou usar atalho: Ctrl+Shift+C
```

## 🛠️ Desenvolvimento

**Pré-requisitos:**
- Node.js 18+ 
- Yarn
- Ubuntu/Linux

**Instalação:**

```bash
# Clonar repositório
git clone <seu-repo>
cd claude-floating

# Instalar dependências
yarn install

# Executar em desenvolvimento
yarn start

# Gerar build .deb
yarn build
```

## 📦 Estrutura do Projeto

```
claude-floating/
├── main.js              # Código principal Electron
├── package.json         # Configurações e dependências
├── .gitignore          # Arquivos ignorados
├── dist/               # Builds gerados
│   └── claude-floating_1.0.0_amd64.deb
└── README.md           # Este arquivo
```

## ⚙️ Configuração

**Auto-start no login (opcional):**

```bash
mkdir -p ~/.config/autostart
nano ~/.config/autostart/claude-floating.desktop
```

```ini
[Desktop Entry]
Name=Claude Floating
Exec=claude-floating
Type=Application
Hidden=false
StartupNotify=false
Terminal=false
```

## 🎮 Uso

**Atalhos:**
- **Ctrl+Shift+C**: Abrir/fechar janela flutuante
- **ESC**: Fechar janela quando focada
- **Arrastar**: Mover janela pela tela

**Funcionalidades:**
- ✅ Janela sempre no topo
- ✅ Login persistente no Claude.ai
- ✅ Arrastável pela tela
- ✅ Atalho global funcionando
- ✅ Sem bordas (frameless)

## 🔧 Scripts Disponíveis

```bash
yarn start          # Executar em desenvolvimento
yarn build          # Gerar .deb para produção
yarn dist           # Gerar .deb (mesmo que build)
```

## 📋 Dependências

**Produção:**
- Electron 37.2.3

**Desenvolvimento:**
- electron-builder 26.0.12

## 🗑️ Desinstalação

```bash
sudo apt remove claude-floating
```

## 🐛 Solução de Problemas

**Claude.ai não carrega:**
- Cloudflare pode bloquear Electron ocasionalmente
- Tente aguardar alguns minutos e executar novamente

**Atalho não funciona:**
- Reinicie o aplicativo
- Verifique se não há conflito com outros atalhos

**Erro de FUSE (se usar AppImage):**
```bash
sudo apt install fuse libfuse2
```

## 📝 Notas Técnicas

- Usa sessão persistente para manter login
- User-Agent personalizado para compatibilidade
- Drag habilitado em toda área exceto inputs
- WebSecurity desabilitado para funcionamento

## 📄 Licença

MIT License

## 👤 Autor

**emfeloan**
- Email: emfeloan@gmail.com