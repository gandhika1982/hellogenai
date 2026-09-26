$ErrorActionPreference = "Stop"
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

function Send-Response($Response) {
    $json = ConvertTo-Json -InputObject $Response -Depth 32 -Compress
    [Console]::Out.WriteLine($json)
    [Console]::Out.Flush()
}

function Get-Tools {
    return @(
        @{
            name = "echo"
            description = "Return a confirmation containing the supplied text."
            inputSchema = @{
                type = "object"
                properties = @{
                    message = @{ type = "string"; description = "Message to echo." }
                }
                required = @("message")
                additionalProperties = $false
            }
        },
        @{
            name = "get_time"
            description = "Return the current local time with its UTC offset."
            inputSchema = @{
                type = "object"
                properties = @{}
                required = @()
                additionalProperties = $false
            }
        },
        @{
            name = "calculate"
            description = "Calculate two numbers using the requested arithmetic operation."
            inputSchema = @{
                type = "object"
                properties = @{
                    a = @{ type = "number"; description = "First operand." }
                    b = @{ type = "number"; description = "Second operand." }
                    operation = @{
                        type = "string"
                        enum = @("add", "subtract", "multiply", "divide")
                        description = "Arithmetic operation."
                    }
                }
                required = @("a", "b", "operation")
                additionalProperties = $false
            }
        }
    )
}

while ($null -ne ($line = [Console]::In.ReadLine())) {
    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    try {
        $message = ConvertFrom-Json -InputObject $line
        $method = $message.method
        $id = $message.id

        if ($method -eq "notifications/initialized" -or $method -eq "notifications/cancelled") {
            continue
        }

        switch ($method) {
            "initialize" {
                $requestedVersion = $message.params.protocolVersion
                if ([string]::IsNullOrWhiteSpace($requestedVersion)) {
                    $requestedVersion = "2025-03-26"
                }
                $result = @{
                    protocolVersion = $requestedVersion
                    capabilities = @{ tools = @{ listChanged = $false } }
                    serverInfo = @{ name = "echo-windows"; version = "1.0.0" }
                    instructions = "Local text utilities only; no network access is used."
                }
                Send-Response @{ jsonrpc = "2.0"; id = $id; result = $result }
            }
            "ping" {
                Send-Response @{ jsonrpc = "2.0"; id = $id; result = @{} }
            }
            "tools/list" {
                $tools = @(Get-Tools)
                Send-Response @{ jsonrpc = "2.0"; id = $id; result = @{ tools = $tools } }
            }
            "tools/call" {
                $toolName = $message.params.name
                $arguments = $message.params.arguments
                $text = $null
                $isError = $false
                switch ($toolName) {
                    "echo" {
                        if ($null -eq $arguments -or
                            $null -eq $arguments.PSObject.Properties["message"] -or
                            $arguments.message -isnot [string]) {
                            $text = "Invalid arguments: provide a string argument named 'message'."
                            $isError = $true
                        }
                        else {
                            $text = "Echo: $($arguments.message)"
                        }
                    }
                    "get_time" {
                        $text = (Get-Date).ToString("o", [Globalization.CultureInfo]::InvariantCulture)
                    }
                    "calculate" {
                        $a = [decimal]0
                        $b = [decimal]0
                        $validA = $null -ne $arguments -and
                            [decimal]::TryParse(
                                [string]$arguments.a,
                                [Globalization.NumberStyles]::Float,
                                [Globalization.CultureInfo]::InvariantCulture,
                                [ref]$a
                            )
                        $validB = $null -ne $arguments -and
                            [decimal]::TryParse(
                                [string]$arguments.b,
                                [Globalization.NumberStyles]::Float,
                                [Globalization.CultureInfo]::InvariantCulture,
                                [ref]$b
                            )
                        $operation = if ($null -ne $arguments) { [string]$arguments.operation } else { "" }
                        if (-not $validA -or -not $validB) {
                            $text = "Invalid arguments: 'a' and 'b' must be numbers."
                            $isError = $true
                        }
                        else {
                            switch ($operation) {
                                "add" { $value = $a + $b }
                                "subtract" { $value = $a - $b }
                                "multiply" { $value = $a * $b }
                                "divide" {
                                    if ($b -eq 0) {
                                        $text = "Invalid calculation: division by zero."
                                        $isError = $true
                                    }
                                    else {
                                        $value = $a / $b
                                    }
                                }
                                default {
                                    $text = "Invalid operation: choose add, subtract, multiply, or divide."
                                    $isError = $true
                                }
                            }
                            if (-not $isError) {
                                $text = $value.ToString([Globalization.CultureInfo]::InvariantCulture)
                            }
                        }
                    }
                    default {
                        $text = "Unknown tool: $toolName"
                        $isError = $true
                    }
                }
                $content = @(@{ type = "text"; text = $text })
                Send-Response @{ jsonrpc = "2.0"; id = $id; result = @{ content = $content; isError = $isError } }
            }
            default {
                if ($null -ne $id) {
                    Send-Response @{
                        jsonrpc = "2.0"
                        id = $id
                        error = @{ code = -32601; message = "Method not found: $method" }
                    }
                }
            }
        }
    }
    catch {
        [Console]::Error.WriteLine($_.Exception.Message)
    }
}
