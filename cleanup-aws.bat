@echo off
echo ========================================
echo AWS Lambda Cleanup Script
echo ========================================
echo.

set REGION=us-east-1
set FUNCTION_NAME=tiffin-management-api-prod-api

echo Deleting Lambda function: %FUNCTION_NAME%
aws lambda delete-function --function-name %FUNCTION_NAME% --region %REGION% 2>nul
if %errorlevel% equ 0 (echo ✓ Lambda function deleted) else (echo ✗ Lambda function not found or already deleted)
echo.

echo Deleting CloudWatch Log Groups...
aws logs delete-log-group --log-group-name /aws/lambda/%FUNCTION_NAME% --region %REGION% 2>nul
if %errorlevel% equ 0 (echo ✓ CloudWatch logs deleted) else (echo ✗ Log group not found or already deleted)
echo.

echo Listing API Gateways...
for /f "tokens=*" %%i in ('aws apigateway get-rest-apis --region %REGION% --query "items[?contains(name,'tiffin')].id" --output text 2^>nul') do (
    echo Deleting API Gateway: %%i
    aws apigateway delete-rest-api --rest-api-id %%i --region %REGION% 2>nul
    if !errorlevel! equ 0 (echo ✓ API Gateway deleted) else (echo ✗ Failed to delete API Gateway)
)
echo.

echo Listing IAM Roles...
for /f "tokens=*" %%i in ('aws iam list-roles --query "Roles[?contains(RoleName,'tiffin')].RoleName" --output text 2^>nul') do (
    echo Detaching policies from role: %%i
    for /f "tokens=*" %%p in ('aws iam list-attached-role-policies --role-name %%i --query "AttachedPolicies[].PolicyArn" --output text 2^>nul') do (
        aws iam detach-role-policy --role-name %%i --policy-arn %%p 2>nul
    )
    echo Deleting inline policies...
    for /f "tokens=*" %%p in ('aws iam list-role-policies --role-name %%i --query "PolicyNames[]" --output text 2^>nul') do (
        aws iam delete-role-policy --role-name %%i --policy-name %%p 2>nul
    )
    echo Deleting role: %%i
    aws iam delete-role --role-name %%i 2>nul
    if !errorlevel! equ 0 (echo ✓ IAM role deleted) else (echo ✗ Failed to delete IAM role)
)
echo.

echo Deleting Lambda Application...
aws serverlessrepo delete-application --application-id tiffin-management-api-prod --region %REGION% 2>nul
echo.

echo ========================================
echo Cleanup Complete!
echo ========================================
pause
