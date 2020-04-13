#!/bin/bash

for f in $(ls hooks); do
    ln -sf ../../hooks/$f .git/hooks
done
