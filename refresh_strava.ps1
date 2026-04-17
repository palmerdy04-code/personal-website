Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RootDir

function Resolve-PythonCommand {
  $candidates = @(
    "python",
    "python3",
    "py",
    "C:\Users\palme\AppData\Local\Programs\Python\Python312\python.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return @($candidate)
    }

    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) {
      return @($command.Source)
    }
  }

  throw "Python was not found. Install Python or update refresh_strava.ps1 with the correct interpreter path."
}

function Resolve-GitCommand {
  $candidates = @(
    "git",
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return @($candidate)
    }

    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) {
      return @($command.Source)
    }
  }

  throw "Git was not found. Install Git or update refresh_strava.ps1 with the correct executable path."
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & $script:GitCommand[0] @Arguments
}

$useCache = $false
if ($args.Count -gt 0 -and $args[0] -eq "--use-cache") {
  $useCache = $true
}

$pythonCommand = Resolve-PythonCommand
$script:GitCommand = Resolve-GitCommand
$pythonArgs = @("server.py", "export-strava-data")
if (-not $useCache) {
  $pythonArgs += "--refresh"
}

Write-Host "Exporting Strava dashboard snapshot..."
& $pythonCommand[0] @pythonArgs

Write-Host "Staging updated snapshot..."
Invoke-Git -Arguments @("add", "data/strava-dashboard.json")

& $script:GitCommand[0] diff --cached --quiet -- data/strava-dashboard.json
if ($LASTEXITCODE -eq 0) {
  Write-Host "No Strava data changes to commit."
  exit 0
}

if ($LASTEXITCODE -ne 1) {
  throw "Unable to determine whether data/strava-dashboard.json changed."
}

$commitMessage = "Refresh Strava dashboard data ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))"

Write-Host "Committing updated snapshot..."
Invoke-Git -Arguments @("commit", "-m", $commitMessage)

Write-Host "Syncing with remote main..."
Invoke-Git -Arguments @("pull", "--rebase", "--autostash", "origin", "main")

Write-Host "Pushing to GitHub..."
Invoke-Git -Arguments @("push", "origin", "main")

Write-Host "Done. The public site will update after GitHub Pages redeploys."
