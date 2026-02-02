# API Endpoints Documentation

## Comments API

### Create Comment
Create a new top-level comment or reply to an existing comment.

```
POST /comments
```

**Request Body:**
```json
{
  "postId": 1,
  "userId": 1,
  "parentId": null,  // optional - set to comment ID for replies
  "content": "This is my comment"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "post_id": 1,
  "user_id": 1,
  "parent_id": null,
  "content": "This is my comment",
  "is_deleted": false,
  "created_at": "2026-02-02T10:00:00.000Z",
  "updated_at": "2026-02-02T10:00:00.000Z",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "reactions": []
}
```

---

### Get Comments for Post
Get all comments for a post with nested structure (up to 3 levels deep).

```
GET /comments/post/:postId
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `includeDeleted` | string | Set to `"true"` to include soft-deleted comments |

**Example:** `GET /comments/post/1?includeDeleted=false`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "post_id": 1,
    "user_id": 1,
    "parent_id": null,
    "content": "Top level comment",
    "is_deleted": false,
    "created_at": "2026-02-02T10:00:00.000Z",
    "updated_at": "2026-02-02T10:00:00.000Z",
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "reactions": [],
    "replies": [
      {
        "id": 2,
        "content": "Reply to comment",
        "replies": []
      }
    ]
  }
]
```

---

### Get Single Comment
Get a single comment by ID with its direct replies.

```
GET /comments/:id
```

**Example:** `GET /comments/1`

**Response:** `200 OK`
```json
{
  "id": 1,
  "post_id": 1,
  "user_id": 1,
  "parent_id": null,
  "content": "This is my comment",
  "is_deleted": false,
  "created_at": "2026-02-02T10:00:00.000Z",
  "updated_at": "2026-02-02T10:00:00.000Z",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "reactions": [],
  "replies": []
}
```

---

### Update Comment
Update a comment's content. Only the comment owner can update.

```
PUT /comments/:id
```

**Request Body:**
```json
{
  "userId": 1,
  "content": "Updated comment content"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "post_id": 1,
  "user_id": 1,
  "content": "Updated comment content",
  "updated_at": "2026-02-02T11:00:00.000Z"
}
```

**Errors:**
- `403 Forbidden` - User is not the comment owner
- `400 Bad Request` - Comment is deleted
- `404 Not Found` - Comment not found

---

### Delete Comment (Soft Delete)
Soft delete a comment. Only the comment owner can delete.

```
DELETE /comments/:id
```

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "is_deleted": true,
  "content": "[deleted]"
}
```

**Errors:**
- `403 Forbidden` - User is not the comment owner
- `400 Bad Request` - Comment is already deleted
- `404 Not Found` - Comment not found

---

### Get Comment Count
Get the total number of non-deleted comments for a post.

```
GET /comments/post/:postId/count
```

**Example:** `GET /comments/post/1/count`

**Response:** `200 OK`
```json
{
  "postId": 1,
  "count": 15
}
```

---

## Reactions API

### Toggle Reaction
Add or remove a reaction. If the reaction exists, it will be removed. If it doesn't exist, it will be added.

```
POST /reactions/toggle
```

**Request Body:**
```json
{
  "userId": 1,
  "targetType": "post",  // "post" or "comment"
  "postId": 1,           // required if targetType is "post"
  "commentId": null,     // required if targetType is "comment"
  "type": "like"         // "like", "helpful", "funny", "insightful", "celebrate"
}
```

**Response (Added):** `200 OK`
```json
{
  "action": "added",
  "reaction": {
    "id": 1,
    "user_id": 1,
    "post_id": 1,
    "comment_id": null,
    "type": "like",
    "created_at": "2026-02-02T10:00:00.000Z"
  }
}
```

**Response (Removed):** `200 OK`
```json
{
  "action": "removed",
  "reaction": {
    "id": 1,
    "user_id": 1,
    "post_id": 1,
    "comment_id": null,
    "type": "like",
    "created_at": "2026-02-02T10:00:00.000Z"
  }
}
```

---

### Get Post Reactions Summary
Get aggregated reaction counts for a post.

```
GET /reactions/post/:postId/summary
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | number | Optional - Include user's reaction in response |

**Example:** `GET /reactions/post/1/summary?userId=1`

**Response:** `200 OK`
```json
{
  "like": 10,
  "helpful": 5,
  "funny": 3,
  "insightful": 2,
  "celebrate": 1,
  "total": 21,
  "userReaction": "like"  // null if user hasn't reacted
}
```

---

### Get Comment Reactions Summary
Get aggregated reaction counts for a comment.

```
GET /reactions/comment/:commentId/summary
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | number | Optional - Include user's reaction in response |

**Example:** `GET /reactions/comment/1/summary?userId=1`

**Response:** `200 OK`
```json
{
  "like": 5,
  "helpful": 2,
  "funny": 1,
  "insightful": 0,
  "celebrate": 0,
  "total": 8,
  "userReaction": null
}
```

---

### Get Post Reaction Users
Get list of users who reacted to a post with a specific reaction type.

```
GET /reactions/post/:postId/users
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Reaction type: `like`, `helpful`, `funny`, `insightful`, `celebrate` |

**Example:** `GET /reactions/post/1/users?type=like`

**Response:** `200 OK`
```json
[
  {
    "userId": 1,
    "email": "user1@example.com",
    "reactedAt": "2026-02-02T10:00:00.000Z"
  },
  {
    "userId": 2,
    "email": "user2@example.com",
    "reactedAt": "2026-02-02T09:00:00.000Z"
  }
]
```

---

### Get Comment Reaction Users
Get list of users who reacted to a comment with a specific reaction type.

```
GET /reactions/comment/:commentId/users
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Reaction type: `like`, `helpful`, `funny`, `insightful`, `celebrate` |

**Example:** `GET /reactions/comment/1/users?type=helpful`

**Response:** `200 OK`
```json
[
  {
    "userId": 1,
    "email": "user1@example.com",
    "reactedAt": "2026-02-02T10:00:00.000Z"
  }
]
```

---

### Get User Reactions
Get all reactions made by a specific user.

```
GET /reactions/user/:userId
```

**Example:** `GET /reactions/user/1`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "post_id": 1,
    "comment_id": null,
    "type": "like",
    "created_at": "2026-02-02T10:00:00.000Z",
    "post": {
      "id": 1,
      "title": "Post Title"
    },
    "comment": null
  },
  {
    "id": 2,
    "user_id": 1,
    "post_id": null,
    "comment_id": 5,
    "type": "helpful",
    "created_at": "2026-02-02T09:00:00.000Z",
    "post": null,
    "comment": {
      "id": 5,
      "content": "Comment content..."
    }
  }
]
```

---

## Enums

### Reaction Types
| Value | Description |
|-------|-------------|
| `like` | Standard like reaction |
| `helpful` | Mark as helpful |
| `funny` | Mark as funny |
| `insightful` | Mark as insightful |
| `celebrate` | Celebration reaction |

### Target Types
| Value | Description |
|-------|-------------|
| `post` | Reaction on a post |
| `comment` | Reaction on a comment |

---

## Error Responses

All endpoints may return the following errors:

| Status Code | Description |
|-------------|-------------|
| `400 Bad Request` | Invalid request body or parameters |
| `403 Forbidden` | User not authorized for this action |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Server error |

**Error Response Format:**
```json
{
  "statusCode": 404,
  "message": "Post with ID 1 not found",
  "error": "Not Found"
}
```
