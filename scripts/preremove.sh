#!/bin/bash

rm -f /usr/bin/claude-floating

for user_home in /home/*; do
    if [ -d "$user_home" ]; then
        autostart_file="$user_home/.config/autostart/claude-floating.desktop"
        if [ -f "$autostart_file" ]; then
            rm -f "$autostart_file"
        fi
    fi
done