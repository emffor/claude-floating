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
- Node.js 20.18.2+ 
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
```

## 📦 Build e Versionamento

**Comandos de build com versionamento automático:**

```bash
# Patch: 1.0.0 → 1.0.1 (correções de bugs)
yarn build

# Minor: 1.0.0 → 1.1.0 (novas funcionalidades)
yarn build:minor

# Major: 1.0.0 → 2.0.0 (mudanças que quebram compatibilidade)
yarn build:major

# Build sem versionamento (manual)
yarn dist
```

**Resultado:** Cada comando atualiza automaticamente a versão no `package.json` e gera o arquivo `.deb` correspondente na pasta `dist/`.

## 📁 Estrutura do Projeto

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
- **Ctrl+T**: Nova aba
- **Ctrl+W**: Fechar aba atual
- **ESC**: Fechar janela quando focada
- **Arrastar**: Mover janela pela tela

**Funcionalidades:**
- ✅ Sistema de abas integrado
- ✅ Janela sempre no topo
- ✅ Login persistente no Claude.ai
- ✅ Arrastável pela tela
- ✅ Atalho global funcionando
- ✅ Sem bordas (frameless)
- ✅ Versionamento automático nos builds

## 🔧 Scripts Disponíveis

```bash
yarn start          # Executar em desenvolvimento
yarn build          # Build patch (1.0.0 → 1.0.1)
yarn build:minor    # Build minor (1.0.0 → 1.1.0)  
yarn build:major    # Build major (1.0.0 → 2.0.0)
yarn dist           # Build sem versionamento
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

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento:** `yarn start`
2. **Correção de bug:** `yarn build`
3. **Nova funcionalidade:** `yarn build:minor`
4. **Mudança breaking:** `yarn build:major`
5. **Instalar:** `sudo dpkg -i dist/claude-floating_X.X.X_amd64.deb`

## 📝 Notas Técnicas

- Usa sessão persistente para manter login
- User-Agent personalizado para compatibilidade
- Drag habilitado em toda área exceto inputs
- WebSecurity desabilitado para funcionamento
- Sistema de abas com título dinâmico
- Versionamento semântico automático

## 📄 Licença

MIT License

## 👤 Autor

**emfeloan**
- Email: emfeloan@gmail.com