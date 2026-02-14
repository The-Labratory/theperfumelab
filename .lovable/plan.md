

# Expand Scent Lab Notes Library

## Overview
Massively expand the available fragrance notes in the Scent Lab from 12 to 48+ notes, inspired by the actual ingredients used across Scentra's perfume collection. The notes will be organized into the existing three layers (Top, Heart, Base) and also increase the max-per-layer limit to accommodate the larger palette.

## Changes

### 1. Expand the `availableNotes` array in `ScentLabPage.tsx`

Replace the current 12 notes (4 per layer) with a comprehensive library of ~48 notes (16 per layer):

**Top Notes (16):**
- Bergamot, Lemon Zest, Pink Pepper, Grapefruit, Blood Orange, Green Apple, Pear, Black Currant, Sparkling Citrus, Mandarin, Cardamom, Ginger, Saffron, Mint, Eucalyptus, Aldehydes

**Heart Notes (16):**
- Rose, Jasmine, Iris, Lavender, Violet, Lilac, Peony, Tuberose, White Florals, Coffee, Cinnamon, Nutmeg, Geranium, Magnolia, Orange Blossom, Ylang-Ylang

**Base Notes (16):**
- Vanilla, Sandalwood, White Musk, Amber, Patchouli, Cedarwood, Vetiver, Oud, Tonka Bean, Benzoin, Cashmere Wood, Dark Cherry, Almond, Cocoa, Leather, Smoky Incense

### 2. Update blend limits
- Increase max notes per layer from 2 to 3
- Increase total blend size from 6 to 9

### 3. Add scrollable grid for note palette
- Make the note palette section scrollable since 16 notes per layer won't fit without scrolling
- Use a `ScrollArea` component for the note grid
- Adjust grid to `grid-cols-3` or `grid-cols-4` to fit more notes compactly

### 4. Update harmony score calculation
- Adjust the formula to account for the new max of 9 notes instead of 6

## Technical Details

All changes are confined to a single file: `src/pages/ScentLabPage.tsx`.

- The `availableNotes` array will be expanded with carefully chosen colors (HSL values) for each note to maintain the visual aesthetic
- The `addNote` function's layer limit check changes from `>= 2` to `>= 3`
- The harmony score formula denominator changes from 6 to 9
- The blend counter display changes from `/6` to `/9`
- A `ScrollArea` import will be added from `@/components/ui/scroll-area`
- The note grid will be wrapped in a `ScrollArea` with a fixed max height

