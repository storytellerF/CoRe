mkdir ~/ca -p
# 生成根私钥
openssl genrsa -out ~/ca/rootCA.key 4096

# 生成根证书
openssl req -x509 -new -nodes -key ~/ca/rootCA.key -sha256 -days 3650 -out ~/ca/rootCA.crt -config ../root.cnf
