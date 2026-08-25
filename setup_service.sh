#!/bin/bash
# Setup script to configure systemd user service for 24x7 web server execution

SERVICE_DIR="$HOME/.config/systemd/user"
mkdir -p "$SERVICE_DIR"

cp /home/bsalman/MY-LOCAL-WEBSITE/basith-website.service "$SERVICE_DIR/basith-website.service"

systemctl --user daemon-reload
systemctl --user enable basith-website.service
systemctl --user restart basith-website.service

echo "========================================================"
echo "✔ Basith Salman Portfolio Service Installed & Enabled!"
echo "Service Status:"
systemctl --user status basith-website.service --no-pager
echo "========================================================"
