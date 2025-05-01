
import * as React from "react"

// تعريف نقاط الكسر لمختلف أحجام الشاشات
export const SCREEN_SIZES = {
  MOBILE: 768,    // الهاتف
  TABLET: 1024,   // التابلت
  DESKTOP: 1280,  // الحاسوب
}

/**
 * Custom hook للكشف عما إذا كان الجهاز محمول
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SCREEN_SIZES.MOBILE - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < SCREEN_SIZES.MOBILE)
    }
    
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < SCREEN_SIZES.MOBILE)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Custom hook للكشف عما إذا كان الجهاز تابلت
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= SCREEN_SIZES.MOBILE && width < SCREEN_SIZES.DESKTOP)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // تنفيذ عند التحميل الأولي
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isTablet
}

/**
 * Custom hook للكشف عما إذا كان الجهاز حاسوب
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= SCREEN_SIZES.DESKTOP)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // تنفيذ عند التحميل الأولي
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return !!isDesktop
}

/**
 * Custom hook لإرجاع حجم الشاشة الحالي
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop' | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < SCREEN_SIZES.MOBILE) {
        setScreenSize('mobile')
      } else if (width < SCREEN_SIZES.DESKTOP) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // تنفيذ عند التحميل الأولي
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}
