FROM node:13.8.0-alpine3.11
RUN yarn global add parcel@next
CMD [ "parcel" ]
