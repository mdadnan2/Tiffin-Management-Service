@echo off
echo ========================================
echo Dashboard Performance Test
echo ========================================
echo.

set API_URL=http://localhost:3001
set /p TOKEN="Enter your JWT token: "

echo.
echo Testing dashboard endpoint...
echo.

powershell -Command "$start = Get-Date; try { $response = Invoke-WebRequest -Uri '%API_URL%/dashboard' -Headers @{'Authorization'='Bearer %TOKEN%'} -UseBasicParsing; $end = Get-Date; $duration = ($end - $start).TotalMilliseconds; Write-Host '✓ Success!' -ForegroundColor Green; Write-Host 'Response Time:' $duration 'ms' -ForegroundColor Cyan; Write-Host 'Status Code:' $response.StatusCode -ForegroundColor Cyan; if ($duration -lt 500) { Write-Host 'EXCELLENT - Under 500ms!' -ForegroundColor Green } elseif ($duration -lt 1000) { Write-Host 'GOOD - Under 1 second' -ForegroundColor Yellow } else { Write-Host 'NEEDS IMPROVEMENT - Over 1 second' -ForegroundColor Red } } catch { Write-Host '✗ Failed:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
echo Performance Benchmarks:
echo ========================================
echo Excellent: ^< 500ms
echo Good:      500ms - 1s
echo Poor:      ^> 1s
echo.

pause
