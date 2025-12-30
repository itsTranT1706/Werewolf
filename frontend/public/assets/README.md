# Game Assets Directory

Place your fantasy/medieval UI assets here. Recommended sources:
- Kenney Fantasy UI: https://kenney.nl/assets/ui-pack-rpg-expansion
- Kenney Medieval RTS: https://kenney.nl/assets/medieval-rts

## Required Assets Structure

```
assets/
├── backgrounds/
│   └── dark-forest.jpg      # Dark fantasy background (1920x1080+)
├── textures/
│   ├── wood-panel.png       # Wood texture for buttons
│   ├── stone-panel.png      # Stone texture for inputs
│   └── parchment.png        # Parchment texture
├── ui/
│   └── corner-ornament.png  # Decorative corner element
└── effects/
    └── fog.png              # Semi-transparent fog overlay
```

## Asset Guidelines

### Backgrounds
- Dark, moody atmosphere (forest, village at night, moonlit scene)
- Resolution: 1920x1080 minimum
- Should work with 40% brightness filter applied

### Textures
- Seamless/tileable preferred
- Wood: Dark oak, weathered look
- Stone: Gray, carved appearance
- Parchment: Aged, yellowed paper

### UI Elements
- Gold/bronze metallic accents
- Medieval ornamental style
- PNG with transparency

## Placeholder Colors (if no assets)

The CSS includes fallback gradients that work without images:
- Panels: Dark brown gradient
- Buttons: Wood-tone gradient
- Inputs: Stone-gray gradient
