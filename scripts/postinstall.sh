#!/bin/bash

ln -sf "/opt/claude-floating/claude-floating" /usr/bin/claude-floating
chmod +x /usr/bin/claude-floating

CHROME_SANDBOX="/opt/claude-floating/chrome-sandbox"
if [ -f "$CHROME_SANDBOX" ]; then
   chown root:root "$CHROME_SANDBOX"
   chmod 4755 "$CHROME_SANDBOX"
fi

for user_home in /home/*; do
   if [ -d "$user_home" ] && [ "$(basename "$user_home")" != "lost+found" ]; then
       username=$(basename "$user_home")
       user_id=$(id -u "$username" 2>/dev/null || echo "")
       
       if [ -n "$user_id" ]; then
           autostart_dir="$user_home/.config/autostart"
           desktop_file="$autostart_dir/claude-floating.desktop"
           
           sudo -u "$username" mkdir -p "$autostart_dir" 2>/dev/null || true
           
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
           
           if [ -f "$desktop_file" ]; then
               sudo -u "$username" chmod +x "$desktop_file" 2>/dev/null || true
               chown "$username:$username" "$desktop_file" 2>/dev/null || true
           fi
       fi
   fi
done

exit 0