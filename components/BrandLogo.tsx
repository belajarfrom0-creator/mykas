import Image from 'next/image'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const imageSizes = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
}

const textSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function BrandLogo({ size = 'md', showText = true, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className={`relative shrink-0 overflow-hidden bg-white shadow-sm ring-1 ring-blue-100 ${imageSizes[size]}`}>
        <Image
          src="/mykas-logo.png"
          alt="MyKas"
          fill
          sizes={size === 'lg' ? '56px' : size === 'md' ? '44px' : '36px'}
          className="object-cover"
          priority
        />
      </span>
      {showText && (
        <span className={`truncate font-bold tracking-tight text-primary ${textSizes[size]}`}>
          MyKas
        </span>
      )}
    </span>
  )
}
