# Example cURL requests

Base URL: `http://localhost:3000`

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
  -d '{"title":"Hackathon 2025","description":"Annual hackathon","mode":"BOTH"}'
```

### Register for event (solo)
```bash
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'
```

### Register for event (team)
```bash
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID"}'
```

---

## Teams (authenticated)

### Create team
```bash
curl -X POST http://localhost:3000/teams/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Team Alpha"}'
```

### Join team
```bash
curl -X POST http://localhost:3000/teams/join \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamCode":"ABC123"}'
```

### Remove member
```bash
curl -X POST http://localhost:3000/teams/remove-member \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"teamId":"TEAM_ID","userId":"USER_ID"}'
```

### Submit team
```bash
curl -X POST http://localhost:3000/teams/submit \
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
