# BlackBox Learning Experience: Jumping 3D Hover & Light Theme Alignment

The BlackBox Learning image hover interaction in the **Experience** section has been restored to its original branding colors and enhanced with a tactile, jumping 3D hover animation.

## Specifications

### 1. Dark Hover Effect Removal
- **Background Restored**: Removed dark background (`#080B12`), dark border (`#303846`), and pitch-black container background (`#000`), restoring clean, bright `#ffffff` container and card backgrounds.
- **Original Colors Preserved**: The BlackBox Learning image retains 100% of its native colors, branding, and details (`filter: none !important; opacity: 1 !important;`).
- **Typography Intact**: Role title (`#0f172a`), organization name (`#334155`), dates (`#64748b`), and summary text (`#475569`) maintain standard high-contrast text without dark inversion.

### 2. Premium Jumping 3D Hover Effect
- **Elevation / Jump**: Gently lifts upward by `12px` (`transform: translateY(-12px)`).
- **Scale**: Subtle scale increase of `1.04` (`scale(1.04)`).
- **Spatial 3D Tilt**: Real 3D depth with `perspective: 1000px` on the wrapper and `rotateX(3.5deg)` on the frame with `transform-origin: center bottom`.
- **Realistic Floating Shadow**: Multi-layered soft ambient and key shadows (`0 24px 38px -8px rgba(15, 23, 42, 0.16), 0 12px 20px -6px rgba(15, 23, 42, 0.08)`).
- **Natural Timing**: `350ms cubic-bezier(0.2, 0.8, 0.2, 1)` easing curve for lift and smooth return on mouse leave.
- **Zero Layout Shifts**: Fully GPU-accelerated via `transform` and `box-shadow` without margin or dimension changes.

### 3. Accessibility & Responsiveness
- **Keyboard Navigation**: `tabindex="0" role="img"` enabled with `:focus-visible` styling (`outline: 2px solid #3b82f6; outline-offset: 4px`).
- **Reduced Motion**: Full support for `@media (prefers-reduced-motion: reduce)` with `transform: none !important; transition: none !important;`.
- **Touch / Mobile**: Protected via `@media (hover: hover) and (pointer: fine)` so touch devices remain stable without sticking in elevated states.
