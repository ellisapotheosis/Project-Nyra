# Quick Start: 8-Folder Integration

**5-Minute Guide to Complete the Integration**

## Status: Phase 1 Complete ✅

✅ Services created
✅ Hooks created
✅ Documentation complete
⚠️ Components need updating

## Next Steps (30-60 minutes)

### 1. Export New Services (2 minutes)

Edit `src/services/index.ts`:
```typescript
export * from './pcDetector';
export * from './folderStructureManager';
```

### 2. Re-apply PCSelector Updates (10 minutes)

The PCSelector.tsx update didn't fully apply. Replace the entire file with the version from INTEGRATION-GUIDE.md, lines containing the full updated component.

Key additions:
- Import `usePCDetection` and `useFolderStructure`
- Add detection status banner
- Add confidence badges
- Add manual override panel
- Auto-detect on mount

### 3. Update ComponentSelector (15 minutes)

Add to imports:
```typescript
import { useFolderStructure } from '../hooks/useFolderStructure';
```

Add to component:
```typescript
const {
  availableComponents,
  recommendedComponents,
  componentFiles,
  loadPCContents,
  loadComponentFiles
} = useFolderStructure(process.env.BOOTSTRAP_PATH || '../bootstrap');

useEffect(() => {
  if (selectedPC) {
    loadPCContents(selectedPC);
  }
}, [selectedPC, loadPCContents]);
```

Replace hardcoded components with:
```typescript
const components = availableComponents.map(id => ({
  id,
  displayName: /* from manifest */,
  description: /* from manifest */,
  enabled: recommendedComponents.includes(id),
  required: /* logic */
}));
```

Add file count indicator:
```typescript
<span className="text-xs text-gray-500">
  {componentFiles?.configFiles.length || 0} configs,
  {componentFiles?.scriptFiles.length || 0} scripts
</span>
```

### 4. Update InstallationProgress (20 minutes)

Add to imports:
```typescript
import { FolderStructureManager } from '../services/folderStructureManager';
```

Add manager:
```typescript
const [manager] = useState(
  () => new FolderStructureManager(process.env.BOOTSTRAP_PATH || '../bootstrap')
);
```

Update installation logic:
```typescript
async function installComponent(componentId: ComponentId) {
  // 1. Get files
  const files = await manager.getComponentFiles(selectedPC!, componentId);

  // 2. Deploy configs (PC-specific overrides shared)
  for (const configFile of files.configFiles) {
    await deployConfigFile(configFile);
  }

  // 3. Run scripts
  for (const scriptFile of files.scriptFiles) {
    await runScript(scriptFile);
  }

  // 4. Launch docker
  for (const dockerFile of files.dockerFiles) {
    await runDockerCompose(dockerFile);
  }
}
```

Add progress details:
```typescript
<div className="text-sm text-gray-600">
  Installing from: {getFileSource(file)}
</div>
```

### 5. Test (10 minutes)

```bash
# Start dev server
npm run dev

# Test flow:
# 1. PC detection should auto-run
# 2. Should show confidence score
# 3. Should load components from folder
# 4. Should show file counts
# 5. Installation should use correct paths
```

## File Checklist

- [ ] `src/services/index.ts` - Add exports
- [ ] `src/components/PCSelector.tsx` - Re-apply updates
- [ ] `src/components/ComponentSelector.tsx` - Add folder structure
- [ ] `src/components/InstallationProgress.tsx` - Use manager
- [ ] Test on at least one PC type

## Quick Test Script

```typescript
// Test in browser console after starting dev server:

// 1. Test PC detection
import { PCDetector } from './services/pcDetector';
const result = await PCDetector.detect();
console.log('Detected PC:', result);

// 2. Test folder structure
import { FolderStructureManager } from './services/folderStructureManager';
const manager = new FolderStructureManager('../bootstrap');
const contents = await manager.listPCFolderContents('orchestrator-mini');
console.log('PC Contents:', contents);

// 3. Test structure validation
const verification = await manager.verifyStructure();
console.log('Structure Valid:', verification);
```

## Common Issues

### Issue: Import errors
**Fix**: Run `npm install` to ensure dependencies are installed

### Issue: PC detection returns 0% confidence
**Fix**: Check if GPU drivers installed, hostname matches patterns

### Issue: Folder structure validation fails
**Fix**: Verify bootstrap path is correct, all 8 folders exist

### Issue: Component files not found
**Fix**: Check if configs/scripts exist in PC folders

## Verification

✅ **Services work**:
```bash
node -e "require('./src/services/pcDetector').PCDetector.detect().then(console.log)"
```

✅ **Hooks work**:
- Start dev server
- Open PCSelector
- Should see "Detecting PC..." then results

✅ **Components work**:
- Select PC
- Should see available components
- Should show file counts
- Installation should work

## Full Integration Flow

```
User launches installer
  ↓
PCSelector loads
  ↓
usePCDetection runs
  ↓
PCDetector.detect() analyzes hardware
  ↓
Shows detected PC with confidence
  ↓
User confirms/overrides
  ↓
useFolderStructure.verifyStructure()
  ↓
ComponentSelector loads
  ↓
manager.getInstallationOptions(pcId)
  ↓
Shows available components
  ↓
User selects components
  ↓
InstallationProgress starts
  ↓
manager.getComponentFiles(pcId, componentId)
  ↓
Deploys configs, runs scripts, launches docker
  ↓
Validates installation
  ↓
Complete! ✅
```

## Documentation Links

- **INTEGRATION-GUIDE.md** - Full integration details
- **IMPLEMENTATION-SUMMARY.md** - What was done, what's left
- **README.md** - Installer overview

## Need Help?

Check these files in order:
1. **IMPLEMENTATION-SUMMARY.md** - Status and next steps
2. **INTEGRATION-GUIDE.md** - Detailed API reference
3. **bootstrap/docs/STRUCTURE.md** - Folder structure docs

## Timeline Estimate

- ✅ Phase 1 (Services & Hooks): **Complete**
- ⏳ Phase 2 (Component Updates): **30-60 min**
- ⏳ Phase 3 (Testing): **15-30 min**
- ⏳ Phase 4 (Validation): **15 min**

**Total remaining**: ~1-2 hours

---

**Ready to continue?** Start with Step 1 (Export Services) above!
