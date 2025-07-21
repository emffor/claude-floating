#!/bin/bash

# Criar symlink para o executável
ln -sf "/opt/claude-floating/claude-floating" /usr/bin/claude-floating
chmod +x /usr/bin/claude-floating

# Fix chrome-sandbox
CHROME_SANDBOX="/opt/claude-floating/chrome-sandbox"
if [ -f "$CHROME_SANDBOX" ]; then
   chown root:root "$CHROME_SANDBOX"
   chmod 4755 "$CHROME_SANDBOX"
fi

# Configurar autostart para todos os usuários
for user_home in /home/*; do
   if [ -d "$user_home" ] && [ "$(basename "$user_home")" != "lost+found" ]; then
       username=$(basename "$user_home")
       user_id=$(id -u "$username" 2>/dev/null || echo "")
       
       if [ -n "$user_id" ]; then
           autostart_dir="$user_home/.config/autostart"
           desktop_file="$autostart_dir/claude-floating.desktop"
           
           # Criar diretório com permissões corretas
           sudo -u "$username" mkdir -p "$autostart_dir" 2>/dev/null || true
           
           # Criar arquivo desktop com path completo
           sudo -u "$username" tee "$desktop_file" > /dev/null 2>&1 << 'DESKTOP_EOF' || true
[Desktop Entry]
Name=Claude Floating
Comment=Claude AI floating window
Exec=/usr/bin/claude-floating --hidden
Type=Application
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
Terminal=false
Categories=Utility;
StartupWMClass=claude-floating
DESKTOP_EOF
           
           # Garantir permissões corretas
           if [ -f "$desktop_file" ]; then
               sudo -u "$username" chmod +x "$desktop_file" 2>/dev/null || true
               chown "$username:$username" "$desktop_file" 2>/dev/null || true
           fi
       fi
   fi
done

exit 0