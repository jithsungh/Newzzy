# MongoDB Index Optimization Guide for Newzzy

This document provides comprehensive guidance on the MongoDB indexing strategy implemented for the Newzzy news application.

## Overview

The Newzzy application has been optimized with strategic indexes to improve query performance across all major collections:

- **Users** - Authentication and user management
- **NewsArticles** - News content and search operations
- **UserInteractions** - User engagement tracking
- **Recommendations** - Personalized content delivery
- **DeletedUsers** - User cleanup and privacy compliance

## Index Implementation

### 1. Users Collection Indexes

```javascript
// Authentication (most critical)
{ email: 1 } - unique

// Session management
{ REFRESH_TOKEN: 1 } - sparse

// Activity tracking
{ lastActiveDate: -1, streak: -1 }

// Analytics
{ theme: 1 }
```

**Query Patterns Optimized:**

- User login: `User.findOne({ email })`
- Token validation: `User.findOne({ REFRESH_TOKEN })`
- Activity analysis: `User.find().sort({ lastActiveDate: -1 })`

### 2. NewsArticles Collection Indexes

```javascript
// Core identification
{ article_id: 1 } - unique

// Trending articles
{ likes: -1, createdAt: -1 }

// Latest articles (most common)
{ createdAt: -1 }

// Search functionality
{ keywords: 1, createdAt: -1 }
{ category: 1, createdAt: -1 }
{ source_id: 1, createdAt: -1 }
{ country: 1, createdAt: -1 }
{ language: 1, createdAt: -1 }

// Full-text search
{ title: 'text', description: 'text', keywords: 'text' }

// Deduplication
{ link: 1 } - unique, sparse
```

**Query Patterns Optimized:**

- Trending: `NewsArticle.find().sort({ likes: -1, createdAt: -1 })`
- Latest: `NewsArticle.find().sort({ createdAt: -1 })`
- Keyword search: `NewsArticle.find({ keywords: keyword })`
- Category filter: `NewsArticle.find({ category: category })`

### 3. UserInteractions Collection Indexes

```javascript
// Unique constraint
{ user_id: 1, article_id: 1, action: 1 } - unique

// User activity queries
{ user_id: 1, action: 1, createdAt: -1 }
{ user_id: 1, createdAt: -1 }

// Analytics
{ article_id: 1, action: 1, createdAt: -1 }
{ action: 1, createdAt: -1 }
```

**Query Patterns Optimized:**

- User's saved articles: `UserInteraction.find({ user_id, action: "save" })`
- User's likes: `UserInteraction.find({ user_id, action: "like" })`
- Article popularity: `UserInteraction.find({ article_id, action: "like" })`

### 4. Recommendations Collection Indexes

```javascript
// Main recommendation queries
{ user_id: 1, status: 1, score: -1, createdAt: -1 }
{ user_id: 1, status: 1 }
{ user_id: 1, score: -1 }

// Category-based recommendations
{ user_id: 1, category: 1, status: 1, score: -1 }

// Cleanup and analytics
{ status: 1, createdAt: 1 }
{ source: 1, recommendationQuality: 1 }

// TTL for automatic cleanup
{ createdAt: 1 } - expireAfterSeconds: 3888000 (45 days)

// Unique constraint
{ unique_id: 1 } - unique
```

**Query Patterns Optimized:**

- Get recommendations: `Recommendation.find({ user_id, status: "new" }).sort({ score: -1 })`
- Category recommendations: `Recommendation.find({ user_id, category, status: "new" })`

### 5. DeletedUsers Collection Indexes

```javascript
// Email lookups
{ email: 1 }

// Cleanup operations
{ deletedAt: 1 }

// TTL for automatic cleanup
{ deletedAt: 1 } - expireAfterSeconds: 63072000 (2 years)
```

## Backend-Specific Optimizations

### Keyword Processing Indexes

```javascript
// Keyword extraction
{ keywords: 1 }
{ language: 1, keywords: 1 }
{ category: 1, keywords: 1, createdAt: -1 }

// TF-IDF calculations
{ keywords: 1, category: 1, language: 1 }

// Preprocessing status
{ preprocessedContent: 1 } - sparse
{ createdAt: -1, keywords: 1 } - partial filter for unprocessed articles
```

### Batch Processing Indexes

```javascript
// Corpus building
{ createdAt: -1, preprocessedContent: 1 } - partial filter

// Source analysis
{ source_id: 1, source_name: 1 }

// Duplicate detection
{ title: 1, source_id: 1 }
```

## Usage Instructions

### Running Index Creation Scripts

1. **Server indexes:**

   ```bash
   cd server
   npm run create-indexes
   ```

2. **Backend indexes:**
   ```bash
   cd backend
   npm run create-indexes
   ```

### Manual Index Management

```javascript
// Check existing indexes
db.collection.getIndexes();

// Create index manually
db.collection.createIndex({ field: 1 }, { options });

// Drop unused index
db.collection.dropIndex("indexName");

// Get index usage statistics
db.collection.aggregate([{ $indexStats: {} }]);
```

## Query Optimization Best Practices

### 1. Use Explain to Verify Index Usage

```javascript
// Check if query uses indexes efficiently
const result = await NewsArticle.find({ keywords: "technology" })
  .sort({ createdAt: -1 })
  .explain("executionStats");

console.log(result.executionStats.executionTimeMillis);
console.log(result.executionStats.indexesUsed);
```

### 2. Optimize Compound Index Order

- **Equality first:** Fields used in equality conditions should come first
- **Sort next:** Fields used in sorting should come next
- **Range last:** Fields used in range queries should come last

Example:

```javascript
// Good: { user_id: 1, status: 1, createdAt: -1 }
// For query: { user_id: userId, status: "new" } with sort: { createdAt: -1 }

// Bad: { createdAt: -1, user_id: 1, status: 1 }
```

### 3. Use Partial Indexes for Sparse Data

```javascript
// Only index documents that need processing
{
  partialFilterExpression: {
    keywords: {
      $exists: false;
    }
  }
}
```

### 4. Leverage TTL Indexes for Data Lifecycle

```javascript
// Automatic cleanup of old recommendations
{ createdAt: 1 }, { expireAfterSeconds: 3888000 }
```

## Performance Monitoring

### Key Metrics to Monitor

1. **Query Execution Time**

   - Target: < 100ms for most queries
   - Monitor with `.explain("executionStats")`

2. **Index Usage**

   - Check with `db.collection.aggregate([{ $indexStats: {} }])`
   - Drop unused indexes to save storage

3. **Collection Stats**
   - Monitor collection size growth
   - Check index size vs data size ratio

### Optimization Tools

1. **MongoDB Compass** - Visual query performance analysis
2. **MongoDB Profiler** - Slow query identification
3. **explain()** - Query execution plan analysis

## Future Considerations

### When to Add New Indexes

1. **New query patterns** emerge in application usage
2. **Slow query logs** indicate missing indexes
3. **New features** require different data access patterns

### When to Remove Indexes

1. **Index usage statistics** show zero usage
2. **Storage constraints** require optimization
3. **Query patterns change** making indexes obsolete

### Index Maintenance

1. **Regular monitoring** of index usage and performance
2. **Periodic cleanup** of unused indexes
3. **Performance testing** after index changes

## Common Query Patterns and Their Indexes

| Query Pattern         | Optimized Index                            | Collection       |
| --------------------- | ------------------------------------------ | ---------------- |
| User login            | `{ email: 1 }`                             | Users            |
| Latest articles       | `{ createdAt: -1 }`                        | NewsArticles     |
| Trending articles     | `{ likes: -1, createdAt: -1 }`             | NewsArticles     |
| User's saved articles | `{ user_id: 1, action: 1, createdAt: -1 }` | UserInteractions |
| Keyword search        | `{ keywords: 1, createdAt: -1 }`           | NewsArticles     |
| User recommendations  | `{ user_id: 1, status: 1, score: -1 }`     | Recommendations  |
| Full-text search      | `{ title: 'text', description: 'text' }`   | NewsArticles     |

## Troubleshooting

### Common Issues

1. **Slow queries despite indexes**

   - Check index usage with `explain()`
   - Verify index selectivity
   - Consider compound index order

2. **High memory usage**

   - Too many indexes
   - Large index sizes
   - Consider dropping unused indexes

3. **Write performance degradation**
   - Too many indexes on write-heavy collections
   - Balance read vs write performance

### Solutions

1. **Use hint() to force index usage**

   ```javascript
   .hint({ user_id: 1, status: 1 })
   ```

2. **Optimize compound index field order**
3. **Consider partial indexes for large collections**
4. **Use sparse indexes for optional fields**

This comprehensive indexing strategy should significantly improve your MongoDB query performance across all aspects of the Newzzy application.
