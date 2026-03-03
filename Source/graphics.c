#include "graphics.h"
#include <time.h>

// Global variables for screen dimensions
static int screen_width = 800;
static int screen_height = 600;

void initgraph(int* graphdriver, int* graphmode, const char* pathtodriver) {
    // Initialize random number generator
    srand(time(NULL));
}

void closegraph(void) {
    // Nothing to do in console mode
}

void cleardevice(void) {
    printf("\033[2J\033[H"); // Clear screen and move cursor to home position
}

int getmaxx(void) {
    return screen_width;
}

int getmaxy(void) {
    return screen_height;
}

void setcolor(int color) {
    printf("\033[%dm", color + 30); // Set text color
}

void setbkcolor(int color) {
    printf("\033[%dm", color + 40); // Set background color
}

void settextstyle(int font, int direction, int size) {
    // Not implemented in console mode
}

void setfillstyle(int pattern, int color) {
    // Not implemented in console mode
}

void bar(int left, int top, int right, int bottom) {
    // Draw a filled rectangle in console mode
    for(int y = top; y <= bottom; y++) {
        gotoxy(left, y);
        for(int x = left; x <= right; x++) {
            printf("#");
        }
    }
}

void rectangle(int left, int top, int right, int bottom) {
    // Draw a rectangle outline in console mode
    gotoxy(left, top);
    for(int x = left; x <= right; x++) printf("-");
    
    for(int y = top + 1; y < bottom; y++) {
        gotoxy(left, y); printf("|");
        gotoxy(right, y); printf("|");
    }
    
    gotoxy(left, bottom);
    for(int x = left; x <= right; x++) printf("-");
}

void outtextxy(int x, int y, const char* str) {
    gotoxy(x, y);
    printf("%s", str);
}

void gotoxy(int x, int y) {
    printf("\033[%d;%dH", y + 1, x + 1);
}

int getch(void) {
    char ch;
    system("/bin/stty raw");
    ch = getchar();
    system("/bin/stty cooked");
    return ch;
}

void randomize(void) {
    srand(time(NULL));
}

int custom_random(int max) {
    return rand() % max;
}

// Drawing functions
void recta(float x1, float y1, float x2, float y2) {
    // Draw a rectangle using floating point coordinates
    int ix1 = (int)x1;
    int iy1 = (int)y1;
    int ix2 = (int)x2;
    int iy2 = (int)y2;
    rectangle(ix1, iy1, ix2, iy2);
}

void recta1(int x1, int y1, int x2, int y2, int re_pos) {
    // Draw a rectangle with a number
    rectangle(x1, y1, x2, y2);
    char str[10];
    sprintf(str, "%d", re_pos + 1);
    outtextxy(x1 + 5, y1 + 5, str);
} 