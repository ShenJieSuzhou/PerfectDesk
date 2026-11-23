# 重新生成 js/items-data.js（替换 assets/items 下的图片后运行）
$d = Split-Path $PSScriptRoot -Parent
$sb = New-Object System.Text.StringBuilder
[void]$sb.Append("/* 由 tools/build-item-data.ps1 生成：物品图片内嵌数据，仅在生成分享海报时按需加载 */`nwindow.PW_ITEM_DATA={")
for ($n = 1; $n -le 100; $n++) {
  $b = [Convert]::ToBase64String([IO.File]::ReadAllBytes(("$d\assets\items\{0:000}.png" -f $n)))
  [void]$sb.Append("$($n):'data:image/png;base64,$b'"); if ($n -lt 100) { [void]$sb.Append(',') }
}
[void]$sb.Append("};`n")
[IO.File]::WriteAllText("$d\js\items-data.js", $sb.ToString(), (New-Object Text.UTF8Encoding $false))
'done'
