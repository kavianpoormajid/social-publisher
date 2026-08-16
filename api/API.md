# Publisher API

Mock API for a social-media publishing panel. In-memory storage, no database, no auth.

- Base URL: `http://localhost:4000`
- All request and response bodies are JSON (`Content-Type: application/json`).
- CORS is open to `http://localhost:3000`.
- Every endpoint answers with an artificial delay of 200–600ms so loading and optimistic states are observable.
- All seeded timestamps are ISO 8601 in the `+03:30` zone. Daily limits and allowed windows are evaluated in `+03:30`.
- Data lives in memory and resets when the process restarts. The seed is deterministic: two runs produce identical data.

## Data model

```ts
type Channel = 'instagram' | 'telegram' | 'linkedin' | 'x';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
  id: string;            // 'post_001', stable across reseeds
  brand: string;         // 'Nova' | 'Kavir' | 'Atlas'
  channel: Channel;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  scheduledAt: string;   // ISO 8601 with offset, e.g. 2026-08-19T14:30:00+03:30
  status: PostStatus;
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}

interface ChannelConfig {
  id: Channel;
  label: string;
  dailyLimit: number;
  allowedWindow: { start: string; end: string };  // 'HH:mm' local time
  maxLength: number;
  maxHashtags: number;
  requiresImage: boolean;
  maxImages: number;
}
```

### Channel configuration

| id | label | dailyLimit | allowedWindow | maxLength | maxHashtags | requiresImage | maxImages |
|---|---|---|---|---|---|---|---|
| `instagram` | Instagram | 3 | 08:00–23:00 | 2200 | 30 | true | 10 |
| `telegram` | Telegram | 10 | 00:00–23:59 | 4096 | 100 | false | 10 |
| `linkedin` | LinkedIn | 2 | 09:00–18:00 | 3000 | 5 | false | 9 |
| `x` | X | 8 | 00:00–23:59 | 280 | 10 | false | 4 |

These rules are **descriptive** for most of the API. Only `PATCH /api/posts/bulk` enforces them — see below. `POST` and `PATCH` on a single post accept payloads that violate them.

The seed data intentionally contains posts that already violate these rules: posts scheduled less than 30 minutes apart on the same channel, days where a channel exceeds its `dailyLimit`, posts outside the allowed window, and Instagram posts with no images.

---

## `GET /api/posts`

Returns a paginated, filtered list of posts.

### Query parameters

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | `1` | 1-based. `page=1` returns the first page. |
| `pageSize` | number | `20` | Maximum `100`. Larger values are clamped to `100`. |
| `channel` | string | – | Repeatable for multi-select: `?channel=instagram&channel=x`. |
| `status` | string | – | Repeatable: `?status=draft&status=failed`. |
| `brand` | string | – | Exact match. |
| `from` | string | – | Filters on `scheduledAt`. **Inclusive.** Accepts `YYYY-MM-DD` or full ISO 8601. |
| `to` | string | – | Filters on `scheduledAt`. **Inclusive** — `to=2026-08-19` includes posts scheduled on Aug 19. Accepts `YYYY-MM-DD` or full ISO 8601. |
| `sort` | string | `scheduledAt:asc` | One of `scheduledAt:asc`, `scheduledAt:desc`, `createdAt:asc`, `createdAt:desc`. |

A bare `YYYY-MM-DD` value for `from`/`to` is read as midnight local time in the `+03:30` zone. Unparsable or unknown values for `sort`, `from` and `to` are ignored.

`total` is the number of records matching the active filters, counted after filtering and before pagination.

### Example

```bash
curl "http://localhost:4000/api/posts?page=1&pageSize=2&channel=linkedin&sort=scheduledAt:asc"
```

```json
{
  "data": [
    {
      "id": "post_021",
      "brand": "Atlas",
      "channel": "linkedin",
      "content": "Atlas | گزارش عملکرد فصل گذشته منتشر شد.\nدر این گزارش، اعداد فروش و نرخ بازگشت مشتری را شفاف منتشر کرده‌ایم.",
      "hashtags": ["تجربه_مشتری", "رشد", "تخفیف"],
      "imageUrls": [],
      "scheduledAt": "2026-07-29T09:15:00+03:30",
      "status": "published",
      "createdAt": "2026-07-20T06:15:00+03:30",
      "updatedAt": "2026-07-20T10:15:00+03:30"
    }
  ],
  "total": 60,
  "page": 1,
  "pageSize": 2
}
```

---

## `GET /api/posts/:id`

Returns a single post.

```bash
curl "http://localhost:4000/api/posts/post_021"
```

```json
{
  "id": "post_021",
  "brand": "Atlas",
  "channel": "linkedin",
  "content": "Atlas | گزارش عملکرد فصل گذشته منتشر شد.",
  "hashtags": ["تجربه_مشتری", "رشد"],
  "imageUrls": [],
  "scheduledAt": "2026-07-29T09:15:00+03:30",
  "status": "published",
  "createdAt": "2026-07-20T06:15:00+03:30",
  "updatedAt": "2026-07-20T10:15:00+03:30"
}
```

`404` when the id is unknown:

```json
{ "error": "NOT_FOUND" }
```

---

## `POST /api/posts`

Creates a post.

Body: `{ brand, channel, content, hashtags, imageUrls, scheduledAt, status }`.

Validation covers only:

- `brand`, `content`, `scheduledAt` and `status` are present and non-empty
- `channel` is one of the four channel ids, `status` is one of the four statuses
- `scheduledAt` parses as a date
- `hashtags` and `imageUrls`, when present, are arrays of strings. Both default to `[]`.

Channel rules (`maxLength`, `maxHashtags`, `requiresImage`, `maxImages`, `dailyLimit`, `allowedWindow`) are **not** enforced here. Creating a post that conflicts with another post or breaks a channel rule succeeds.

```bash
curl -X POST "http://localhost:4000/api/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Nova",
    "channel": "telegram",
    "content": "کمپین پاییزی از هفته‌ی آینده شروع می‌شود.",
    "hashtags": ["کمپین"],
    "imageUrls": [],
    "scheduledAt": "2026-09-01T10:00:00+03:30",
    "status": "draft"
  }'
```

`201 Created` with the created post in the body:

```json
{
  "id": "post_241",
  "brand": "Nova",
  "channel": "telegram",
  "content": "کمپین پاییزی از هفته‌ی آینده شروع می‌شود.",
  "hashtags": ["کمپین"],
  "imageUrls": [],
  "scheduledAt": "2026-09-01T10:00:00+03:30",
  "status": "draft",
  "createdAt": "2026-08-15T12:04:11+03:30",
  "updatedAt": "2026-08-15T12:04:11+03:30"
}
```

`422` on invalid input:

```json
{
  "error": "VALIDATION_ERROR",
  "fields": {
    "channel": "channel must be one of: instagram, telegram, linkedin, x",
    "scheduledAt": "scheduledAt must be a valid date"
  }
}
```

---

## `PATCH /api/posts/:id`

Partial update. Only the keys present in the body are validated and applied, using the same rules as `POST`. `updatedAt` is refreshed. Channel rules are not enforced here either.

```bash
curl -X PATCH "http://localhost:4000/api/posts/post_010" \
  -H "Content-Type: application/json" \
  -d '{ "status": "draft" }'
```

`200 OK` with the full updated post:

```json
{
  "id": "post_010",
  "brand": "Nova",
  "channel": "telegram",
  "content": "Nova | یک خبر خوب برای همراهان همیشگی ما داریم.",
  "hashtags": ["برند", "فروش"],
  "imageUrls": [],
  "scheduledAt": "2026-07-27T13:05:00+03:30",
  "status": "draft",
  "createdAt": "2026-07-18T21:05:00+03:30",
  "updatedAt": "2026-08-15T12:06:40+03:30"
}
```

`404 { "error": "NOT_FOUND" }` for an unknown id, `422 { "error": "VALIDATION_ERROR", "fields": { ... } }` for invalid values.

---

## `PATCH /api/posts/bulk`

Applies one patch to many posts. **This is the only endpoint that enforces channel rules.**

Body: `{ "ids": string[], "patch": { ...partial Post } }`. At most **50** ids.

Ids are evaluated **in the order given**, so the result is deterministic. For each id the patch is applied to a copy of the post and the resulting state is checked:

| Reason | When |
|---|---|
| `NOT_FOUND` | No post with that id exists. |
| `DAILY_LIMIT_EXCEEDED` | The resulting state would push that channel over its `dailyLimit` for that calendar date (in `+03:30`). |
| `OUTSIDE_ALLOWED_WINDOW` | The resulting `scheduledAt` falls outside the channel's `allowedWindow`. |

**Rejected ids are not modified. Accepted ids are.** A single request can therefore be partially applied — the response always returns HTTP `207` with both lists, and the client is responsible for reconciling its local state with `succeeded`/`failed`.

Because earlier ids in the list are already applied when later ids are evaluated, an accepted change can cause a later id in the same request to be rejected.

```bash
curl -X PATCH "http://localhost:4000/api/posts/bulk" \
  -H "Content-Type: application/json" \
  -d '{ "ids": ["post_004", "post_009"], "patch": { "scheduledAt": "2026-08-19T10:00:00+03:30" } }'
```

`207 Multi-Status`:

```json
{
  "succeeded": ["post_004"],
  "failed": [{ "id": "post_009", "reason": "DAILY_LIMIT_EXCEEDED" }]
}
```

`422` if `ids` is missing/empty/not an array of strings, if it holds more than 50 entries, or if `patch` contains an invalid value:

```json
{ "error": "VALIDATION_ERROR", "fields": { "ids": "ids may contain at most 50 entries" } }
```

---

## `DELETE /api/posts/:id`

```bash
curl -i -X DELETE "http://localhost:4000/api/posts/post_100"
```

`204 No Content` with an empty body. `404 { "error": "NOT_FOUND" }` if the id is unknown.

---

## `GET /api/channels`

```bash
curl "http://localhost:4000/api/channels"
```

```json
{
  "channels": [
    {
      "id": "instagram",
      "label": "Instagram",
      "dailyLimit": 3,
      "allowedWindow": { "start": "08:00", "end": "23:00" },
      "maxLength": 2200,
      "maxHashtags": 30,
      "requiresImage": true,
      "maxImages": 10
    }
  ]
}
```

---

## `POST /api/_reset`

Rebuilds the in-memory store from the seed, discarding every create, update and delete. Useful between test runs.

```bash
curl -X POST "http://localhost:4000/api/_reset"
```

```json
{ "ok": true }
```

---

## Error simulation

Any endpoint honours the `X-Simulate-Error` request header and returns the requested failure instead of doing its work. This exists so error handling and rollback paths can be exercised on demand.

| Header value | Result |
|---|---|
| `500` | `500 { "error": "INTERNAL_ERROR" }` |
| `422` | `422 { "error": "VALIDATION_ERROR", "fields": { "simulated": "Simulated validation failure" } }` |
| `timeout` | Hangs for 10 seconds, then `504 { "error": "TIMEOUT" }` |

Any other value is ignored and the request proceeds normally.

```bash
curl -i "http://localhost:4000/api/posts" -H "X-Simulate-Error: 500"

curl -i -X PATCH "http://localhost:4000/api/posts/post_004" \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Error: timeout" \
  -d '{ "status": "draft" }'
```
