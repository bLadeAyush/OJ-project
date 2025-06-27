FROM gcc:12.2

WORKDIR /app

COPY run.cpp /run.cpp

CMD ["sh", "-c", "g++ /run.cpp -o /runner && /runner"]
