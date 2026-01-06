# Ollama Integration Guide

**AI-Powered PR Analysis with Local LLM**

This guide covers setting up and using Ollama with Merge Cockpit for intelligent pull request analysis.

---

## 🤖 What is Ollama?

[Ollama](https://ollama.ai) is a lightweight local LLM (Large Language Model) service that runs entirely on your computer. No cloud dependencies, no subscriptions, no data sent to third parties.

### Key Benefits
- ✅ Run LLMs locally (completely private)
- ✅ Fast inference (no network latency)
- ✅ Free and open source
- ✅ Works offline
- ✅ Multiple model support

---

## 📦 Installation

### Step 1: Install Ollama

**Windows & macOS:**
1. Visit https://ollama.ai
2. Download and install for your OS
3. Follow the installer

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

### Step 2: Download a Model

Merge Cockpit uses the **Mistral** model by default (fast and capable).

```bash
ollama pull mistral
```

Or choose other models:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **mistral** | 4.1GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Default (balanced) |
| neural-chat | 3.8GB | ⚡⚡⚡ | ⭐⭐⭐ | Chat & analysis |
| dolphin-mixtral | 26GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Highest quality |
| orca-mini | 1.3GB | ⚡⚡⚡⚡ | ⭐⭐⭐ | Minimal resource use |

### Step 3: Start Ollama

**Windows & macOS:**
- Open the Ollama app (runs in background)

**Linux:**
```bash
ollama serve
```

Ollama will start on `http://localhost:11434`

### Step 4: Verify Installation

```bash
curl http://localhost:11434/api/tags
```

Should return a list of installed models.

---

## ⚙️ Configuration

### Enable in Merge Cockpit

Edit `.env`:

```env
# Enable Ollama integration
REACT_APP_OLLAMA_ENABLED=true

# Ollama server URL (default shown)
REACT_APP_OLLAMA_URL=http://localhost:11434

# Model to use (default: mistral)
REACT_APP_OLLAMA_MODEL=mistral

# Sync interval (auto-refresh, ms)
REACT_APP_SYNC_INTERVAL_MS=30000
```

### Optional: Advanced Configuration

```env
# Cache settings
REACT_APP_OLLAMA_CACHE_AGE_HOURS=24
REACT_APP_OLLAMA_MAX_CACHE_SIZE=100

# Performance tuning
REACT_APP_OLLAMA_TIMEOUT_MS=30000
REACT_APP_OLLAMA_CHECK_INTERVAL_MS=60000
```

---

## 🚀 Features Unlocked

Once enabled, Merge Cockpit shows **AI Insights** section in PR details:

### 1. **Risk Assessment** ⚠️
Analyzes the PR and rates risk level (LOW/MEDIUM/HIGH) with explanation.

**Factors considered:**
- Files changed count
- Additions/deletions ratio
- PR description scope

### 2. **PR Summary** 📝
Generates a concise summary of the PR in 2-3 sentences.

**Useful for:**
- Quick understanding of changes
- Sharing with team
- Documentation

### 3. **Title Suggestions** ✏️
Suggests an improved PR title following best practices.

**Improvements:**
- Clearer language
- Better consistency
- Conventional format

### 4. **Review Focus Areas** 💬
Highlights key areas reviewers should focus on.

**Suggestions include:**
- Critical code patterns
- Testing concerns
- Integration points

### 5. **Reviewer Suggestions** 👥
AI-powered recommendations on who should review.

**Based on:**
- Code file patterns
- PR scope
- Team expertise

### 6. **Commit Message** 🔗
Generates a proper commit message.

**Follows:**
- Conventional commit format
- 50-character limit
- Clear, actionable language

---

## 💻 Usage Examples

### Basic Usage

1. Open a PR in Merge Cockpit
2. Scroll to "AI-Powered Insights" section
3. Click on sections to expand/collapse
4. Review the suggestions

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click title | Toggle section |
| ⟳ button | Refresh insights |
| Ctrl+K | Focus PR list |

### Tips & Tricks

- **Collapse insights** you don't need (saves space)
- **Refresh insights** to re-analyze if PR was updated
- **Use suggestions** as starting points, not final decisions
- **Risk level** helps prioritize review effort

---

## 🎯 AI Analysis Quality Tips

### For Better Risk Assessment
- Write comprehensive PR description
- Use meaningful file structure
- Include testing information

### For Better Summaries
- Add PR context in description
- List key changes/features
- Mention breaking changes

### For Better Title Suggestions
- Current title shows what to improve
- Suggest version follows conventions
- Examples: "fix: auth token expiration", "feat: dark mode"

### For Better Reviewer Suggestions
- Ensure team members are listed
- Add reviewer comments to PR
- Use GitHub reviewer history

---

## ⚡ Performance Considerations

### Local Machine Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| RAM | 4GB | 8GB+ |
| Disk | 5GB free | 20GB free |
| CPU | Dual-core | Quad-core+ |
| Network | Not required | N/A |

### Model Performance

| Model | Speed | Memory | Quality |
|-------|-------|--------|---------|
| mistral | ~20s/PR | 4GB | Very good |
| neural-chat | ~15s/PR | 3GB | Good |
| orca-mini | ~5s/PR | 1GB | Decent |
| dolphin-mixtral | ~60s/PR | 26GB | Excellent |

### Optimization Tips

1. **Use smaller models** if system is slow
2. **Enable caching** to avoid re-analysis
3. **Limit concurrent requests** (1-2 at a time)
4. **Close other apps** if performance is poor
5. **Use GPU acceleration** (advanced users)

---

## 🔄 Caching System

AI responses are automatically cached to improve performance.

### Cache Behavior

- **First request:** Calls Ollama, slower (~20s)
- **Subsequent requests:** Returns cached (instant)
- **Cache expiry:** 24 hours (configurable)
- **Cache limit:** 100 responses max
- **Clear cache:** Button in app settings

### Cache Format

Each cached response is indexed by:
- Analysis type (summary, risk, etc.)
- PR content (hashed)
- Timestamp

---

## 🛠️ Troubleshooting

### Ollama Not Found
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solution:**
1. Verify Ollama is running: `ollama serve`
2. Check URL in .env is correct
3. Verify port 11434 is not blocked

### Model Not Available
```
Error: model 'mistral' not found
```

**Solution:**
1. Pull the model: `ollama pull mistral`
2. Verify: `ollama list`
3. Check model name spelling

### Slow Performance

**Solutions:**
1. Use smaller model: `neural-chat` or `orca-mini`
2. Increase timeout in .env: `REACT_APP_OLLAMA_TIMEOUT_MS=60000`
3. Close other apps
4. Check disk space
5. Monitor CPU usage

### Memory Issues

**If seeing crashes or freezing:**
1. Switch to lighter model
2. Increase system RAM or swap
3. Reduce max cache size in .env
4. Restart Ollama service

### No AI Insights Showing

**Check:**
1. Is `REACT_APP_OLLAMA_ENABLED=true`?
2. Is Ollama running?
3. Is the model installed?
4. Check browser console for errors
5. Verify port 11434 in .env

---

## 📊 Advanced Configuration

### GPU Acceleration (Optional)

For faster inference with GPU (NVIDIA CUDA):

```bash
# Install NVIDIA dependencies
# Then restart Ollama
# Ollama will auto-detect and use GPU
```

**Performance boost:** 2-5x faster

### Using Different Models

Edit `.env`:

```env
# Try another model
REACT_APP_OLLAMA_MODEL=neural-chat
```

Then:
```bash
ollama pull neural-chat
```

### Custom Model Parameters

For advanced users, modify `src/services/ollama.js`:

```javascript
const response = await axios.post(
  `${this.baseUrl}/api/generate`,
  {
    model: this.model,
    prompt,
    temperature: 0.2,    // Lower = more consistent
    top_p: 0.9,          // Nucleus sampling
    top_k: 40,           // Top-k sampling
    num_predict: 256     // Max tokens
  }
);
```

---

## 🔒 Privacy & Security

### Data Privacy

✅ **All processing local** - No data sent anywhere  
✅ **No cloud services** - Completely offline  
✅ **No tracking** - No telemetry  
✅ **No logging** - Responses not stored  
✅ **Full control** - You own the data  

### Security Notes

- Ollama API has no authentication (runs locally only)
- Ensure port 11434 is not exposed to network
- Don't expose Ollama on public interfaces
- Model files stored in `~/.ollama/`

---

## 📈 Monitoring & Logs

### Check Ollama Status

```bash
# From app: Settings → AI Status

# From command line:
curl http://localhost:11434/api/tags

# For debug info:
curl -v http://localhost:11434/api/tags
```

### View Ollama Logs

**Windows:**
```
%LOCALAPPDATA%\Ollama\logs
```

**macOS:**
```
~/.ollama/logs
```

**Linux:**
```
~/.ollama/logs
```

---

## 🚀 Best Practices

### Setup
1. ✅ Install Ollama first
2. ✅ Download model before enabling in app
3. ✅ Verify Ollama is running
4. ✅ Test connection before relying on it

### Usage
1. ✅ Use AI insights as suggestions, not directives
2. ✅ Always review AI-suggested titles/messages
3. ✅ Don't override human judgment with AI
4. ✅ Cache makes repeated analysis fast

### Maintenance
1. ✅ Keep Ollama running while using app
2. ✅ Periodically check Ollama logs
3. ✅ Update Ollama to latest version
4. ✅ Clear cache if using old model

---

## 🎓 Learning Resources

### Ollama Documentation
- https://github.com/ollama/ollama
- https://ollama.ai/library
- Model descriptions and benchmarks

### Model Comparisons
- Mistral: Fast, balanced
- Neural-chat: Good for conversation
- Dolphin: High quality, resource-intensive
- Orca: Small, efficient

### LLM Concepts
- Temperature: Controls randomness (lower = consistent)
- Top-P: Nucleus sampling for diversity
- Top-K: Limits token selection
- Context window: How much text the model remembers

---

## ❓ FAQ

**Q: Does this work without Ollama?**  
A: Yes! The app works fine without it. AI features gracefully disable if Ollama isn't available.

**Q: Can I use cloud LLMs instead?**  
A: Currently no, but the architecture supports it. Contributing enhanced versions welcome.

**Q: How much internet does it use?**  
A: Zero! Everything runs locally.

**Q: Can I use a different model?**  
A: Yes! Pull any compatible model and configure in .env.

**Q: Is the AI always accurate?**  
A: No. LLMs make mistakes. Always review suggestions.

**Q: How do I update to a newer model?**  
A: `ollama pull modelname` then update .env

**Q: Can I run multiple PR analysis in parallel?**  
A: Yes, but it will be slower. Recommend 1-2 at a time.

**Q: What if I want to keep data local?**  
A: This is already fully local! No external services.

---

## 🤝 Contributing

Have improvements to AI integration? Contributions welcome!

Areas for enhancement:
- Better prompts for different analysis types
- Additional analysis features
- Model optimization
- Performance improvements
- Documentation improvements

---

## 📞 Support

### Issues with Ollama
- See: https://github.com/ollama/ollama/issues
- Model library: https://ollama.ai/library

### Issues with Integration
- Check troubleshooting section above
- Verify .env configuration
- Check that Ollama is running
- Review application logs

---

**Enjoy intelligent PR analysis with Merge Cockpit + Ollama!**

For more information, see the main README and API documentation.
