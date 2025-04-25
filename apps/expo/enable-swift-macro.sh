#!/bin/bash
echo "Run script to enable Swift Macro in Xcode"
# Check if 'defaults' command exists
if ! command -v defaults &> /dev/null; then
    echo "Info: 'defaults' command not found. This script requires macOS."
    exit 0
fi
defaults write com.apple.dt.Xcode IDESkipPackagePluginFingerprintValidatation -bool YES
defaults write com.apple.dt.Xcode IDESkipMacroFingerprintValidation -bool YES