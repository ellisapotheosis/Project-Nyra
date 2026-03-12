# Claude Flow Integration - Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Claude Flow CLI installed:**
   ```bash
   npx @claude-flow/cli@latest --version
   ```

2. **Claude Flow daemon running:**
   ```bash
   npx @claude-flow/cli@latest daemon start
   ```

3. **Dependencies installed:**
   ```bash
   cd apps/nexus-dashboard
   pnpm install
   ```

## Quick Test

### 1. Start Development Server

```bash
cd apps/nexus-dashboard
pnpm dev
```

Expected output:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3005
  - Ready in X.Xs
```

### 2. Test Main Dashboard

**Navigate to:** http://localhost:3005/claude-flow

**Verify:**
- [ ] Page loads without errors
- [ ] All 4 overview cards display (User Info, V3 Progress, Patterns Learned, Security)
- [ ] Last updated timestamp shows in top-right corner
- [ ] Timestamp updates every 5 seconds
- [ ] All 4 tabs are visible (Swarm, Memory, System, Terminal)
- [ ] Tab switching works smoothly
- [ ] Quick Actions section displays at bottom

**Swarm Tab:**
- [ ] Active agents count displays
- [ ] Coordination status badge shows (Active/Inactive)
- [ ] "Spawn New Agent" button visible

**Memory Tab:**
- [ ] Memory MB displays
- [ ] Context percentage displays
- [ ] Intelligence percentage displays

**System Tab:**
- [ ] Memory usage bar renders
- [ ] Context usage bar renders
- [ ] Intelligence bar renders
- [ ] Sub-agents count displays

**Terminal Tab:**
- [ ] Mock terminal interface displays
- [ ] Command output shows
- [ ] Terminal size indicator visible
- [ ] Clear and Copy Output buttons work

### 3. Test Embedded Dashboard

**Navigate to:** http://localhost:3005/claude-flow/dashboard

**Verify:**
- [ ] Page loads without errors
- [ ] iframe renders full-width
- [ ] HTML dashboard displays inside iframe
- [ ] Dashboard auto-refreshes every 5 seconds
- [ ] Gradient background displays correctly

### 4. Test API Endpoint

```bash
curl http://localhost:3005/api/claude-flow/status | jq
```

**Expected Response:**
```json
{
  "user": {
    "name": "ellisapotheosis",
    "gitBranch": "main",
    "modelName": "Opus 4.5"
  },
  "v3Progress": {
    "domainsCompleted": 2,
    "totalDomains": 5,
    "dddProgress": 40,
    "patternsLearned": 76,
    "sessionsCompleted": 7
  },
  "security": {...},
  "swarm": {...},
  "system": {...}
}
```

### 5. Test Error Handling

**Scenario 1: Stop Claude Flow daemon**
```bash
npx @claude-flow/cli@latest daemon stop
```

**Expected behavior:**
- Dashboard should show demo data
- No error message (graceful fallback)
- Auto-refresh continues

**Scenario 2: API timeout**
- Dashboard should retry after 10 seconds
- Error state shows if repeated failures
- Retry button appears

**Scenario 3: React component error (Dev Tools)**
```javascript
// In browser console
throw new Error('Test error boundary')
```

**Expected behavior:**
- Error boundary catches error
- User-friendly error message displays
- Stack trace visible in development
- Retry button available
- Click retry reloads page

### 6. Test Navigation

**From Main Dashboard:**
- [ ] Click "Nexus Router" logo → Returns to home
- [ ] Click other sidebar links → Navigation works
- [ ] Claude Flow link highlighted when active
- [ ] Back button works correctly

### 7. Test Responsive Design

**Test breakpoints:**
- [ ] Mobile (< 768px) - Cards stack vertically
- [ ] Tablet (768px - 1024px) - 2 column grid
- [ ] Desktop (> 1024px) - 4 column grid

### 8. Test Performance

**Metrics to check:**
- [ ] Initial page load < 3 seconds
- [ ] API response time < 1 second
- [ ] Auto-refresh doesn't cause UI jank
- [ ] No memory leaks after 5 minutes
- [ ] CPU usage remains reasonable

### 9. Test Accessibility

**Keyboard navigation:**
- [ ] Tab through all interactive elements
- [ ] Space/Enter activates buttons
- [ ] Tab panels keyboard accessible
- [ ] Error boundary message focusable

**Screen reader:**
- [ ] Card titles announced
- [ ] Status badges announced
- [ ] Loading states announced
- [ ] Error messages announced

### 10. Test Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## Integration Tests

### Test Auto-Refresh

1. Open dashboard
2. Note current timestamp
3. Wait 5 seconds
4. Verify timestamp updated
5. Check data refreshed
6. Repeat 3 times

**Expected:** Consistent 5-second updates, no failures

### Test Concurrent Sessions

1. Open dashboard in 2 browser tabs
2. Verify both update independently
3. Check no conflicts
4. Both show same data

**Expected:** No race conditions, clean updates

### Test Load Handling

1. Open dashboard
2. Spawn multiple agents via CLI:
   ```bash
   npx @claude-flow/cli@latest agent spawn -t coder --name test1
   npx @claude-flow/cli@latest agent spawn -t tester --name test2
   ```
3. Verify agent count updates
4. Check no UI slowdown

**Expected:** Real-time updates reflect changes

## Debugging

### Common Issues

**Issue:** Dashboard shows "Loading..." forever

**Debug:**
```bash
# Check API endpoint
curl http://localhost:3005/api/claude-flow/status

# Check Next.js logs
# Look for errors in terminal where `pnpm dev` is running

# Check browser console
# Open DevTools → Console tab
```

**Issue:** Demo data displays instead of real data

**Debug:**
```bash
# Test CLI command directly
npx @claude-flow/cli@latest hooks statusline --json

# Verify daemon is running
npx @claude-flow/cli@latest daemon status
```

**Issue:** Auto-refresh stops working

**Debug:**
```javascript
// In browser console
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/claude-flow/status'))
  .forEach(r => console.log(r.name, r.duration))

// Check if requests are being made
```

**Issue:** Error boundary not catching errors

**Debug:**
- Check ErrorBoundary is wrapping component
- Verify error is in render phase (not event handlers)
- Check browser console for error details

### Logs to Check

1. **Next.js server logs:** Terminal running `pnpm dev`
2. **Browser console:** DevTools → Console
3. **Network tab:** DevTools → Network
4. **React DevTools:** Check component tree

### Performance Profiling

```javascript
// In browser console
performance.mark('dashboard-start');
// ... wait for load ...
performance.mark('dashboard-end');
performance.measure('dashboard-load', 'dashboard-start', 'dashboard-end');
console.table(performance.getEntriesByType('measure'));
```

## Acceptance Criteria

### Must Pass

- ✅ Dashboard loads without errors
- ✅ All data displays correctly
- ✅ Auto-refresh works (5s interval)
- ✅ Navigation works
- ✅ Error boundary catches errors
- ✅ API endpoint responds
- ✅ Responsive design works
- ✅ No console errors

### Should Pass

- ✅ Graceful degradation (demo data fallback)
- ✅ Accessibility standards met
- ✅ Performance targets met
- ✅ Browser compatibility
- ✅ Concurrent sessions work

### Nice to Have

- ✅ WebSocket real-time updates (future)
- ✅ Interactive terminal (future)
- ✅ Advanced metrics charts (future)
- ✅ Agent management UI (future)

## Test Results Template

```markdown
## Test Results - [Date]

**Tester:** [Name]
**Environment:** [Dev/Staging/Production]
**Browser:** [Chrome/Firefox/Safari]
**Claude Flow Version:** [Version]

### Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

### Failed Tests
1. [Test Name]
   - Expected: ...
   - Actual: ...
   - Screenshots: [links]

### Notes
- [Any observations]
- [Performance issues]
- [Suggestions]

### Sign-off
- [ ] All critical tests passed
- [ ] Ready for deployment
```

## Continuous Testing

### On Each Commit

Run automated checks:
```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build test
pnpm build
```

### Before Deployment

1. Run full test suite
2. Performance profiling
3. Accessibility audit
4. Security scan
5. Load testing

## Support

For issues or questions:
1. Check `CLAUDE-FLOW-INTEGRATION.md` for architecture details
2. Review `apps/nexus-dashboard/CLAUDE.md` for tech stack guidelines
3. Check Claude Flow documentation: https://github.com/ruvnet/claude-flow
