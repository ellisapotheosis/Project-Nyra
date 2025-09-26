#!/bin/bash
echo "Launching Nyra Workspace Scaffold..."
for dir in nyra-read-aloud-ext nyra-voice-agent nyra-ui-fixer nyra-installer-fixer nyra-agent-mortgage; do
  code $PWD/$dir
done