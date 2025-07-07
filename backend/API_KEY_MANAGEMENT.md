# 🔑 Automatic API Key Management System

## 📋 Overview

Your news fetching system now includes an advanced API Key Manager that automatically handles rate limits (429 errors) by swapping between multiple API keys seamlessly.

## 🚀 Key Features

### ✅ **Automatic Key Rotation**

- Automatically switches to the next available API key when rate limits are hit
- Tracks usage statistics for each key
- Monitors failure rates and key health

### ✅ **Intelligent Rate Limit Handling**

- Detects 429 (Too Many Requests) errors automatically
- Parses `Retry-After` headers to know when keys will be available again
- Implements exponential backoff for server errors

### ✅ **Multi-Key Support**

- Supports unlimited number of API keys
- Load balances requests across all available keys
- Fallback system ensures maximum uptime

### ✅ **Error Recovery**

- Handles invalid API keys (401/403 errors)
- Retries on server errors (5xx)
- Automatic key reactivation when rate limits expire

## 🔧 Setup Instructions

### 1. **Environment Variables**

Set up multiple API keys in your `.env` file:

```env
NEWS_API_KEY=your_primary_api_key_here
NEWS_API_KEY2=your_backup_api_key_here
NEWS_API_KEY3=your_third_api_key_here
NEWS_API_KEY4=your_fourth_api_key_here
```

The system will automatically detect all `NEWS_API_KEY*` environment variables.

### 2. **No Code Changes Required**

Your existing `newsfetcher.js` is already updated to use the new system automatically!

## 📊 API Key Status Monitoring

### **Check Status Programmatically**

```javascript
const { getAPIKeyStatus } = require("./src/controllers/newsfetcher");

const status = getAPIKeyStatus();
console.log(`Current key: ${status.currentKey}`);
console.log(`Total keys: ${status.totalKeys}`);
```

### **REST API Endpoints**

Access monitoring via HTTP endpoints:

```bash
# Get current API key status
GET /api/keys/status

# Get detailed statistics
GET /api/keys/statistics

# Reset all keys (admin function)
POST /api/keys/reset
```

### **Example Status Response**

```json
{
  "success": true,
  "data": {
    "totalKeys": 3,
    "currentKey": "NEWS_API_KEY2",
    "keyStatus": [
      {
        "name": "NEWS_API_KEY",
        "status": "rate_limited",
        "requestCount": 150,
        "failedAttempts": 0,
        "lastUsed": "2025-01-07T10:30:00.000Z"
      },
      {
        "name": "NEWS_API_KEY2",
        "status": "active",
        "requestCount": 45,
        "failedAttempts": 0,
        "lastUsed": "2025-01-07T10:35:00.000Z"
      }
    ]
  }
}
```

## 🧪 Testing the System

### **Test API Key Swapping**

```bash
node testAPIKeys.js
```

### **Manual Testing**

```javascript
const { APIKeyManager } = require("./src/utils/apiKeyManager");

const manager = new APIKeyManager();
const response = await manager.makeRequest("https://newsdata.io/api/1/latest", {
  q: "technology",
  language: "en",
});
```

## 🔄 How It Works

### **Request Flow**

1. **Initial Request**: Uses current active API key
2. **Rate Limit Hit (429)**: Automatically switches to next available key
3. **Key Exhausted**: Marks key as rate-limited with reset timer
4. **Retry**: Continues with next available key
5. **All Keys Limited**: Waits for earliest reset time

### **Error Handling**

```
429 (Rate Limit) → Switch to next key immediately
401/403 (Invalid) → Mark key as failed, try next
5xx (Server Error) → Retry with delay
Network Error → Retry with different key
```

### **Key Status Types**

- `active`: Ready to use
- `rate_limited`: Temporarily unavailable due to rate limits
- `failed`: Permanently failed (invalid key)

## 📈 Performance Benefits

### **Before (Single Key)**

```
❌ Rate limit hit → Wait 1 hour → Resume
❌ Single point of failure
❌ No automatic recovery
```

### **After (Multi-Key System)**

```
✅ Rate limit hit → Switch key instantly → Continue
✅ 3x-5x more requests per hour
✅ Automatic failover and recovery
✅ Zero downtime during rate limits
```

## 🛠️ Configuration Options

### **Customize Timeouts**

```javascript
// In apiKeyManager.js
const response = await axios.get(url, {
  params: requestParams,
  timeout: 15000, // 15 second timeout
});
```

### **Adjust Retry Logic**

```javascript
// Maximum failed attempts before marking key as failed
return failedCount < 3; // Currently allows 3 failures
```

### **Rate Limit Reset**

```javascript
// Default rate limit duration if not specified in headers
this.markKeyRateLimited(currentIndex, 3600); // 1 hour default
```

## 🚨 Troubleshooting

### **Problem**: No API keys detected

**Solution**: Check environment variables are set correctly

```bash
echo $NEWS_API_KEY
echo $NEWS_API_KEY2
```

### **Problem**: All keys showing as failed

**Solution**: Reset keys and check API key validity

```javascript
const { resetAPIKeys } = require("./src/controllers/newsfetcher");
resetAPIKeys();
```

### **Problem**: High failure rate

**Solution**: Check API key quotas and limits with provider

## 📞 Usage Examples

### **Basic Usage (Already Implemented)**

Your `newsfetcher.js` automatically uses this system:

```javascript
// This now uses automatic key swapping!
const response = await apiManager.makeRequest(
  "https://newsdata.io/api/1/latest",
  {
    q: keyword,
    language: "en",
  }
);
```

### **Custom Implementation**

```javascript
const { APIKeyManager } = require("./src/utils/apiKeyManager");

const manager = new APIKeyManager();

// Make requests with automatic key management
const fetchNews = async (topic) => {
  try {
    const response = await manager.makeRequest(
      "https://newsdata.io/api/1/latest",
      {
        q: topic,
        language: "en",
      }
    );
    return response.data.results;
  } catch (error) {
    console.error("Failed to fetch news:", error.message);
    throw error;
  }
};
```

## 🎯 Next Steps

1. **Add More Keys**: Get additional API keys from your provider
2. **Monitor Usage**: Use the status endpoints to track performance
3. **Set Alerts**: Monitor for when all keys become rate limited
4. **Scale Up**: Add more API keys as your usage grows

Your news fetching system is now enterprise-grade with automatic failover! 🚀
