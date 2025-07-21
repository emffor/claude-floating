#!/bin/bash

# Criar symlink para o executável
ln -sf "/opt/Claude Floating/claude-floating" /usr/bin/claude-floating

# Configurar autostart para todos os usuários
for user_home in /home/*; do
    if [ -d "$user_home" ] && [ "$(basename "$user_home")" != "lost+found" ]; then
        username=$(basename "$user_home")
        autostart_dir="$user_home/.config/autostart"
        desktop_file="$autostart_dir/claude-floating.desktop"
        
        # Criar diretório se não existir
        if [ ! -d "$autostart_dir" ]; then
            sudo -u "$username" mkdir -p "$autostart_dir" 2>/dev/null || true
        fi
        
        # Criar arquivo desktop apenas se diretório for acessível
        if [ -w "$autostart_dir" ] || sudo -u "$username" test -w "$autostart_dir" 2>/dev/null; then
            sudo -u "$username" cat > "$desktop_file" << 'EOF' 2>/dev/null || true
[Desktop Entry]
Name=Claude Floating
Exec=claude-floating
Type=Application
Hidden=false
StartupNotify=false
Terminal=false
Categories=Utility;
StartupWMClass=claude-floating
EOF
            
            # Definir permissões se arquivo foi criado
            if [ -f "$desktop_file" ]; then
                sudo -u "$username" chmod +x "$desktop_file" 2>/dev/null || true
            fi
        fi
    fi
done

exit 0