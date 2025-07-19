cat > scripts/postinstall.sh << 'EOF'
#!/bin/bash

# Criar symlink para o executável
ln -sf "/opt/Claude Floating/claude-floating" /usr/bin/claude-floating

# Configurar autostart para todos os usuários
for user_home in /home/*; do
    if [ -d "$user_home" ]; then
        username=$(basename "$user_home")
        autostart_dir="$user_home/.config/autostart"
        
        sudo -u "$username" mkdir -p "$autostart_dir"
        
        sudo -u "$username" cat > "$autostart_dir/claude-floating.desktop" << EOF
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
        
        sudo -u "$username" chmod +x "$autostart_dir/claude-floating.desktop"
    fi
done
EOF