#!/bin/bash
# Compress all GLB models with Draco compression
set -e

RELICS_DIR="public/models/relics"
ENV_DIR="public/models/env"

compress() {
  local input="$1"
  local basename=$(basename "$input" .glb)
  local dir=$(dirname "$input")
  local output="${dir}/${basename}.draco.glb"
  
  echo "Compressing: $input"
  echo "  → $output"
  
  npx -y @gltf-transform/cli optimize "$input" "$output" --compress draco 2>&1 || {
    echo "  ⚠ Draco failed, trying meshopt..."
    npx -y @gltf-transform/cli optimize "$input" "$output" --compress meshopt 2>&1 || {
      echo "  ✗ Both failed, copying original"
      cp "$input" "$output"
    }
  }
  
  local orig_size=$(ls -lh "$input" | awk '{print $5}')
  local new_size=$(ls -lh "$output" | awk '{print $5}')
  echo "  ✓ $orig_size → $new_size"
  echo ""
}

echo "=== Compressing Relic Models ==="
for f in "$RELICS_DIR"/*.glb; do
  [[ "$f" == *".draco.glb" ]] && continue
  compress "$f"
done

echo "=== Compressing Environment Models ==="
for f in "$ENV_DIR"/*.glb; do
  [[ "$f" == *".draco.glb" ]] && continue
  compress "$f"
done

echo "=== Done! ==="
echo ""
echo "Original sizes:"
du -sh "$RELICS_DIR"/*.glb | grep -v draco
echo ""
echo "Compressed sizes:"
du -sh "$RELICS_DIR"/*.draco.glb "$ENV_DIR"/*.draco.glb 2>/dev/null
