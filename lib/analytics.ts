// Analytics event constants
export const ANALYTICS_EVENTS = {
  // Authentication
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  SIGN_UP: 'sign_up',
  
  // Onboarding & Profile
  COMPLETE_ONBOARDING: 'complete_onboarding',
  UPDATE_PROFILE: 'update_profile',
  
  // Content Interaction
  OPEN_RECIPE: 'open_recipe',
  CREATE_RECIPE: 'create_recipe',
  EDIT_RECIPE: 'edit_recipe',
  DELETE_RECIPE: 'delete_recipe',
  SEARCH_RECIPES: 'search_recipes',
  
  // Meal Planning
  VIEW_PLAN_DAY: 'view_plan_day',
  CREATE_PLAN: 'create_plan',
  EDIT_PLAN: 'edit_plan',
  ASSIGN_RECIPE_TO_MEAL: 'assign_recipe_to_meal',
  
  // Tracking
  LOG_WATER: 'log_water',
  LOG_WEIGHT: 'log_weight',
  VIEW_PROGRESS: 'view_progress',
  
  // Notifications
  SET_REMINDERS: 'set_reminders',
  ENABLE_NOTIFICATIONS: 'enable_notifications',
  DISABLE_NOTIFICATIONS: 'disable_notifications',
  
  // Support & Communication
  SEND_MESSAGE: 'send_message',
  OPEN_SUPPORT: 'open_support',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  
  // PWA
  INSTALL_APP: 'install_app',
  UPDATE_APP: 'update_app',
  
  // Navigation
  NAVIGATE_TO_PAGE: 'navigate_to_page',
  OPEN_MENU: 'open_menu',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  
  // Performance
  PAGE_LOAD: 'page_load',
  COMPONENT_RENDER: 'component_render'
} as const

// Event payload types
export interface AnalyticsPayload {
  [key: string]: any
}

export interface AnalyticsEvent {
  event: string
  payload?: AnalyticsPayload
  timestamp: number
  sessionId?: string
  userId?: string
}

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  sessionId: string
  userId?: string
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled: true,
  debug: true,
  sessionId: generateSessionId(),
  userId: undefined
}

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Analytics class
class Analytics {
  private config: AnalyticsConfig
  private sessionId: string

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.sessionId = this.config.sessionId
  }

  // Set user ID for tracking
  setUserId(userId: string) {
    this.config.userId = userId
  }

  // Log an analytics event
  log(event: string, payload?: AnalyticsPayload): void {
    if (!this.config.enabled) return

    const analyticsEvent: AnalyticsEvent = {
      event,
      payload,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.config.userId
    }

    // Console logging for development
    if (this.config.debug) {
      console.log('📊 Analytics Event:', {
        event: analyticsEvent.event,
        payload: analyticsEvent.payload,
        timestamp: new Date(analyticsEvent.timestamp).toISOString(),
        sessionId: analyticsEvent.sessionId,
        userId: analyticsEvent.userId
      })
    }

    // In production, you would send this to your analytics service
    // this.sendToAnalyticsService(analyticsEvent)
  }

  // Convenience methods for common events
  signIn(method: string, userId?: string) {
    if (userId) this.setUserId(userId)
    this.log(ANALYTICS_EVENTS.SIGN_IN, { method, userId })
  }

  signOut() {
    this.log(ANALYTICS_EVENTS.SIGN_OUT)
    this.config.userId = undefined
  }

  completeOnboarding(steps: string[]) {
    this.log(ANALYTICS_EVENTS.COMPLETE_ONBOARDING, { steps })
  }

  openRecipe(recipeId: string, recipeTitle: string) {
    this.log(ANALYTICS_EVENTS.OPEN_RECIPE, { recipeId, recipeTitle })
  }

  viewPlanDay(dayIndex: number, planId?: string) {
    this.log(ANALYTICS_EVENTS.VIEW_PLAN_DAY, { dayIndex, planId })
  }

  logWater(amount: number, date: string) {
    this.log(ANALYTICS_EVENTS.LOG_WATER, { amount, date })
  }

  logWeight(weight: number, date: string) {
    this.log(ANALYTICS_EVENTS.LOG_WEIGHT, { weight, date })
  }

  setReminders(type: 'meal' | 'water', times: string[]) {
    this.log(ANALYTICS_EVENTS.SET_REMINDERS, { type, times })
  }

  sendMessage(messageType: 'support' | 'admin', length: number) {
    this.log(ANALYTICS_EVENTS.SEND_MESSAGE, { messageType, length })
  }

  navigateToPage(page: string, fromPage?: string) {
    this.log(ANALYTICS_EVENTS.NAVIGATE_TO_PAGE, { page, fromPage })
  }

  errorOccurred(error: string, context?: string) {
    this.log(ANALYTICS_EVENTS.ERROR_OCCURRED, { error, context })
  }

  // Private method for sending to analytics service (placeholder)
  private sendToAnalyticsService(event: AnalyticsEvent) {
    // Implementation for production analytics service
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    console.log('Would send to analytics service:', event)
  }
}

// Create and export default analytics instance
export const analytics = new Analytics()

// Export convenience function
export function log(event: string, payload?: AnalyticsPayload): void {
  analytics.log(event, payload)
}

// Export convenience functions for common events
export const track = {
  signIn: (method: string, userId?: string) => analytics.signIn(method, userId),
  signOut: () => analytics.signOut(),
  completeOnboarding: (steps: string[]) => analytics.completeOnboarding(steps),
  openRecipe: (recipeId: string, recipeTitle: string) => analytics.openRecipe(recipeId, recipeTitle),
  viewPlanDay: (dayIndex: number, planId?: string) => analytics.viewPlanDay(dayIndex, planId),
  logWater: (amount: number, date: string) => analytics.logWater(amount, date),
  logWeight: (weight: number, date: string) => analytics.logWeight(weight, date),
  setReminders: (type: 'meal' | 'water', times: string[]) => analytics.setReminders(type, times),
  sendMessage: (messageType: 'support' | 'admin', length: number) => analytics.sendMessage(messageType, length),
  navigateToPage: (page: string, fromPage?: string) => analytics.navigateToPage(page, fromPage),
  errorOccurred: (error: string, context?: string) => analytics.errorOccurred(error, context)
}
