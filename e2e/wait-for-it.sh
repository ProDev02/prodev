#!/bin/bash
# wait-for-it.sh
host="$1"
shift
port="$1"
shift
timeout=30
while ! nc -z $host $port; do
  timeout=$((timeout - 1))
  if [ $timeout -le 0 ]; then
    echo "Timed out waiting for $host:$port"
    exit 1
  fi
  echo "Waiting for $host:$port..."
  sleep 1
done
exec "$@"
