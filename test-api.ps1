# Test login endpoint
Write-Host "Testing login endpoint..."
$loginPayload = @{
    email = "employee@company.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" -Method POST -Body $loginPayload -ContentType "application/json"
Write-Host "Login Response:"
Write-Host ($loginResponse | ConvertTo-Json -Depth 10)
$token = $loginResponse.token
Write-Host "`nToken: $token"

# Wait a moment
Start-Sleep -Seconds 2

# Test /balance/me endpoint with JWT token
Write-Host "`n--- Testing /balance/me endpoint ---"
try {
    $balanceResponse = Invoke-RestMethod -Uri "http://localhost:8081/balance/me" -Method GET -Headers @{"Authorization" = "Bearer $token"} -ErrorAction Stop
    Write-Host "Balance Response:"
    Write-Host ($balanceResponse | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    }
}

# Test /leave/me endpoint with JWT token
Write-Host "`n--- Testing /leave/me endpoint ---"
try {
    $leaveResponse = Invoke-RestMethod -Uri "http://localhost:8081/leave/me" -Method GET -Headers @{"Authorization" = "Bearer $token"} -ErrorAction Stop
    Write-Host "Leave Requests Response:"
    Write-Host ($leaveResponse | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    }
}
