function getTextColor(hexColor) {
  
  function getContrast(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
  
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    return luminance;
  }
  
  const contrast = getContrast(hexColor);
  
  const threshold = 0.5;
  const midThreshold = 0.4; // Adjust as needed
  
  if (contrast > threshold) {
    return '#000000'; // Black text
  } else if (contrast > midThreshold) {
    return '#333333'; // Dark gray text
  } else {
    return '#FFFFFF'; // White text
  }
}
  