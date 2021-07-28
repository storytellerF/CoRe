FROM openjdk:1.8


COPY build/libs/CoRe-0.0.1-SNAPSHOT.jar /root/
ENV CoRe CoRe-0.0.1-SNAPSHOT.jar

WORKDIR /root/

ENTRYPOINT java -jar $CoRe