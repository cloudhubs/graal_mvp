FROM ubuntu:20.04

RUN apt-get -y update
RUN apt-get install -y python python3 python3-distutils git wget gcc make g++ build-essential libz-dev zlib1g-dev vim zsh htop unzip curl

# Clone all the repositories
RUN git clone https://github.com/graalvm/mx.git
RUN git clone https://github.com/cloudhubs/graal.git
RUN git clone https://github.com/cloudhubs/graal-prophet-utils.git
RUN git clone https://github.com/cloudhubs/graal_mvp.git
RUN git clone https://github.com/FudanSELab/train-ticket.git

# Download and setup appropriate JDK version with JVMCI
RUN wget https://github.com/graalvm/labs-openjdk-17/releases/download/jvmci-23.0-b22/labsjdk-ce-17.0.9+9-jvmci-23.0-b22-linux-amd64.tar.gz
RUN tar xf labsjdk-ce-17.0.9+9-jvmci-23.0-b22-linux-amd64.tar.gz
ENV JAVA_HOME=/labsjdk-ce-17.0.9-jvmci-23.0-b22

# Build Graal and setup GRAAL_PROPHET_HOME
ENV PATH "$PATH:/mx"
RUN cd /graal/substratevm && mx build
RUN echo 'export GRAAL_PROPHET_HOME=$(mx -p /graal/substratevm graalvm-home)' >> /envfile

# Prepare maven for building remaining Java projects
RUN wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
RUN tar -xf apache-maven-3.9.6-bin.tar.gz
RUN mv apache-maven-3.9.6 /opt/
ENV M2_HOME='/opt/apache-maven-3.9.6'
ENV PATH="$M2_HOME/bin:$PATH"

ENV PROPHET_PLUGIN_HOME /

# Compile trainticket
RUN cd /train-ticket && mvn install -DskipTests=true
# Unpack the fatjars for simpler processing
RUN bash /graal-prophet-utils/microservice-setup.sh

# Compile and setup graal-prophet-utils
RUN cd /graal-prophet-utils && mvn clean package -DskipTests=true -X

# Run the analysis
RUN . /envfile; cd /graal-prophet-utils && $JAVA_HOME/bin/java -jar target/graal-prophet-utils-0.0.8.jar ./config/trainticket-microservices.json true

# Copy the output files to the visualizer's data folder, so that they are loaded by default
RUN cp /graal-prophet-utils/output_trainticket/entities.json /graal_mvp/frontend/src/data/contextMap.json
RUN cp /graal-prophet-utils/output_trainticket/communicationGraph.json /graal_mvp/frontend/src/data/communicationGraph.json

# Install npm
RUN curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
RUN bash /tmp/nodesource_setup.sh
RUN apt-get install -y nodejs

# Build the visualizer
RUN cd /graal_mvp/frontend && npm install

# Start the visualizer when the container is started
ENTRYPOINT cd /graal_mvp/frontend && npm start
EXPOSE 3000