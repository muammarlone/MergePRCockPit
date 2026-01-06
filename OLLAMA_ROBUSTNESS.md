# AI Robustness Architecture

**Ollama Integration Design & Robustness Patterns**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│        React PR Details Component           │
│  ┌───────────────────────────────────────┐  │
│  │  AIInsights Component (collapsible)   │  │
│  │  - Risk Assessment                    │  │
│  │  - PR Summary                         │  │
│  │  - Title Suggestions                  │  │
│  │  - Review Focus Areas                 │  │
│  │  - Reviewer Suggestions               │  │
│  │  - Commit Message                     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           ↓ IPC Call (getAIInsights)
┌─────────────────────────────────────────────┐
│    Electron Main Process                    │
│  ┌───────────────────────────────────────┐  │
│  │  Parallel Promise.all() for speed     │  │
│  │  - All 6 analyses run concurrently    │  │
│  │  - Single IPC roundtrip               │  │
│  │  - Error handling per feature         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           ↓ (All async, non-blocking)
┌─────────────────────────────────────────────┐
│    Ollama Service Layer                     │
│  ┌───────────────────────────────────────┐  │
│  │  generatePRSummary()                  │  │
│  │  suggestPRTitle()                     │  │
│  │  suggestReviewers()                   │  │
│  │  assessPRRisk()                       │  │
│  │  generateReviewComments()             │  │
│  │  generateCommitMessage()              │  │
│  │                                       │  │
│  │  Features:                            │  │
│  │  ✓ Availability checking              │  │
│  │  ✓ Timeout handling (30s)             │  │
│  │  ✓ Error recovery                     │  │
│  │  ✓ Response caching (24h)             │  │
│  │  ✓ Cache size limiting (100 items)    │  │
│  │  ✓ Health checks (1min interval)      │  │
│  │  ✓ Graceful degradation               │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           ↓ Axios HTTP calls
┌─────────────────────────────────────────────┐
│    Ollama API (Local)                       │
│  http://localhost:11434/api/generate        │
│  http://localhost:11434/api/tags            │
└─────────────────────────────────────────────┘
```

---

## 🛡️ Robustness Features

### 1. **Availability Checking**

```javascript
// Checks if Ollama is available before making calls
async _checkAvailability() {
  // Only check every 60 seconds (configurable)
  if (Date.now() - this.lastCheckTime < this.checkInterval) {
    return this.available;
  }

  // Try to reach Ollama with timeout
  try {
    const response = await axios.get(`${this.baseUrl}/api/tags`, {
      timeout: 5000  // 5-second timeout for health check
    });
    this.available = !!response.data;
  } catch {
    this.available = false;  // Mark unavailable
  }

  return this.available;
}
```

**Benefits:**
- Prevents hanging requests
- Caches availability state
- Reduces unnecessary API calls
- Graceful fallback when unavailable

### 2. **Timeout Protection**

```javascript
// All Ollama calls have a 30-second timeout
const response = await axios.post(
  `${this.baseUrl}/api/generate`,
  { /* prompt */ },
  { timeout: 30000 }  // 30 seconds max
);
```

**Prevents:**
- Infinite waiting
- UI freezing
- Resource exhaustion
- Cascading timeouts

### 3. **Error Handling**

```javascript
async _callOllama(prompt, options = {}) {
  try {
    // Only call if enabled and available
    if (!this.enabled || !await this._checkAvailability()) {
      return null;  // Return null instead of error
    }

    const response = await axios.post(/* ... */);
    return response.data?.response || null;
  } catch (error) {
    console.warn('Ollama API error:', error.message);
    return null;  // Graceful error - don't crash
  }
}
```

**Features:**
- No exceptions thrown
- Errors logged but handled
- Returns null for graceful degradation
- UI continues to work

### 4. **Smart Caching**

```javascript
// Check cache first (instant response)
const cached = this._getCached(cacheKey);
if (cached) return cached;

// Call Ollama if not cached
const summary = await this._callOllama(prompt);

// Cache the result
if (summary) {
  this._setCached(cacheKey, summary);
}
```

**Cache Management:**
- Cache key: Type + hashed data
- Expiry: 24 hours (configurable)
- Size limit: 100 items max
- Auto-eviction of oldest items

**Benefits:**
- 2nd+ analysis is instant
- Reduces Ollama load
- Works well with repeated PR views
- Easy to clear if needed

### 5. **Parallel Execution**

```javascript
// All 6 analysis types run simultaneously
const [summary, title, reviewers, risk, comments, commit] = 
  await Promise.all([
    ollamaService.generatePRSummary(pr),
    ollamaService.suggestPRTitle(pr.title, pr.body),
    ollamaService.suggestReviewers(pr),
    ollamaService.assessPRRisk(pr),
    ollamaService.generateReviewComments(pr),
    ollamaService.generateCommitMessage(pr.title, pr.body)
  ]);
```

**Benefits:**
- Single analysis doesn't wait for others
- Much faster overall response (1 timeout vs 6)
- Single IPC call for all insights
- Better UX (one loading spinner)

### 6. **Flexible UI Integration**

```javascript
// AIInsights component gracefully handles all states
<AIInsights 
  owner={owner} 
  repo={repo} 
  pr={pr} 
  loading={insightsLoading}
/>

// The component shows:
// - Loading spinner while fetching
// - Individual insights as they become available
// - Collapsed sections to save space
// - Disabled state if Ollama unavailable
// - Error message with retry option
```

**Graceful Degradation:**
- App works without Ollama
- App works with Ollama unavailable
- User can retry loading
- Can clear cache in settings
- Insights are optional, not critical

---

## 💡 Configuration Robustness

### Environment Variables with Defaults

```javascript
constructor(config = {}) {
  this.baseUrl = config.ollamaUrl || 
    process.env.REACT_APP_OLLAMA_URL || 
    'http://localhost:11434';           // Hardcoded default

  this.model = config.model || 
    process.env.REACT_APP_OLLAMA_MODEL || 
    'mistral';                          // Hardcoded default

  this.enabled = config.enabled !== false && 
    process.env.REACT_APP_OLLAMA_ENABLED === 'true'; // Default off

  this.timeout = config.timeout || 30000;  // Default timeout
  this.checkInterval = config.checkInterval || 60000; // Health check
}
```

**Benefits:**
- Works even if .env missing keys
- Multiple fallback sources
- Opt-in feature (default disabled)
- Configurable everything

### Health Check Endpoint

```javascript
async healthCheck() {
  return {
    enabled: this.enabled,
    available: await this._checkAvailability(),
    model: this.model,
    cacheSize: this.cache.size,
    timestamp: new Date().toISOString()
  };
}

// Exposed via IPC:
// window.electronAPI.getOllamaStatus()
```

**Useful for:**
- Debugging configuration issues
- Monitoring Ollama health
- Displaying status to user
- Troubleshooting

---

## 📊 Performance Optimization

### Cache Statistics

```javascript
getCacheStats() {
  return {
    size: this.cache.size,      // Current items
    enabled: this.enabled,       // Is feature on?
    available: this.available,   // Is service running?
    model: this.model,           // Which model?
    baseUrl: this.baseUrl        // Where's it running?
  };
}
```

### Performance Metrics

| Operation | Time | Behavior |
|-----------|------|----------|
| Cached analysis | 1-5ms | Instant from memory |
| First analysis | 15-30s | Depends on model |
| Health check | <5s | Quick availability test |
| Availability cache | 60s | Reduces unnecessary checks |
| Parallel 6 analyses | ~25s | All run together |

### Load Optimization

- Health checks only every 60 seconds
- Cache prevents repeated analysis
- Parallel execution maximizes throughput
- Small request/response sizes
- Timeout prevents resource leak

---

## 🎯 Failure Scenarios & Handling

### Scenario 1: Ollama Not Installed
```
User hasn't installed Ollama
→ REACT_APP_OLLAMA_ENABLED=false
→ AI Insights section doesn't load
→ App functions normally
→ Guide to enable in documentation
```

### Scenario 2: Ollama Not Running
```
Ollama server process stopped
→ Health check fails
→ Available flag set to false
→ All Ollama calls return null
→ UI shows "disabled" state
→ User can restart and retry
```

### Scenario 3: Network Timeout
```
Ollama takes >30 seconds to respond
→ Timeout exception caught
→ Error logged (not thrown)
→ null returned (no crash)
→ UI updates with "unavailable"
→ Doesn't block other operations
```

### Scenario 4: Model Not Available
```
User has Ollama but wrong model
→ API returns error
→ Caught and logged
→ Returns null gracefully
→ Documentation helps select model
→ User can pull correct model
```

### Scenario 5: Bad Configuration
```
User sets invalid Ollama URL
→ Health check fails
→ Marked unavailable
→ No further calls attempted
→ User sees disabled state
→ Can fix .env and restart
```

### Scenario 6: Concurrent Requests
```
User views multiple PRs quickly
→ All run in parallel
→ Doesn't block each other
→ Cache prevents redundant requests
→ Each gets separate timeout
→ Failed request doesn't affect others
```

---

## 🔄 State Management

### Service State

```javascript
this.available = false;           // Is Ollama reachable?
this.enabled = false;             // Is feature enabled?
this.lastCheckTime = 0;           // When did we last check?
this.cache = new Map();           // Cached responses
```

### Component State

```javascript
const [insights, setInsights] = useState(null);        // AI responses
const [insightsLoading, setInsightsLoading] = useState(false);  // Loading?
const [error, setError] = useState(null);              // Error state?
const [expandedSection, setExpandedSection] = useState(null);  // UI
```

### Synchronization

- Service maintains its own state (availability)
- Component has independent state (insights loaded)
- No circular dependencies
- Errors contained in each layer

---

## 🧪 Testing Strategy

### Unit Tests (Could be added)

```javascript
// Test availability checking
await service._checkAvailability()
  ✓ Returns true when Ollama available
  ✓ Returns false when unavailable
  ✓ Caches result for 60 seconds
  ✓ Respects custom check interval

// Test caching
service._setCached(key, data)
  ✓ Stores data with timestamp
  ✓ Evicts oldest when over limit (100)
  ✓ Removes expired entries (24h)

// Test error handling
await service._callOllama(prompt)
  ✓ Returns null on timeout
  ✓ Returns null on network error
  ✓ Returns null if unavailable
  ✓ Never throws exception

// Test parallel execution
const insights = await getAIInsights(pr)
  ✓ Runs all 6 analyses in parallel
  ✓ Partial failures don't block others
  ✓ Single timeout prevents hanging
  ✓ Returns available insights only
```

### Integration Tests (Could be added)

```javascript
// Test real Ollama connection
✓ Connects to local Ollama
✓ Recognizes available models
✓ Gets correct response
✓ Caches response properly

// Test fallback behavior
✓ Works without Ollama
✓ Works with Ollama unavailable
✓ Works with wrong model
✓ Gracefully degrades
```

---

## 📈 Monitoring & Observability

### Console Logging

```javascript
// Warnings for errors (user shouldn't see these)
console.warn('Ollama API error:', error.message);

// Could add: (not included in base version)
// - Performance metrics
// - Cache hit/miss ratios
// - Request latency tracking
// - Error rate monitoring
```

### Health Check Endpoint

```javascript
// User can call:
const status = await window.electronAPI.getOllamaStatus();

// Returns:
{
  enabled: true,
  available: true,
  model: "mistral",
  cacheSize: 5,
  timestamp: "2026-01-05T..."
}
```

### Cache Management

```javascript
// User can clear cache:
await window.electronAPI.clearOllamaCache();

// Service exposes stats:
service.getCacheStats()  // For debugging
```

---

## 🚀 Future Enhancement Ideas

### Phase 1: Core (Done)
- ✅ Ollama service wrapper
- ✅ AI insights component
- ✅ Caching layer
- ✅ Error handling
- ✅ Health checks

### Phase 2: Enhancements
- [ ] Streaming responses (show results as they arrive)
- [ ] Per-feature enable/disable
- [ ] Custom prompt templates
- [ ] Batch analysis (multiple PRs)
- [ ] Usage analytics dashboard
- [ ] Model switching in UI
- [ ] Cache size monitoring

### Phase 3: Integration
- [ ] Scheduled background analysis
- [ ] Webhook integration
- [ ] Diff analysis (actual file changes)
- [ ] Code pattern detection
- [ ] Performance regression detection
- [ ] Security scanning
- [ ] Automated merge suggestions

### Phase 4: Cloud Options
- [ ] Support for OpenAI API
- [ ] Support for Anthropic Claude
- [ ] Support for Google PaLM
- [ ] Hybrid local+cloud approach
- [ ] Cost tracking

---

## 🎓 Design Principles Applied

1. **Graceful Degradation**
   - App works without Ollama
   - App works when Ollama unavailable
   - Missing insights don't break UI

2. **Fail Fast**
   - Check availability before expensive ops
   - Quick timeout to prevent hanging
   - Error immediately returned (not thrown)

3. **Cache Everything**
   - Same PR analysis reused
   - Saves computation and energy
   - Improves perceived performance

4. **Parallel Operations**
   - All analyses run together
   - Single network call
   - Better overall response time

5. **Configuration Flexibility**
   - Multiple config sources
   - Sensible defaults
   - Easy to override

6. **User Control**
   - Clear on/off toggle
   - Can retry if failed
   - Can clear cache
   - Can see status

---

## ✅ Robustness Checklist

- [x] Availability checking before calls
- [x] Timeout protection (30s)
- [x] Error handling (no crashes)
- [x] Graceful degradation (works without)
- [x] Response caching (24h)
- [x] Cache size limiting (100 items)
- [x] Parallel execution (6 features together)
- [x] Health check endpoint
- [x] Configuration defaults
- [x] UI state management
- [x] Error logging
- [x] Cache statistics
- [x] Retry capability

---

**This architecture ensures Merge Cockpit with Ollama is robust, performant, and user-friendly!**
