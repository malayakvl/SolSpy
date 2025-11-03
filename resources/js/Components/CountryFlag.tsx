import React from 'react';

interface CountryFlagProps {
  countryCode?: string;
  countryName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  rounded?: boolean; // Add rounded prop for circular display
}

// Mapping of country names to ISO codes for common countries
const countryNameToCode: Record<string, string> = {
  'Spain': 'ES',
  'United States': 'US',
  'United States of America': 'US',
  'UK': 'GB',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Russia': 'RU',
  'Mexico': 'MX',
  'South Korea': 'KR',
  'Korea': 'KR',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Ukraine': 'UA',
  'Turkey': 'TR',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Ireland': 'IE',
  'New Zealand': 'NZ',
  'Singapore': 'SG',
  'Hong Kong': 'HK',
  'Israel': 'IL',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
};

export default function CountryFlag({ 
  countryCode, 
  countryName, 
  size = 'medium',
  className = '',
  rounded = false
}: CountryFlagProps) {
  // Define sizes for the flag images
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const flagSize = sizeClasses[size] || sizeClasses.medium;
  
  // Use provided countryCode or try to find it by country name
  const isoCode = countryCode || countryNameToCode[countryName];

  // Handle cases where both country code and name mapping are missing
  if (!isoCode) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span className="text-gray-500 text-sm">{countryName || 'Unknown'}</span>
      </span>
    );
  }

  // Rounded classes for circular display
  const roundedClass = rounded ? 'rounded-full object-cover' : 'rounded';

  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={`https://flagcdn.com/${size === 'small' ? '16x12' : size === 'medium' ? '24x18' : '32x24'}/${isoCode.toLowerCase()}.png`}
        alt={countryName}
        className={`${flagSize} ${roundedClass} mr-2 inline-block`}
        onError={(e) => {
          // Fallback to text if flag image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span className="text-gray-500">${isoCode} ${countryName}</span>`;
          }
        }}
      />
      <span>{countryName}</span>
    </span>
  );
}