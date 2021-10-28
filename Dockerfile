FROM node:12 as pulumi_dash

WORKDIR /home/execution-module

ENV PATH /home/execution-module/.bin:$PATH

COPY package.json ./
# COPY package-lock.json ./

ARG PULUMI_BASE_URL
ENV PULUMI_BASE_URL $PULUMI_BASE_URL

ENV PATH /root/.pulumi/bin:$PATH

RUN curl -fsSL https://get.pulumi.com | sh

# add pulumi-backend
COPY . .

#Build the
EXPOSE 6792

RUN npm install

CMD [ "npm", "start" ]

