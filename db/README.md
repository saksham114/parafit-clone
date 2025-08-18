# Database Schema

## Tables

### profiles
- User profile information
- RLS: Users can only access their own profile

### recipes
- Recipe data with ingredients, steps, and nutritional info
- RLS: Users can view public recipes and their own private recipes

### plans
- Meal plan templates
- RLS: Users can view public plans and their own private plans

### plan_days
- Daily meal assignments within a plan
- RLS: Users can only access days for plans they own

### track_water
- Daily water intake tracking
- RLS: Users can only access their own water logs

### track_weight
- Daily weight tracking
- RLS: Users can only access their own weight logs

### reminders
- User reminder preferences for meals and water
- RLS: Users can only access their own reminders

### messages
- User messages/notes
- RLS: Users can only access their own messages

## Enums

- `goal`: 'lose' | 'maintain' | 'gain'
- `meal_type`: 'breakfast' | 'lunch' | 'snack' | 'dinner'

## Key RLS Rules

- All tables use `auth.uid()` to restrict access to user's own data
- Public recipes and plans are viewable by all authenticated users
- Private content is only accessible by the owner
- No service role access - all operations go through RLS

