#!/bin/bash
# Script to apply the merge conflict resolution to PR #2
# Run this script from the repository root

set -e

echo "Applying merge conflict resolution to PR #2..."
echo ""

# Fetch the resolved commits from PR #10's branch  
git fetch origin copilot/update-design-modular-product-roadmap

# Checkout PR #2's branch
git checkout copilot/design-modular-product-roadmap

# Cherry-pick the merge commit that resolves all conflicts
echo "Cherry-picking merge commit ed8bb9c..."
git cherry-pick ed8bb9c

# Push the updated branch
echo "Pushing to remote..."
git push origin copilot/design-modular-product-roadmap

echo ""
echo "✅ Done! PR #2 should now be mergeable."
echo "Verify at: https://github.com/muammarlone/MergePRCockPit/pull/2"
