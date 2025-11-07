# TV Remote Focus Management System

## Overview
The Map Screen now features a unified focus management system that ensures only ONE button can be focused at a time, preventing conflicting focus states when using TV remote controls.

## Button Layout (Left to Right)
```
[Menu] → [Directions] → [Layer] → [Zoom In]
                                    [Zoom Out]
```

## Focus Navigation

### LEFT/RIGHT Navigation
- **RIGHT**: `Menu` → `Directions` → `Layer` → `Zoom In`
- **LEFT**: `Zoom In/Out` ← `Layer` ← `Directions` ← `Menu`

### UP/DOWN Navigation
- **Zoom Buttons**:
  - UP: Move from `Zoom Out` to `Zoom In`, or perform Zoom In action
  - DOWN: Move from `Zoom In` to `Zoom Out`, or perform Zoom Out action
- **Top Row Buttons**:
  - UP: Move from `Layer` to `Directions` to `Menu`
  - DOWN: Move from `Directions` to `Layer`

### SELECT/OK Button
- **Menu Button**: Opens the layer menu panel
- **Directions Button**: Opens the directions panel
- **Layer Button**: Toggles layer visibility
- **Zoom In Button**: Performs zoom in action
- **Zoom Out Button**: Performs zoom out action

## Key Features

### 1. Exclusive Focus State
```typescript
type FocusedButton = 'menu' | 'directions' | 'layer' | 'zoomIn' | 'zoomOut' | null;
const [focusedButton, setFocusedButton] = useState<FocusedButton>('menu');
```
Only ONE button can have focus at any time, managed through a single state variable.

### 2. Unified Animation System
```typescript
const buttonScaleAnims = useRef({
  menu: new Animated.Value(1),
  directions: new Animated.Value(1),
  layer: new Animated.Value(1),
  zoomIn: new Animated.Value(1),
  zoomOut: new Animated.Value(1),
}).current;
```
All buttons share the same animation system with consistent scaling (1.1x when focused).

### 3. Visual Focus Indicators
- **Golden Border**: 3px #FFD700 border when focused
- **Golden Glow**: Elevated shadow with golden color
- **Scale Animation**: 1.1x scale with spring animation
- **Background Change**: Darker blue (#0056b3) when focused

### 4. Auto-Clear Focus
When any panel/drawer opens, ALL button focus is automatically cleared:
```typescript
useEffect(() => {
  if (menuOpen || directionsOpen || drawerHasFocus || directionsHasFocus) {
    setFocusedButton(null);
  }
}, [menuOpen, directionsOpen, drawerHasFocus, directionsHasFocus]);
```

### 5. Focus Restoration
When a panel closes, focus automatically returns to its corresponding button:
- Menu closes → Focus returns to `menu` button
- Directions panel closes → Focus returns to `directions` button

## Implementation Details

### Button Components
All buttons use the same base style (`circleButton`) with 56x56px circular design:

```typescript
<TouchableOpacity
  style={[
    styles.circleButton,
    focusedButton === 'menu' && styles.buttonFocused,
  ]}
  onPress={handleAction}
>
  <Text style={styles.buttonText}>Icon</Text>
</TouchableOpacity>
```

### Navigation Logic
Navigation between buttons follows this pattern:
1. Check current `focusedButton` state
2. Determine next button based on direction
3. Update `focusedButton` state
4. Trigger animations automatically via useEffect

### No Overlapping Focus
The system guarantees:
- ✅ Only one button focused at a time
- ✅ Clear visual feedback for focused button
- ✅ Smooth transitions between focus states
- ✅ No conflicting animations
- ✅ Predictable navigation flow

## Testing on TV
1. Start with `menu` button focused (default)
2. Press RIGHT to move through buttons
3. Press LEFT to move back
4. Press UP/DOWN on zoom buttons to navigate or zoom
5. Press SELECT/OK to activate focused button
6. Verify only one button shows focus indicator at a time

## Debug Information
In development mode, the debug overlay shows:
```
Focused: [current button name or NONE]
Drawer Focus: YES/NO
Map Ready: YES/NO
```

This helps verify the focus state at all times.
