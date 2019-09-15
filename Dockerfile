FROM node:8.7

WORKDIR /app

RUN mkdir -p /app

COPY . /app

RUN cd /app && \
    npm install && \
    chmod +x run_good_voter.sh

CMD [ "/bin/bash", "run_good_voter.sh" ]