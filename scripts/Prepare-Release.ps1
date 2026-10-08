[CmdletBinding()]
param(
    [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
    [string]$Repository,
    [string]$Dotnet = 'dotnet'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$releaseVersion = '3.0.0.2'
$tag = "v$releaseVersion-jellyfin-12.2"
$output = Join-Path $root "artifacts/$tag"
New-Item -ItemType Directory -Path $output -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$plugins = @(
    @{
        Name = 'File Transformation'
        Id = '5e87cc92-571a-4d8d-8d98-d2d4147f9f90'
        Assembly = 'Jellyfin.Plugin.FileTransformation'
        Directory = 'jellyfin-plugin-file-transformation-main'
        Overview = 'Transform Jellyfin web files for other plugins.'
        Description = 'File Transformation for Jellyfin 12.2. Install this plugin together with Media Bar and restart Jellyfin.'
    },
    @{
        Name = 'Media Bar'
        Id = '08f615ea-2107-4f04-89cc-091035f54448'
        Assembly = 'Jellyfin.Plugin.MediaBar'
        Directory = 'jellyfin-plugin-media-bar-main'
        Overview = 'A slideshow media bar for the Jellyfin home screen.'
        Description = 'Media Bar for Jellyfin 12.2 with embedded slideshow assets. Requires File Transformation from this repository. Install both plugins and restart Jellyfin.'
    }
)

$manifest = @()
foreach ($plugin in $plugins) {
    $projectDir = Join-Path $root "$($plugin.Directory)/$($plugin.Assembly)"
    $project = [xml](Get-Content (Join-Path $projectDir "$($plugin.Assembly).csproj") -Raw)
    $version = ([version]$project.Project.PropertyGroup.Version).ToString()
    & $Dotnet build (Join-Path $projectDir "$($plugin.Assembly).csproj") -c Release --nologo
    if ($LASTEXITCODE -ne 0) { throw "Build failed: $($plugin.Name)" }
    $dll = Join-Path $projectDir "bin/Release/net10.0/$($plugin.Assembly).dll"
    $assemblyVersion = [Reflection.AssemblyName]::GetAssemblyName($dll).Version.ToString()
    if ($assemblyVersion -ne $version) { throw "Unexpected assembly version: $assemblyVersion" }

    $asset = "$($plugin.Assembly)_$version.zip"
    $archivePath = Join-Path $output $asset
    $archive = [IO.Compression.ZipArchive]::new(
        [IO.File]::Open($archivePath, [IO.FileMode]::Create),
        [IO.Compression.ZipArchiveMode]::Create)
    try {
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $dll, "$($plugin.Assembly).dll") | Out-Null
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $root "$($plugin.Directory)/logo.png"), 'logo.png') | Out-Null
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $root "$($plugin.Directory)/LICENSE"), 'LICENSE') | Out-Null
    }
    finally { $archive.Dispose() }

    $checksum = (Get-FileHash -LiteralPath $archivePath -Algorithm MD5).Hash.ToLowerInvariant()
    $archive = [IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
        if ($archive.Entries.Count -ne 3 -or $null -eq $archive.GetEntry("$($plugin.Assembly).dll") -or $null -eq $archive.GetEntry('LICENSE')) {
            throw "Invalid release archive: $asset"
        }
    }
    finally { $archive.Dispose() }

    if ($Repository) {
        $manifest += [ordered]@{
            guid = $plugin.Id
            name = $plugin.Name
            description = $plugin.Description
            overview = $plugin.Overview
            owner = "$($Repository.Split('/')[0]) / original author IAmParadox27"
            category = 'General'
            versions = @([ordered]@{
                version = $version
                changelog = if ($plugin.Name -eq 'Media Bar') { 'Compact configurable TV layout; server-managed random or recently added content, item count, categories and libraries. Restart client apps after updating.' } else { 'File Transformation for Jellyfin 12.2.0 (unchanged).' }
                targetAbi = '12.2.0.0'
                sourceUrl = "https://github.com/$Repository/releases/download/$tag/$asset"
                checksum = $checksum
                timestamp = [DateTime]::UtcNow.ToString('o')
            })
        }
    }
    Write-Output "Packaged $asset (MD5 $checksum)"
}

if ($Repository) {
    $json = ConvertTo-Json -InputObject $manifest -Depth 8
    [IO.File]::WriteAllText((Join-Path $output 'manifest.json'), $json, [Text.UTF8Encoding]::new($false))
    Write-Output "Repository URL after publishing: https://github.com/$Repository/releases/latest/download/manifest.json"
}
else {
    Write-Output 'Packages are ready. Pass -Repository owner/repository to generate manifest.json with final download URLs.'
}
Write-Output "Release directory: $output"
