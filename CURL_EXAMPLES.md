# Example cURL requests

Base URL: `http://localhost:3000`

## Quick Workflow Example

### Complete Team Registration Flow:
1. **Login & get cookies**
2. **Check if user is part of any team** for the event
3. **Create team** (if not part of any team, associates with event, `registered: false`)
4. **Join team** (optional, for other members - respects max team size)
5. **Leave team** (optional, for non-admin members - only if not registered)
6. **Register for event** (single route for both solo & team - requires min team size for teams)

### Team Size Constraints:
- **minTeamSize**: Minimum members required to register (default: 1)
- **maxTeamSize**: Maximum members allowed in team (default: 4)
- Teams can only accept new members if under max size
- Teams can only register if at or above min size

### Complete Solo Registration Flow:
1. **Login & get cookies**
2. **Register for event directly** (same route, no teamId)
3. **Check your registrations** (view all events you're registered for)

### View Your Registrations:
- **Solo registrations** show individual event details
- **Team registrations** show event + team information
- **Sorted by registration date** (newest first)

---

## Auth

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"test","username":"testuser"}'
```

### Verify email (open in browser or)
```bash
curl "http://localhost:3000/auth/verify-email?token=YOUR_VERIFICATION_TOKEN"
```

### Login (stores cookies in cookie jar)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

### Refresh token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

### Forgot password
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Reset password
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN","password":"newpassword123"}'
```

---

## User (authenticated)

### Get profile
> **Note:** Authentication is now handled automatically with token refresh. No need to manually manage tokens!

```bash
curl http://localhost:3000/user/profile \
  -b cookies.txt
```

Or with Bearer token (still works):
```bash
curl http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

> **🎉 Improved Auth Experience**: 
> - Access tokens now last 30 minutes (increased from 15)
> - Automatic token refresh - no more 401 errors!
> - Just use cookies and the system handles the rest

---

## Events

### List events
```bash
curl http://localhost:3000/events
```

### Get event by ID
```bash
curl http://localhost:3000/events/EVENT_ID
```

### Get user's event registrations
> **Note:** Returns all events the user is registered for (solo and team)

```bash
curl http://localhost:3000/events/my-registrations \
  -b cookies.txt
```

**Response example:**
```json
[
  {
    "id": "REG_ID_1",
    "registeredAt": "2025-03-18T10:30:00.000Z",
    "event": {
      "id": "EVENT_ID_1",
      "title": "Hackathon 2025",
      "description": "Annual hackathon",
      "mode": "BOTH",
      "isLive": true,
      "createdAt": "2025-03-15T09:00:00.000Z"
    },
    "registrationType": "solo",
    "team": null
  },
  {
    "id": "REG_ID_2",
    "registeredAt": "2025-03-17T14:20:00.000Z",
    "event": {
      "id": "EVENT_ID_2",
      "title": "Coding Challenge",
      "description": "Weekly coding challenge",
      "mode": "TEAM",
      "isLive": true,
      "createdAt": "2025-03-10T08:00:00.000Z"
    },
    "registrationType": "team",
    "team": {
      "id": "TEAM_ID",
      "name": "Code Warriors",
      "teamCode": "ABC123"
    }
  }
]
```

### Create event (admin)
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Hackathon 2025","description":"Annual hackathon","mode":"BOTH","minTeamSize":2,"maxTeamSize":4}'
```

### Edit event (admin)
> **Note:** Can update any event fields. Validates team size constraints.

```bash
curl -X PATCH http://localhost:3000/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Updated Hackathon","isLive":false,"minTeamSize":3,"maxTeamSize":5}'
```

### Register for event (solo registration)
```bash
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'
```

### Register for event (team registration)
> **Note:** Same route as solo, but with teamId. Team must meet minimum size requirements.

```bash
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'
```

---

## Teams (authenticated)

### Create team
> **Note:** Team is created with `registered: false` and associated with an event

```bash
curl -X POST http://localhost:3000/teams/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Team Alpha","eventId":"EVENT_ID"}'
```

### Join team
> **Note:** Can only join teams that haven't been registered yet and have space available

```bash
curl -X POST http://localhost:3000/teams/join \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamCode":"ABC123"}'
```

### Check user team for event
> **Note:** Returns whether user is part of any team for the specific event and team details with member names

```bash
curl http://localhost:3000/teams/event/EVENT_ID \
  -b cookies.txt
```

**Response if not part of any team:**
```json
{
  "hasTeam": false,
  "team": null
}
```

**Response if part of a team:**
```json
{
  "hasTeam": true,
  "team": {
    "id": "TEAM_ID",
    "name": "Team Alpha",
    "teamCode": "ABC123",
    "registered": false,
    "memberCount": 3,
    "members": [
      {
        "id": "USER_ID_1",
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "avatarUrl": "https://example.com/avatar1.jpg"
      },
      {
        "id": "USER_ID_2", 
        "name": "Jane Smith",
        "username": "janesmith",
        "email": "jane@example.com",
        "avatarUrl": "https://example.com/avatar2.jpg"
      }
    ],
    "teamSize": {
      "current": 3,
      "min": 2,
      "max": 4,
      "canJoin": true,
      "canRegister": true
    },
    "isUserAdmin": false
  }
}
```

### Get team info
> **Note:** Returns detailed team size information and registration status

```bash
curl http://localhost:3000/teams/TEAM_ID \
  -b cookies.txt
```

**Response includes team size info:**
```json
{
  "id": "TEAM_ID",
  "name": "Team Alpha",
  "registered": false,
  "memberCount": 3,
  "teamSize": {
    "current": 3,
    "min": 2,
    "max": 4,
    "canJoin": true,
    "canRegister": true
  }
}
```

### Leave team
> **Note:** Any team member (except admin) can leave an unregistered team

```bash
curl -X POST http://localhost:3000/teams/leave \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'
```

### Remove member
> **Note:** Can only remove members from teams that haven't been registered yet

```bash
curl -X POST http://localhost:3000/teams/remove-member \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID","userId":"USER_ID"}'
```

### Delete team (team admin only)
> **Note:** Can only delete teams that haven't been registered yet. This will remove all team members and then delete the team.

```bash
curl -X POST http://localhost:3000/teams/delete \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'
```

**Response:**
```json
{
  "message": "Team deleted successfully"
}
```

---

## Admin Panel (admin only)

### List all users
> **Note:** Returns all users with team and registration counts

```bash
curl http://localhost:3000/admin/users \
  -b cookies.txt
```

**Response example:**
```json
[
  {
    "id": "USER_ID",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "verified": true,
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-03-19T10:53:10.286Z",
    "role": "USER",
    "_count": {
      "teams": 2,
      "registrations": 3
    }
  }
]
```

### Get users by event
> **Note:** Returns all users registered for a specific event (solo + team)

```bash
curl http://localhost:3000/admin/events/EVENT_ID/users \
  -b cookies.txt
```

**Response example:**
```json
{
  "eventId": "EVENT_ID",
  "eventTitle": "Hackathon 2025",
  "totalUsers": 25,
  "users": [
    {
      "id": "USER_ID_1",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "createdAt": "2025-03-15T09:00:00.000Z",
      "registrationType": "solo",
      "registrationDate": "2025-03-18T10:30:00.000Z"
    },
    {
      "id": "USER_ID_2",
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "createdAt": "2025-03-10T08:00:00.000Z",
      "registrationType": "team",
      "registrationDate": "2025-03-17T14:20:00.000Z",
      "teamName": "Code Warriors",
      "teamCode": "ABC123"
    }
  ]
}
```

### Edit user (admin)
> **Note:** Can update user name, username, email, and verification status

```bash
curl -X PATCH http://localhost:3000/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Updated Name","verified":true}'
```

### Set score (admin)
> **Note:** Set or update scores for registered teams

```bash
curl -X POST http://localhost:3000/admin/score \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"eventId":"EVENT_ID","teamId":"TEAM_ID","value":100}'
```

### Export teams as CSV (admin)
> **Note:** Export all teams or teams from specific event as CSV file

```bash
# Export all teams
curl http://localhost:3000/admin/export/teams/csv \
  -b cookies.txt \
  -o all_teams_$(date +%Y-%m-%d).csv

# Export teams for specific event
curl "http://localhost:3000/admin/export/teams/csv?eventId=EVENT_ID" \
  -b cookies.txt \
  -o teams_event_EVENT_ID_$(date +%Y-%m-%d).csv
```

**CSV Format Includes:**
- Team ID, Name, Code
- Event ID and Title
- Registration Status
- Member Count
- Admin Details (ID, Name, Username, Email)
- All Members (ID|Name|Username|Email format)
- Creation Timestamp

**Sample CSV Output:**
```csv
Team ID,Team Name,Team Code,Event ID,Event Title,Registered,Member Count,Admin ID,Admin Name,Admin Username,Admin Email,"Members (ID|Name|Username|Email)",Created At
"team123","Code Warriors","ABC123","event456","Hackathon 2025","Yes","3","user789","John Doe","johndoe","john@example.com","user789|John Doe|johndoe|john@example.com; user790|Jane Smith|janesmith|jane@example.com; user791|Bob Wilson|bobwilson|bob@example.com","2025-03-19T10:53:10.286Z"
```

### Get leaderboard for event
```bash
curl http://localhost:3000/leaderboard/EVENT_ID
```

---

## Admin

### Set score (admin only)
```bash
curl -X POST http://localhost:3000/admin/score \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"eventId":"EVENT_ID","teamId":"TEAM_ID","value":100}'
```

### Edit user (admin only)
```bash
curl -X PATCH http://localhost:3000/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"John Doe","username":"johndoe","verified":true}'
```

---

## Complete Workflow Example

### Step-by-Step Team Registration:
```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# 2. Create event (admin)
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Hackathon","description":"Annual hackathon","mode":"BOTH","minTeamSize":2,"maxTeamSize":4}'

# 3. Create team
curl -X POST http://localhost:3000/teams/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"My Team","eventId":"EVENT_ID"}'

# 4. Check if user is part of any team for the event
curl http://localhost:3000/teams/event/EVENT_ID \
  -b cookies.txt

# 5. Other members join (optional)
curl -X POST http://localhost:3000/teams/join \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamCode":"TEAM_CODE"}'

# 6. Leave team (optional, for non-admin members)
curl -X POST http://localhost:3000/teams/leave \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'

# 7. Check team status
curl http://localhost:3000/teams/TEAM_ID \
  -b cookies.txt

# 8. Register team for event (single route!)
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'

# 9. Check all your event registrations
curl http://localhost:3000/events/my-registrations \
  -b cookies.txt
```
