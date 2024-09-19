sh gradlew bootJar
mkdir -p build/output
version=$(sh gradlew properties | grep "version:" | sed 's/version: //')
echo $version
find build/libs/ -maxdepth 1 -name "CoRe-$version*.jar" ! -name "*-plain.jar" -exec cp {} build/output/ \;
