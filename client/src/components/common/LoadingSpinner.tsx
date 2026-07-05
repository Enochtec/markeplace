interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' };

export default function LoadingSpinner({ size = 'md', className = '', fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full border-gray-200 border-t-orange-500 ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
