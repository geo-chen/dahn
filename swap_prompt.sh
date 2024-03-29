#!/bin/bash

# Define file names
initial_file="initial_prompt.txt"
secondary_file="secondary_prompt.txt"
temp_file="temp_swap.txt"

# Check if initial file exists
if [ ! -e "$initial_file" ]; then
    echo "Error: $initial_file does not exist."
    exit 1
fi

# Check if secondary file exists
if [ ! -e "$secondary_file" ]; then
    echo "Error: $secondary_file does not exist."
    exit 1
fi

# Swap contents using a temporary file
cp "$initial_file" "$temp_file"
cp "$secondary_file" "$initial_file"
cp "$temp_file" "$secondary_file"

# Remove temporary file
rm "$temp_file"

echo "Files swapped successfully."
