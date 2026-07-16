import React from 'react';
import { 
  ShieldAlert, 
  Bath, 
  Landmark, 
  PartyPopper, 
  Pill, 
  Banknote, 
  Wifi, 
  Droplets,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils';

export type MapPinCategory = 'sos' | 'toilet' | 'cultural' | 'festival' | 'pharmacy' | 'atm' | 'wifi' | 'water';

interface MapPinProps extends React.HTMLAttributes<HTMLDivElement> {
  category: MapPinCategory | string;
  selected?: boolean;
}

export function MapPin({ category, selected, className, ...props }: MapPinProps) {
  const getPinConfig = (cat: string) => {
    switch (cat) {
      case 'sos':
        return { icon: ShieldAlert, color: 'bg-[#C93B3B]', iconColor: 'text-white' };
      case 'toilet':
        return { icon: Bath, color: 'bg-[#1E6F8A]', iconColor: 'text-white' };
      case 'cultural':
        return { icon: Landmark, color: 'bg-[#D4A843]', iconColor: 'text-white' };
      case 'festival':
        return { icon: PartyPopper, color: 'bg-[#D4A843]', iconColor: 'text-white' };
      case 'pharmacy':
        return { icon: Pill, color: 'bg-[#22c55e]', iconColor: 'text-white' };
      case 'atm':
        return { icon: Banknote, color: 'bg-[#1E6F8A]', iconColor: 'text-white' };
      case 'wifi':
        return { icon: Wifi, color: 'bg-[#1E6F8A]', iconColor: 'text-white' };
      case 'water':
        return { icon: Droplets, color: 'bg-[#3b82f6]', iconColor: 'text-white' };
      default:
        return { icon: HelpCircle, color: 'bg-gray-500', iconColor: 'text-white' };
    }
  };

  const { icon: Icon, color, iconColor } = getPinConfig(category);

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full shadow-md cursor-pointer transition-transform duration-200",
        "w-8 h-8",
        color,
        selected ? "scale-125 ring-2 ring-white z-10" : "hover:scale-110",
        className
      )}
      {...props}
    >
      <Icon className={cn("w-4 h-4", iconColor)} />
      {/* Pointer triangle */}
      <div 
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0",
          "border-l-[4px] border-l-transparent",
          "border-r-[4px] border-r-transparent",
          "border-t-[6px]",
          category === 'sos' ? "border-t-[#C93B3B]" :
          category === 'cultural' || category === 'festival' ? "border-t-[#D4A843]" :
          category === 'pharmacy' ? "border-t-[#22c55e]" :
          category === 'water' ? "border-t-[#3b82f6]" :
          category === 'toilet' || category === 'atm' || category === 'wifi' ? "border-t-[#1E6F8A]" :
          "border-t-gray-500"
        )} 
      />
    </div>
  );
}
