# API Documentation

Base URL: `/api`

## Authentication

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user profile | Private |

## Stories

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| POST | `/stories` | Create a story | Private |
| GET | `/stories` | List stories (filters: country, category, sort) | Public |
| GET | `/stories/:id` | Get single story details | Public |
| GET | `/stories/share/:shareId` | Get story by concise share ID | Public |
| DELETE | `/stories/:id` | Delete own story | Private |

## Interactions

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| POST | `/stories/:id/vote` | Upvote/Downvote a story | Private |
| GET | `/stories/:id/votes` | Get vote statistics | Public |
| POST | `/stories/:id/comments` | Add a comment | Private |
| GET | `/stories/:id/comments` | Get comments for a story | Public |
| DELETE | `/comments/:id` | Delete a comment | Private |

## Admin

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| GET | `/admin/stories` | List all stories (inc. deleted) | Admin |
| DELETE | `/admin/stories/:id` | Permanently delete story | Admin |
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/:id/block` | Block/Unblock user | Admin |
| GET | `/admin/reports` | View content reports | Admin |

## Translation

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| POST | `/translate` | Translate text to target language | Public |

## GDPR

| Method | Endpoint | Description | Auth |
|:--- |:--- |:--- |:--- |
| GET | `/gdpr/export` | Download distinct user data JSON | Private |
| DELETE | `/gdpr/delete-account` | Permanently delete account & data | Private |

## Data Models

### Enums
- **Categories**: `funny`, `sad`, `quirky`, `absurd`
- **Trigger Warnings**: `violence`, `trauma`, `nudity`, `mental_health`
- **Vote Types**: `upvote`, `downvote`
