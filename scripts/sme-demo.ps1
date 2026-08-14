# SME Demo Flow PowerShell Script
# Usage: Open PowerShell in this repo and run: .\scripts\sme-demo.ps1

$base = 'http://localhost:8081'

function Post-Json($uri, $body, $headers=@{}){
  $json = $body | ConvertTo-Json -Depth 10
  Invoke-RestMethod -Uri $uri -Method Post -Body $json -Headers $headers -ContentType 'application/json'
}

Write-Host "Starting SME demo against $base"

# 1 Register Employee
$empBody = @{ name='Lokesh'; email='lokesh@gmail.com'; password='Password123'; role='EMPLOYEE'; designation='Analyst' }
$empReg = Post-Json "$base/auth/register" $empBody
$empToken = $empReg.token
$empId = $empReg.employeeId ?? $empReg.id
Write-Host "Employee registered: $empId"

# 2 Register Manager
$mgrBody = @{ name='Sudheer'; email='manager@gmail.com'; password='Password123'; role='MANAGER'; designation='Manager' }
$mgrReg = Post-Json "$base/auth/register" $mgrBody
$mgrToken = $mgrReg.token
$mgrId = $mgrReg.employeeId ?? $mgrReg.id
Write-Host "Manager registered: $mgrId"

# 3 Employee Login
$empLogin = @{ email='lokesh@gmail.com'; password='Password123' }
$empLoginResp = Post-Json "$base/auth/login" $empLogin
$empToken = $empLoginResp.token
Write-Host "Employee token retrieved"

# 4 Manager Login
$mgrLogin = @{ email='manager@gmail.com'; password='Password123' }
$mgrLoginResp = Post-Json "$base/auth/login" $mgrLogin
$mgrToken = $mgrLoginResp.token
Write-Host "Manager token retrieved"

$empHeaders = @{ Authorization = "Bearer $empToken" }
$mgrHeaders = @{ Authorization = "Bearer $mgrToken" }

# 5-8 Validation checks (expected to return validation errors)
try {
  $bad1 = @{ reason='Personal Work'; dayType='FULL_DAY'; startDate='2026-08-10'; endDate='2026-08-10' }
  Post-Json "$base/leave/apply/$empId" $bad1 -Headers $empHeaders | ConvertTo-Json | Write-Host
} catch { Write-Host "Validation 1 response:`n$($_.Exception.Response.Content.ReadAsStringAsync().Result)`" }

try {
  $bad2 = @{ leaveType='CASUAL'; reason='Personal Work'; startDate='2026-08-10'; endDate='2026-08-10' }
  Post-Json "$base/leave/apply/$empId" $bad2 -Headers $empHeaders | ConvertTo-Json | Write-Host
} catch { Write-Host "Validation 2 response:`n$($_.Exception.Response.Content.ReadAsStringAsync().Result)`" }

try {
  $bad3 = @{ leaveType='CASUAL'; reason='Doctor Visit'; dayType='HALF_DAY'; startDate='2026-08-10'; endDate='2026-08-10' }
  Post-Json "$base/leave/apply/$empId" $bad3 -Headers $empHeaders | ConvertTo-Json | Write-Host
} catch { Write-Host "Validation 3 response:`n$($_.Exception.Response.Content.ReadAsStringAsync().Result)`" }

try {
  $bad4 = @{ leaveType='CASUAL'; reason='Personal Work'; dayType='FULL_DAY'; halfDaySession='FIRST_HALF'; startDate='2026-08-10'; endDate='2026-08-10' }
  Post-Json "$base/leave/apply/$empId" $bad4 -Headers $empHeaders | ConvertTo-Json | Write-Host
} catch { Write-Host "Validation 4 response:`n$($_.Exception.Response.Content.ReadAsStringAsync().Result)`" }

# 9 Apply Casual Leave
$leave1 = @{ leaveType='CASUAL'; reason='Family Function'; dayType='FULL_DAY'; startDate='2026-08-15'; endDate='2026-08-16' }
$r1 = Post-Json "$base/leave/apply/$empId" $leave1 -Headers $empHeaders
$leaveId1 = $r1.id ?? $r1.leaveId
Write-Host "Applied casual leave: $leaveId1"

# 10 Apply Sick Leave
$leave2 = @{ leaveType='SICK'; reason='Fever'; dayType='FULL_DAY'; startDate='2026-08-20'; endDate='2026-08-21' }
Post-Json "$base/leave/apply/$empId" $leave2 -Headers $empHeaders | Write-Host

# 11 Apply Half-Day Leave
$leave3 = @{ leaveType='CASUAL'; reason='Doctor Visit'; dayType='HALF_DAY'; halfDaySession='FIRST_HALF'; startDate='2026-08-22'; endDate='2026-08-22' }
$r3 = Post-Json "$base/leave/apply/$empId" $leave3 -Headers $empHeaders
Write-Host "Half-day response: $(($r3 | ConvertTo-Json))"

# 12 View Employee Leave History
Invoke-RestMethod -Uri "$base/leave/$empId" -Method Get -Headers $empHeaders | ConvertTo-Json | Write-Host

# 13 Manager View All Leave Requests
Invoke-RestMethod -Uri "$base/leave/all" -Method Get -Headers $mgrHeaders | ConvertTo-Json | Write-Host

# 14 Manager Approve Leave
Invoke-RestMethod -Uri "$base/leave/approve/$leaveId1" -Method Put -Headers $mgrHeaders | ConvertTo-Json | Write-Host

# 15 Check Leave Balance
Invoke-RestMethod -Uri "$base/balance/$empId" -Method Get -Headers $empHeaders | ConvertTo-Json | Write-Host

# 16 Option B - Adjust balance
Invoke-RestMethod -Uri "$base/balance/adjust/$empId?casual=12&sick=10&earned=1" -Method Put -Headers $mgrHeaders | ConvertTo-Json | Write-Host

# 17 Verify Earned Leave Balance
Invoke-RestMethod -Uri "$base/balance/$empId" -Method Get -Headers $empHeaders | ConvertTo-Json | Write-Host

# 18 Apply Earned Leave
$eLeave = @{ leaveType='EARNED'; reason='Vacation'; dayType='FULL_DAY'; startDate='2026-08-25'; endDate='2026-08-25' }
$rE = Post-Json "$base/leave/apply/$empId" $eLeave -Headers $empHeaders
$earnedLeaveId = $rE.id ?? $rE.leaveId
Write-Host "Earned leave id: $earnedLeaveId"

# 19 Approve Earned Leave
Invoke-RestMethod -Uri "$base/leave/approve/$earnedLeaveId" -Method Put -Headers $mgrHeaders | ConvertTo-Json | Write-Host

# 20 Verify Earned Leave Deduction
Invoke-RestMethod -Uri "$base/balance/$empId" -Method Get -Headers $empHeaders | ConvertTo-Json | Write-Host

Write-Host "SME demo script complete"
