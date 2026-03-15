"use client"

import { useState, useEffect } from "react"

const EXTENSIONS = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".webp"]
const HAS_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i
const PLACEHOLDER = "/Security_n.png"

interface ProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined
  candidates?: string[]
  alt: string
  onAllFailed?: () => void
}

export function ProductImage({ src, candidates, alt, onAllFailed, ...props }: ProductImageProps) {
  const urls: string[] = candidates && candidates.length > 0
    ? candidates
    : src
      ? HAS_EXT.test(src)
        ? [src]
        : EXTENSIONS.map(ext => src + ext)
      : []

  const [attempt, setAttempt] = useState(0)

  const allFailed = urls.length === 0 || attempt >= urls.length

  useEffect(() => {
    if (allFailed && onAllFailed) onAllFailed()
  }, [allFailed, onAllFailed])

  useEffect(() => {
    setAttempt(0)
  }, [src])

  if (allFailed) {
    const { className, ...rest } = props
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        className={`object-contain p-4 bg-[#F5F5F5] ${className ?? ""}`}
        {...rest}
      />
    )
  }

  return (
    <img
      src={urls[attempt]}
      alt={alt}
      loading="lazy"
      onError={() => { setAttempt(a => a + 1) }}
      {...props}
    />
  )
}
