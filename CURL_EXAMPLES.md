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
```bash
curl http://localhost:3000/user/profile \
  -b cookies.txt
```

Or with Bearer token:
```bash
curl http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

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

### Create event (admin)
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Hackathon 2025","description":"Annual hackathon","mode":"BOTH","minTeamSize":2,"maxTeamSize":4}'
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
> **Note:** Can only delete teams that haven't been registered yet

```bash
curl -X POST http://localhost:3000/teams/delete \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'
```

---

## Leaderboard

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
```
