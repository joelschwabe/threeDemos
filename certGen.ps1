# Set variables
$certName = "localhost"
$keyFile = ".\selfsigned.key"
$crtFile = ".\selfsigned.crt"

# Create self-signed certificate (valid for 1 year)
$cert = New-SelfSignedCertificate -DnsName $certName -CertStoreLocation Cert:\CurrentUser\My -KeyExportPolicy Exportable -NotAfter (Get-Date).AddYears(1)

# Export private key + cert to PFX file (temporary)
$pfxFile = ".\temp.pfx"
$password = ConvertTo-SecureString -String "P@ssw0rd!" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxFile -Password $password

# Export private key to .key (PEM format)
openssl pkcs12 -in $pfxFile -nocerts -nodes -passin pass:P@ssw0rd! -out $keyFile

# Export cert to .crt (PEM format)
openssl pkcs12 -in $pfxFile -clcerts -nokeys -passin pass:P@ssw0rd! -out $crtFile

# Clean up temp file
Remove-Item $pfxFile

Write-Host "Certificate generated:"
Write-Host " - $crtFile"
Write-Host " - $keyFile"