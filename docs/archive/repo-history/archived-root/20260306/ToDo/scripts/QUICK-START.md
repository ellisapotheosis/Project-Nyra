# Quick Start - Get Running in 5 Minutes

Welcome! If you just want to get started immediately without reading the full documentation, follow these simple steps. You can read the detailed README later to understand what's happening under the hood.

## What You're About to Do

You're going to consolidate all your scattered bootstrap files into one organized system, then use a GUI installer to set up your four PCs with everything they need for Project Nyra. This process is safe because it never overwrites your existing work and creates backups of everything before making changes.

## Five Simple Steps

**Step 1: Put This Package in the Right Place**

Copy this entire folder (the one containing this file) to C:\Dev\Projects\Repos\Project-Nyra\bootstrap. After copying, you should have a path like C:\Dev\Projects\Repos\Project-Nyra\bootstrap\nyra-bootstrap-complete-package. Use File Explorer to do this - just copy and paste the folder.

**Step 2: Open PowerShell in This Directory**

Press Windows Key plus X, then click Windows PowerShell. Type this command and press Enter:

```powershell
cd "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\nyra-bootstrap-complete-package"
```

**Step 3: Allow Scripts to Run (One Time Only)**

Type this command and press Enter:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

When it asks for confirmation, type Y and press Enter. You only need to do this once ever.

**Step 4: Analyze Your Files (Completely Safe)**

Type this command and press Enter:

```powershell
.\01-ANALYZE.ps1 -Verbose
```

This scans all your files but changes nothing. When done, it will ask if you want to open the report. Press Y to read it. The report shows you what files you have and if there are any conflicts. Take a few minutes to read through it.

**Step 5: Consolidate Everything (Creates Backup First)**

Type this command and press Enter:

```powershell
.\02-CONSOLIDATE.ps1 -Backup -Verbose
```

This backs up everything, then organizes your bootstrap files. When it asks for confirmation, press Y to continue. When it finishes, your bootstrap folder is fully organized.

## What Just Happened

Your bootstrap materials from three different locations are now merged into one organized structure. Your original files were never overwritten because they have the highest priority. Everything is backed up in case you want to undo anything. You now have a clean, organized bootstrap folder that's ready to use.

## Next Step: Use the GUI Installer

Now you can bootstrap your four PCs. Type this command:

```powershell
.\03-GUI-INSTALLER.ps1
```

A window opens where you select which PC you're setting up (Orchestrator, Worker-5090, Worker-3090, or Worker-3060). Pick the right one, configure your settings, and click Start Installation. The installer handles everything automatically.

## Important Notes

If you get stuck at any point, open the full README.md file in this folder for detailed explanations. The README explains every step in depth and includes troubleshooting for common issues.

Your application code in the apps folder is completely safe and was never touched. Same with your docs folder. Only bootstrap files were consolidated, and even those used your existing versions as the master copies.

You can run the analysis script as many times as you want because it's read-only. The consolidation script creates a new backup each time you run it, so you can safely run it multiple times if needed.

## That's It!

You're done with consolidation. Your bootstrap folder is now organized and ready to use. Use the GUI installer to set up each of your four PCs, starting with whichever one you're currently on.

Questions? Read the full README.md for comprehensive explanations of everything this package does and why.
