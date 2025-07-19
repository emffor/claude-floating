# Criar arquivo
cat > scripts/preremove.sh << 'EOF'
#!/bin/bash

# Remover symlink
rm -f /usr/bin/claude-floating

# Remover autostart para todos os usuários
for user_home in /home/*; do
    if [ -d "$user_home" ]; then
        autostart_file="$user_home/.config/autostart/claude-floating.desktop"
        if [ -f "$autostart_file" ]; then
            rm -f "$autostart_file"
        fi
    fi
done
EOF

# Dar permissões
chmod +x scripts/postinstall.sh scripts/preremove.sh

# Verificar
ls -la scripts/