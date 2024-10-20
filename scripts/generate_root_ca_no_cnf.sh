mkdir -p ~/ca
# 检查 rootCA.key 文件是否存在
if [ -f "$HOME/ca/rootCA.key" ]; then
    echo "rootCA.key 文件已存在，退出脚本。"
    exit 0
fi
# 生成根私钥
openssl genrsa -out ~/ca/rootCA.key 4096

# 检查 rootCA.key 文件是否存在
if [ -f "$HOME/ca/rootCA.crt" ]; then
    echo "rootCA.crt 文件已存在，退出脚本。"
    exit 0
fi
# 生成根证书
openssl req -x509 -new -nodes -key ~/ca/rootCA.key -sha256 -days 3650 -out ~/ca/rootCA.crt -subj "/CN=My Root CA"