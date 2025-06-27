#include <cstdlib>

int main() {
    system("g++ /app/main.cpp -o /app/main.out");
    system("/app/main.out < /app/input.txt");
    return 0;
}
