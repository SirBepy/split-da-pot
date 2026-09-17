import { createElement } from 'react';
import { getIcon } from './iconPool';

interface IconAvatarProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

const PX: Record<'sm' | 'md' | 'lg', number> = { sm: 16, md: 20, lg: 28 };

export function IconAvatar({ icon, size = 'md' }: IconAvatarProps) {
  return (
    <span className={`avatar avatar--${size}`}>
      {createElement(getIcon(icon), { size: PX[size], weight: 'fill' })}
    </span>
  );
}
