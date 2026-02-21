import React from 'react';
import { icon } from '../config/theme';
import FuelIcon from '../components/FuelIcon';
import CargoIcon from '../components/CargoIcon';
import CargoOpenIcon from '../components/CargoOpenIcon';

/**
 * Unified icon renderer - handles both custom components and emoji
 * @param {string} iconKey - Key from THEME.icons (e.g., 'fuel', 'collect', 'approved')
 * @param {object} props - Optional props to pass to custom components (className, width, height)
 * @returns {JSX.Element} - Custom component or emoji span
 */
export const ic = (iconKey, props = {}) => {
  const iconValue = icon(iconKey);
  
  // Handle custom component icons
  if (iconValue === 'CUSTOM_FUEL') return <FuelIcon {...props} />;
  if (iconValue === 'CUSTOM_CARGO') return <CargoIcon {...props} />;
  if (iconValue === 'CUSTOM_CARGO_OPEN') return <CargoOpenIcon {...props} />;
  
  // Handle emoji icons
  return <span {...props}>{iconValue}</span>;
};
