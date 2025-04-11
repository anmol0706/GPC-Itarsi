# Developer Image

This folder is for storing your profile image that will be displayed in the "Developed By" popup.

## How to Add Your Developer Image

1. Add your profile image to this folder
2. Name the image `anmol.jpg` (or update the path in the DeveloperPopup component)
3. Make sure the image path in the `DeveloperPopup.jsx` component matches the filename you use here
4. Recommended image size: 300x300 pixels (square images work best)
5. Supported formats: JPG, PNG, WebP

## Example

If you have an image named `anmol.jpg` in this folder, make sure the developer object in `DeveloperPopup.jsx` has:

```jsx
const developer = {
  name: 'Anmol Malviya',
  // ...other details
  image: '/team/anmol.jpg',
  // ...
};
```

## Default Fallback

If an image is not found, a placeholder will be shown automatically.
