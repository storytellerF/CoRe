#!/bin/bash

# Create a new tmux session
tmux new-session -d -s my_session
tmux send-keys -t my_session:0 'sh scripts/start-web.sh' C-m


tmux new-window -t my_session -n 'server run'
tmux send-keys -t my_session:1 'sh scripts/start-server.sh' C-m

tmux new-window -t my_session -n 'dev'
tmux send-keys -t my_session:2 'sh scripts/continuous-server.sh' C-m

# Attach to the tmux session
tmux attach-session -t my_session