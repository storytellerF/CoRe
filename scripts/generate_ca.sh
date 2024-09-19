# 生成根私钥
openssl genrsa -out rootCA.key 4096

# 生成根证书
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 3650 -out rootCA.crt -subj "/CN=My Root CA"

# 生成服务器私钥
openssl genrsa -out server.key 2048

# 生成服务器的 CSR（证书签名请求）
openssl req -new -key server.key -out server.csr -config ../san.cnf

# 使用根证书签署服务器证书
openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile ../san.cnf -extensions req_ext

# 验证服务器证书
openssl x509 -in server.crt -text -noout

# 安装
# sudo cp rootCA.crt /usr/local/share/ca-certificates/
# sudo update-ca-certificates

openssl pkcs12 -export -in server.crt -inkey server.key -out keystore.p12 -name my-alias
