import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { analytics, track, ANALYTICS_EVENTS, type AnalyticsPayload } from '@/lib/analytics'

export function useAnalytics() {
  const pathname = usePathname()
  const previousPathname = useRef<string>()

  // Track page navigation
  useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      track.navigateToPage(pathname, previousPathname.current)
    }
    previousPathname.current = pathname
  }, [pathname])

  // Track page load
  useEffect(() => {
    analytics.log(ANALYTICS_EVENTS.PAGE_LOAD, { 
      page: pathname,
      timestamp: Date.now()
    })
  }, [pathname])

  // Set user ID when available
  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId)
  }, [])

  // Track sign in
  const trackSignIn = useCallback((method: string, userId?: string) => {
    track.signIn(method, userId)
  }, [])

  // Track sign out
  const trackSignOut = useCallback(() => {
    track.signOut()
  }, [])

  // Track onboarding completion
  const trackOnboardingComplete = useCallback((steps: string[]) => {
    track.completeOnboarding(steps)
  }, [])

  // Track recipe interaction
  const trackRecipeOpen = useCallback((recipeId: string, recipeTitle: string) => {
    track.openRecipe(recipeId, recipeTitle)
  }, [])

  // Track plan day view
  const trackPlanDayView = useCallback((dayIndex: number, planId?: string) => {
    track.viewPlanDay(dayIndex, planId)
  }, [])

  // Track water logging
  const trackWaterLog = useCallback((amount: number, date: string) => {
    track.logWater(amount, date)
  }, [])

  // Track weight logging
  const trackWeightLog = useCallback((weight: number, date: string) => {
    track.logWeight(weight, date)
  }, [])

  // Track reminder settings
  const trackReminderSet = useCallback((type: 'meal' | 'water', times: string[]) => {
    track.setReminders(type, times)
  }, [])

  // Track message sending
  const trackMessageSend = useCallback((messageType: 'support' | 'admin', length: number) => {
    track.sendMessage(messageType, length)
  }, [])

  // Track navigation
  const trackNavigation = useCallback((page: string, fromPage?: string) => {
    track.navigateToPage(page, fromPage)
  }, [])

  // Track errors
  const trackError = useCallback((error: string, context?: string) => {
    track.errorOccurred(error, context)
  }, [])

  // Track custom events
  const trackEvent = useCallback((event: string, payload?: AnalyticsPayload) => {
    analytics.log(event, payload)
  }, [])

  // Track component render
  const trackComponentRender = useCallback((componentName: string, props?: Record<string, any>) => {
    analytics.log(ANALYTICS_EVENTS.COMPONENT_RENDER, {
      component: componentName,
      props,
      page: pathname
    })
  }, [pathname])

  // Track API calls
  const trackApiCall = useCallback((endpoint: string, method: string, success: boolean, duration?: number) => {
    analytics.log('api_call', {
      endpoint,
      method,
      success,
      duration,
      page: pathname
    })
  }, [pathname])

  // Track user interactions
  const trackInteraction = useCallback((action: string, element: string, value?: any) => {
    analytics.log('user_interaction', {
      action,
      element,
      value,
      page: pathname
    })
  }, [pathname])

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, unit: string) => {
    analytics.log('performance', {
      metric,
      value,
      unit,
      page: pathname
    })
  }, [pathname])

  return {
    // User management
    setUserId,
    
    // Authentication tracking
    trackSignIn,
    trackSignOut,
    
    // Onboarding tracking
    trackOnboardingComplete,
    
    // Content tracking
    trackRecipeOpen,
    trackPlanDayView,
    
    // Health tracking
    trackWaterLog,
    trackWeightLog,
    
    // Settings tracking
    trackReminderSet,
    
    // Communication tracking
    trackMessageSend,
    
    // Navigation tracking
    trackNavigation,
    
    // Error tracking
    trackError,
    
    // Custom tracking
    trackEvent,
    trackComponentRender,
    trackApiCall,
    trackInteraction,
    trackPerformance,
    
    // Direct access to analytics instance
    analytics
  }
}
