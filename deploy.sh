#!/bin/bash
# Automatic Deployment Script for Personal Website Portfolio

echo "🚀 Syncing local portfolio to Apache usintellisoft.com web root..."
cp -r /home/bsalman/MY-LOCAL-WEBSITE/* /var/www/usintellisoft/public/

echo "📦 Committing and pushing updates to GitHub..."
git add .
git commit -m "Update portfolio website - $(date)"
gh auth setup-git
git push origin main

echo "✅ Live GitHub Pages site updating at: https://musdan.github.io/basithsalman-portfolio/"
