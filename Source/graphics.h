#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <stdio.h>
#include <stdlib.h>

// Graphics constants
#define YELLOW 14
#define LIGHTBLUE 9
#define WHITE 15
#define HORIZ_DIR 0
#define SOLID_FILL 1
#define BLUE 1
#define RED 4
#define LIGHTGRAY 7
#define BLINK 128
#define DETECT 0

// Graphics functions
void initgraph(int* graphdriver, int* graphmode, const char* pathtodriver);
void closegraph(void);
void cleardevice(void);
int getmaxx(void);
int getmaxy(void);
void setcolor(int color);
void setbkcolor(int color);
void settextstyle(int font, int direction, int size);
void setfillstyle(int pattern, int color);
void bar(int left, int top, int right, int bottom);
void rectangle(int left, int top, int right, int bottom);
void outtextxy(int x, int y, const char* str);
void gotoxy(int x, int y);
int getch(void);

// Drawing functions
void recta(float x1, float y1, float x2, float y2);
void recta1(int x1, int y1, int x2, int y2, int re_pos);

// Random number functions
void randomize(void);
int custom_random(int max);

#endif // GRAPHICS_H 