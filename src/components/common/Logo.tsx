import { Link } from 'react-router-dom';

interface LogoProps {
  dark?: boolean;
  size?: 'sm' | 'md';
  showText?: boolean;
  linkTo?: string;
}

const sizeMap = {
  sm: { icon: 'w-7 h-7', inner: 'w-4 h-4', text: 'text-lg' },
  md: { icon: 'w-8 h-8', inner: 'w-5 h-5', text: 'text-xl' },
};

export default function Logo({ dark = false, size = 'md', showText = true, linkTo }: LogoProps) {
  const s = sizeMap[size];
  const Wrapper = linkTo ? Link : 'div';

  return (
    <Wrapper to={linkTo || '#'} className="inline-flex items-center gap-2">
      <div className={`${s.icon} bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-200`}>
        <svg className={`${s.inner} text-white`} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
          <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
          <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
        </svg>
      </div>
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight ${dark ? 'text-orange-400' : 'text-orange-500'}`}>
          Market<span className={dark ? 'text-white' : 'text-gray-900'}>hub</span>
        </span>
      )}
    </Wrapper>
  );
}
